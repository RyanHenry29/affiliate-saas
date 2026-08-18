import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { randomBytes, createHash } from 'node:crypto';

@Injectable()
export class ApiKeysService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, name: string) {
    const rawKey = `sk_${randomBytes(32).toString('hex')}`;
    const keyHash = createHash('sha256').update(rawKey).digest('hex');
    const prefix = rawKey.substring(0, 8);

    await this.prisma.apiKey.create({
      data: { name, keyHash, prefix, tenantId, isActive: true },
    });

    return { key: rawKey, name, prefix };
  }

  async list(tenantId: string) {
    const keys = await this.prisma.apiKey.findMany({
      where: { tenantId },
      select: { id: true, name: true, prefix: true, isActive: true, createdAt: true, lastUsedAt: true },
      orderBy: { createdAt: 'desc' },
    });
    return keys.map((k) => ({ ...k, maskedKey: `${k.prefix}...` }));
  }

  async revoke(tenantId: string, id: string) {
    const key = await this.prisma.apiKey.findFirst({ where: { id, tenantId } });
    if (!key) throw new NotFoundException('API Key não encontrada');
    return this.prisma.apiKey.update({ where: { id }, data: { isActive: false } });
  }

  async validate(rawKey: string): Promise<{ tenantId: string } | null> {
    const keyHash = createHash('sha256').update(rawKey).digest('hex');
    const key = await this.prisma.apiKey.findFirst({
      where: { keyHash, isActive: true },
    });
    if (!key) return null;
    await this.prisma.apiKey.update({ where: { id: key.id }, data: { lastUsedAt: new Date() } });
    return { tenantId: key.tenantId };
  }
}
