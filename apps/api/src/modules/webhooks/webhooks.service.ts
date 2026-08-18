import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateWebhookDto } from './dto/create-webhook.dto';
import { UpdateWebhookDto } from './dto/update-webhook.dto';

@Injectable()
export class WebhooksService {
  constructor(private prisma: PrismaService) {}

  async list(tenantId: string) {
    return this.prisma.webhookEndpoint.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(tenantId: string, dto: CreateWebhookDto) {
    return this.prisma.webhookEndpoint.create({
      data: { ...dto, tenantId, isActive: true },
    });
  }

  async update(tenantId: string, id: string, dto: UpdateWebhookDto) {
    const webhook = await this.prisma.webhookEndpoint.findFirst({ where: { id, tenantId } });
    if (!webhook) throw new NotFoundException('Webhook não encontrado');
    return this.prisma.webhookEndpoint.update({ where: { id }, data: dto });
  }

  async remove(tenantId: string, id: string) {
    const webhook = await this.prisma.webhookEndpoint.findFirst({ where: { id, tenantId } });
    if (!webhook) throw new NotFoundException('Webhook não encontrado');
    return this.prisma.webhookEndpoint.delete({ where: { id } });
  }
}
