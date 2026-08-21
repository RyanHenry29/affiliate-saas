import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { createHash } from 'crypto';
import { ImportOfferDto } from './dto/import-offer.dto';
import { AiProviderService } from '../ai-provider/ai-provider.service';
import { QueuesService } from '../queues/queues.service';

@Injectable()
export class OffersService {
  constructor(
    private prisma: PrismaService,
    private aiProvider: AiProviderService,
    private queues: QueuesService,
  ) {}

  private readonly logger = new Logger(OffersService.name);

  async list(
    tenantId: string,
    isAdmin: boolean,
    filters: { marketplace?: string; niche?: string; q?: string; status?: string; page?: string; limit?: string } = {},
  ) {
    const where: Record<string, unknown> = {};
    if (!isAdmin) where.status = 'PUBLISHED';
    if (filters.marketplace) where.marketplace = filters.marketplace;
    if (filters.niche) where.nicheTag = filters.niche;
    if (filters.status && isAdmin) where.status = filters.status;
    if (filters.q) {
      where.OR = [{ title: { contains: filters.q, mode: 'insensitive' } }];
    }

    const page = Number(filters.page) || 1;
    const limit = Math.min(Number(filters.limit) || 50, 100);
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.offer.findMany({
        where,
        orderBy: { scrapedAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.offer.count({ where }),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async aiSearch(tenantId: string, isAdmin: boolean, query: string) {
    if (!query || !query.trim()) {
      return this.list(tenantId, isAdmin, {});
    }

    const systemPrompt = `Você é o interpretador de buscas inteligente do SaaS de afiliados.
Sua tarefa é analisar a pesquisa do usuário em linguagem natural e responder estritamente com um objeto JSON representando os filtros estruturados a serem aplicados no banco de dados.

O JSON deve seguir exatamente a seguinte estrutura (responda APENAS o JSON, sem markdown e sem tags de bloco como \`\`\`json):
{
  "q": "termo simples de texto para busca, ex: 'fone bluetooth', 'panela' (opcional)",
  "marketplace": "shopee ou amazon ou aliexpress ou awin (opcional, tudo em minúsculo)",
  "nicheTag": "um dos nichos válidos: AUTOMOTIVO, BEBE, DONA_DE_CASA, GERAL (opcional)",
  "minDiscount": "número indicando a porcentagem de desconto mínima desejada, ex: 15 (opcional)",
  "maxPriceCents": "número indicando o preço máximo em centavos, ex: 10000 para R$ 100 (opcional)"
}

Exemplo de entrada: "promoções de fone de ouvido da shopee com mais de 20% de desconto"
Exemplo de saída:
{"q": "fone ouvido", "marketplace": "shopee", "minDiscount": 20}

Exemplo de entrada: "fritadeira eletrica ate 300 reais"
Exemplo de saída:
{"q": "fritadeira eletrica", "maxPriceCents": 30000}`;

    let parsedFilters: any = {};
    try {
      const aiResult = await this.aiProvider.generateFirstActive(
        tenantId,
        `Pesquisa do usuário: "${query}"`,
        systemPrompt
      );
      let cleanContent = aiResult.content.trim();
      if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.replace(/^```(json)?\n?/, '').replace(/\n?```$/, '');
      }
      parsedFilters = JSON.parse(cleanContent);
    } catch (error) {
      return this.list(tenantId, isAdmin, { q: query });
    }

    const where: Record<string, any> = {};
    if (!isAdmin) where.status = 'PUBLISHED';

    if (parsedFilters.marketplace) {
      where.marketplace = parsedFilters.marketplace.toLowerCase();
    }
    if (parsedFilters.nicheTag) {
      where.nicheTag = parsedFilters.nicheTag.toUpperCase();
    }
    if (parsedFilters.q) {
      where.title = { contains: parsedFilters.q, mode: 'insensitive' };
    }
    if (parsedFilters.minDiscount) {
      where.discountPercent = { gte: Number(parsedFilters.minDiscount) };
    }
    if (parsedFilters.maxPriceCents) {
      where.priceCents = { lte: Number(parsedFilters.maxPriceCents) };
    }

    return this.prisma.offer.findMany({
      where,
      orderBy: { scrapedAt: 'desc' },
    });
  }

  async setStatus(offerId: string, status: 'PUBLISHED' | 'IGNORED' | 'PENDING', tenantId: string, userId: string) {
    const offer = await this.prisma.offer.findUnique({ where: { id: offerId } });
    if (!offer) throw new NotFoundException('Oferta não encontrada.');

    const updated = await this.prisma.offer.update({
      where: { id: offerId },
      data: {
        status,
        dispatched: status === 'PUBLISHED',
      },
    });

    if (status === 'PUBLISHED') {
      const group = await this.prisma.group.findFirst({
        where: { tenantId, active: true, nicheTags: { has: offer.nicheTag } },
        orderBy: { createdAt: 'asc' },
      });
      if (group) {
        const existingJob = await this.prisma.dispatchJob.findFirst({
          where: {
            tenantId,
            offerId: offer.id,
            groupId: group.id,
            status: { in: ['PENDING', 'SENT'] },
          },
        });
        if (existingJob) {
          this.logger.log(
            `Dispatch já existe para oferta ${offer.id} no grupo ${group.id} (job ${existingJob.id}) — ignorando duplicado.`,
          );
        } else {
          const dispatchJob = await this.prisma.dispatchJob.create({
            data: {
              tenantId,
              offerId: offer.id,
              groupId: group.id,
              status: 'PENDING',
              scheduledFor: new Date(),
            },
          });
          try {
            await this.queues.enqueueDispatch({
              dispatchJobId: dispatchJob.id,
              tenantId,
              offerId: offer.id,
              groupId: group.id,
            });
          } catch (err) {
            this.logger.error(`Falha ao enfileirar dispatch job ${dispatchJob.id}:`, err);
          }
        }
      }
    }

    await this.prisma.auditLog.create({
      data: {
        tenantId,
        userId,
        action: status === 'PUBLISHED' ? 'OFFER_PUBLISHED' : status === 'IGNORED' ? 'OFFER_IGNORED' : 'OFFER_REOPENED',
        entity: 'Offer',
        entityId: offer.id,
        details: { title: offer.title, marketplace: offer.marketplace },
      },
    });

    return updated;
  }

  async mine(_tenantId: string) {
    return this.prisma.offer.findMany({
      where: { marketplace: 'shopee' },
      orderBy: { scrapedAt: 'desc' },
    });
  }

  async getShopeeOffers(_tenantId: string) {
    return this.prisma.offer.findMany({
      where: { marketplace: 'shopee' },
      orderBy: { scrapedAt: 'desc' },
    });
  }

  async importOffer(dto: ImportOfferDto, _tenantId: string) {
    if (!dto.title && !dto.priceCents) {
      throw new BadRequestException('Informe ao menos um título ou preço para a oferta.');
    }

    const dedupeHash = createHash('sha256')
      .update(`${dto.marketplace}:${dto.affiliateUrl}`)
      .digest('hex');

    const existing = await this.prisma.offer.findUnique({ where: { dedupeHash } });
    if (existing) {
      if (dto.priceCents && dto.priceCents !== existing.priceCents) {
        const originalPriceCents = dto.originalPriceCents ?? existing.originalPriceCents;
        const discountPercent =
          originalPriceCents > 0
            ? Math.round((1 - dto.priceCents / originalPriceCents) * 1000) / 10
            : 0;
        await this.prisma.offer.update({
          where: { id: existing.id },
          data: { priceCents: dto.priceCents, originalPriceCents, discountPercent },
        });
        await this.prisma.offerPriceHistory.create({
          data: { offerId: existing.id, priceCents: dto.priceCents },
        });
      }
      return { offer: existing, duplicate: true };
    }

    const priceCents = dto.priceCents ?? 0;
    const originalPriceCents = dto.originalPriceCents ?? priceCents;
    const discountPercent =
      originalPriceCents > 0
        ? Math.round((1 - priceCents / originalPriceCents) * 1000) / 10
        : 0;

    const offer = await this.prisma.offer.create({
      data: {
        marketplace: dto.marketplace,
        externalSku: createHash('sha1').update(dedupeHash).digest('hex').slice(0, 24),
        title: dto.title ?? 'Oferta importada manualmente',
        affiliateUrl: dto.affiliateUrl,
        imageUrl: dto.imageUrl || null,
        priceCents,
        originalPriceCents,
        discountPercent,
        nicheTag: dto.nicheTag ?? 'GERAL',
        dedupeHash,
      },
    });

    await this.prisma.offerPriceHistory.create({
      data: { offerId: offer.id, priceCents },
    });

    return { offer, duplicate: false };
  }

  async priceHistory(offerId: string) {
    const history = await this.prisma.offerPriceHistory.findMany({
      where: { offerId },
      orderBy: { createdAt: 'asc' },
    });
    return history.map((h) => ({
      priceCents: h.priceCents,
      createdAt: h.createdAt,
    }));
  }

  async mineShopee() {
    const [total, dispatched] = await Promise.all([
      this.prisma.offer.count({ where: { marketplace: 'shopee' } }),
      this.prisma.offer.count({ where: { marketplace: 'shopee', dispatched: true } }),
    ]);
    return { inserted: total, duplicates: 0, dispatched };
  }
}