import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class OffersService {
  constructor(private prisma: PrismaService) {}

  async list(tenantId: string, isAdmin: boolean) {
    if (isAdmin) {
      return this.prisma.offer.findMany({
        where: { tenantId },
        orderBy: { createdAt: 'desc' },
      });
    }
    return this.prisma.offer.findMany({
      where: { tenantId, dispatched: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async mine(tenantId: string) {
    return this.prisma.offer.findMany({
      where: { tenantId, platform: 'shopee' },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getShopeeOffers(tenantId: string) {
    return this.prisma.offer.findMany({
      where: { tenantId, platform: 'shopee' },
      orderBy: { createdAt: 'desc' },
    });
  }
}
