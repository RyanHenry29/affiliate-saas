import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpsertFeatureFlagDto } from './dto/upsert-feature-flag.dto';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async listTenants() {
    return this.prisma.tenant.findMany({
      include: { _count: { select: { users: true, groups: true, offers: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createTenant(dto: CreateTenantDto) {
    return this.prisma.tenant.create({ data: dto });
  }

  async updateTenant(id: string, data: Partial<CreateTenantDto>) {
    const tenant = await this.prisma.tenant.findUnique({ where: { id } });
    if (!tenant) throw new NotFoundException('Tenant não encontrado');
    return this.prisma.tenant.update({ where: { id }, data });
  }

  async removeTenant(id: string) {
    const tenant = await this.prisma.tenant.findUnique({ where: { id } });
    if (!tenant) throw new NotFoundException('Tenant não encontrado');
    return this.prisma.tenant.delete({ where: { id } });
  }

  async metrics() {
    const [tenants, users, groups, offers, connections] = await Promise.all([
      this.prisma.tenant.count(),
      this.prisma.user.count(),
      this.prisma.group.count(),
      this.prisma.offer.count(),
      this.prisma.connection.count(),
    ]);
    return { tenants, users, groups, offers, connections };
  }

  async listFeatureFlags(tenantId?: string) {
    return this.prisma.featureFlag.findMany({
      where: tenantId ? { tenantId } : {},
      orderBy: { createdAt: 'desc' },
    });
  }

  async upsertFeatureFlag(dto: UpsertFeatureFlagDto) {
    const existing = await this.prisma.featureFlag.findFirst({
      where: { key: dto.key, tenantId: dto.tenantId || null },
    });
    if (existing) {
      return this.prisma.featureFlag.update({ where: { id: existing.id }, data: dto });
    }
    return this.prisma.featureFlag.create({ data: dto });
  }

  async removeFeatureFlag(id: string) {
    return this.prisma.featureFlag.delete({ where: { id } });
  }

  async adminPixPayment(tenantId: string, amount: number) {
    return this.prisma.payment.create({
      data: {
        tenantId,
        amount,
        method: 'PIX',
        status: 'PENDING',
        type: 'ADMIN',
      },
    });
  }
}
