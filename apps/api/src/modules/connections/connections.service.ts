import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { encryptSecret, decryptSecret } from '../../common/crypto.util';
import { UpsertCredentialDto } from './dto/upsert-credential.dto';

const MARKETPLACE_CATALOG = [
  { id: 'shopee', name: 'Shopee', fields: ['affiliateId', 'accessToken'] },
  { id: 'mercadolivre', name: 'Mercado Livre', fields: ['clientId', 'clientSecret', 'accessToken'] },
  { id: 'amazon', name: 'Amazon', fields: ['accessKey', 'secretKey', 'partnerTag'] },
  { id: 'aliexpress', name: 'AliExpress', fields: ['appId', 'appKey'] },
  { id: 'magalu', name: 'Magazine Luiza', fields: ['apiKey', 'secretKey'] },
  { id: 'americanas', name: 'Americanas', fields: ['apiKey', 'apiSecret'] },
  { id: 'casas-bahia', name: 'Casas Bahia', fields: ['apiKey', 'apiSecret'] },
  { id: 'kabum', name: 'KaBuM!', fields: ['apiKey', 'clientSecret'] },
];

@Injectable()
export class ConnectionsService {
  private encryptionKey: string;

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {
    this.encryptionKey = this.config.get<string>('ENCRYPTION_KEY', 'dev-encryption-key-change-in-production');
  }

  catalog() {
    return MARKETPLACE_CATALOG;
  }

  async list(tenantId: string) {
    return this.prisma.connection.findMany({
      where: { tenantId },
      select: {
        id: true,
        marketplace: true,
        label: true,
        isActive: true,
        lastSyncAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async upsert(tenantId: string, dto: UpsertCredentialDto) {
    const encrypted = encryptSecret(JSON.stringify(dto.credentials), this.encryptionKey);
    const existing = await this.prisma.connection.findFirst({
      where: { tenantId, marketplace: dto.marketplace },
    });

    if (existing) {
      return this.prisma.connection.update({
        where: { id: existing.id },
        data: { credentialsEncrypted: encrypted, label: dto.label || existing.label },
      });
    }

    return this.prisma.connection.create({
      data: {
        marketplace: dto.marketplace,
        label: dto.label || dto.marketplace,
        credentialsEncrypted: encrypted,
        tenantId,
        isActive: true,
      },
    });
  }

  async remove(tenantId: string, id: string) {
    const conn = await this.prisma.connection.findFirst({ where: { id, tenantId } });
    if (!conn) throw new NotFoundException('Conexão não encontrada');
    return this.prisma.connection.delete({ where: { id } });
  }

  async sync(tenantId: string, id: string) {
    const conn = await this.prisma.connection.findFirst({ where: { id, tenantId } });
    if (!conn) throw new NotFoundException('Conexão não encontrada');

    await this.prisma.connection.update({
      where: { id },
      data: { lastSyncAt: new Date() },
    });

    return { success: true, lastSyncAt: new Date() };
  }

  async importLink(tenantId: string, marketplace: string, externalUrl: string) {
    return this.prisma.connection.create({
      data: {
        marketplace,
        label: `Import ${marketplace}`,
        credentialsEncrypted: '',
        tenantId,
        isActive: true,
        metadata: { externalUrl },
      },
    });
  }
}
