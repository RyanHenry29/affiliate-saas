import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpsertFeatureFlagDto } from './dto/upsert-feature-flag.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { UpdatePaymentConfigDto } from './dto/update-payment-config.dto';
import { SetTenantSubscriptionDto } from './dto/set-tenant-subscription.dto';

const VALID_ROLES = ['OWNER', 'ADMIN_MASTER', 'OPERATOR', 'MEMBER', 'ANALYST', 'VIEWER'];

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  // ---------- Tenants ----------

  async listTenants() {
    return this.prisma.tenant.findMany({
      include: {
        _count: { select: { users: true, groups: true, instances: true } },
        subscription: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createTenant(dto: CreateTenantDto) {
    const tenant = await this.prisma.tenant.create({ data: { name: dto.name } });
    if (dto.plan) {
      await this.prisma.subscription.create({
        data: {
          tenantId: tenant.id,
          plan: dto.plan as any,
          status: 'TRIALING' as any,
          externalCustomerId: tenant.id,
          currentPeriodEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });
    }
    return tenant;
  }

  async updateTenant(id: string, data: Partial<CreateTenantDto>) {
    const tenant = await this.prisma.tenant.findUnique({ where: { id } });
    if (!tenant) throw new NotFoundException('Tenant não encontrado');
    return this.prisma.tenant.update({ where: { id }, data: { name: data.name } });
  }

  async removeTenant(id: string) {
    const tenant = await this.prisma.tenant.findUnique({ where: { id } });
    if (!tenant) throw new NotFoundException('Tenant não encontrado');
    if (tenant.isAdminMaster) {
      throw new NotFoundException('Não é possível excluir o tenant administrador');
    }
    return this.prisma.tenant.delete({ where: { id } });
  }

  async setTenantSubscription(id: string, dto: SetTenantSubscriptionDto) {
    const tenant = await this.prisma.tenant.findUnique({ where: { id } });
    if (!tenant) throw new NotFoundException('Tenant não encontrado');

    const data = {
      plan: dto.plan,
      status: dto.status,
      currentPeriodEnd: dto.currentPeriodEnd
        ? new Date(dto.currentPeriodEnd)
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    };

    const existing = await this.prisma.subscription.findUnique({
      where: { tenantId: id },
    });
    if (existing) {
      return this.prisma.subscription.update({ where: { id: existing.id }, data });
    }
    return this.prisma.subscription.create({
      data: { tenantId: id, externalCustomerId: id, ...data },
    });
  }

  async metrics() {
    const [tenants, users, groups, offers, connections, instances, dispatches, payments] =
      await Promise.all([
        this.prisma.tenant.count(),
        this.prisma.user.count(),
        this.prisma.group.count(),
        this.prisma.offer.count(),
        this.prisma.connection.count(),
        this.prisma.messagingInstance.count(),
        this.prisma.dispatchJob.count(),
        this.prisma.payment.count(),
      ]);
    return { tenants, users, groups, offers, connections, instances, dispatches, payments };
  }

  // ---------- Usuários globais ----------

  async listUsers() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        tenant: { select: { id: true, name: true, isAdminMaster: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async setUserRole(userId: string, role: string) {
    if (!VALID_ROLES.includes(role)) {
      throw new BadRequestException(`Role inválida. Valores aceitos: ${VALID_ROLES.join(', ')}`);
    }
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuário não encontrado');
    return this.prisma.user.update({ where: { id: userId }, data: { role } });
  }

  async setUserStatus(userId: string, isActive: boolean) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuário não encontrado');
    return this.prisma.user.update({ where: { id: userId }, data: { isActive } });
  }

  async removeUser(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuário não encontrado');
    return this.prisma.user.delete({ where: { id: userId } });
  }

  // ---------- Planos / preços ----------

  async listPlans() {
    return this.prisma.planConfig.findMany({ orderBy: { priceCents: 'asc' } });
  }

  async updatePlan(tier: string, dto: UpdatePlanDto) {
    const existing = await this.prisma.planConfig.findUnique({ where: { tier: tier as any } });
    if (!existing) throw new NotFoundException('Plano não encontrado');
    return this.prisma.planConfig.update({
      where: { tier: tier as any },
      data: {
        name: dto.name,
        priceCents: dto.priceCents,
        apiCallsLimit: dto.apiCallsLimit,
        dispatchesLimit: dto.dispatchesLimit,
        features: dto.features,
        active: dto.active,
      },
    });
  }

  // ---------- Configuração de pagamento (QR PIX) ----------

  async getPaymentConfig() {
    return this.prisma.paymentConfig.findUnique({ where: { id: 'default' } });
  }

  async updatePaymentConfig(dto: UpdatePaymentConfigDto) {
    return this.prisma.paymentConfig.upsert({
      where: { id: 'default' },
      update: dto,
      create: { id: 'default', ...dto },
    });
  }

  // ---------- Convites globais ----------

  async listAllInvites() {
    const invites = await this.prisma.invite.findMany({
      orderBy: { createdAt: 'desc' },
    });
    const tenantIds = [...new Set(invites.map((i) => i.tenantId))];
    const tenants = await this.prisma.tenant.findMany({
      where: { id: { in: tenantIds } },
      select: { id: true, name: true },
    });
    const tenantMap = new Map(tenants.map((t) => [t.id, t.name]));
    return invites.map((i) => ({ ...i, tenantName: tenantMap.get(i.tenantId) ?? null }));
  }

  // ---------- Feature flags ----------

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