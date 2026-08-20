import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PlanTier, SubscriptionStatus } from '@prisma/client';

const FALLBACK_LIMITS: Record<PlanTier, { apiCallsLimit: number; dispatchesLimit: number }> = {
  STARTER: { apiCallsLimit: 5000, dispatchesLimit: 1000 },
  PRO: { apiCallsLimit: 50000, dispatchesLimit: 15000 },
  AGENCY: { apiCallsLimit: 500000, dispatchesLimit: 200000 },
};

@Injectable()
export class BillingService {
  constructor(private prisma: PrismaService) {}

  async status(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      include: { subscription: true },
    });
    if (!tenant) throw new NotFoundException('Tenant não encontrado');

    const subscription = tenant.subscription;
    const plan = subscription?.plan ?? PlanTier.STARTER;

    const planConfig = await this.prisma.planConfig.findUnique({
      where: { tier: plan },
    });
    const limits = FALLBACK_LIMITS[plan] ?? FALLBACK_LIMITS.STARTER;
    const apiCallsLimit = planConfig?.apiCallsLimit ?? limits.apiCallsLimit;
    const dispatchesLimit = planConfig?.dispatchesLimit ?? limits.dispatchesLimit;

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [dispatchesThisMonth, apiCallsThisMonth] = await Promise.all([
      this.prisma.dispatchJob.count({
        where: { tenantId, status: 'SENT', createdAt: { gte: startOfMonth } },
      }),
      this.prisma.auditLog.count({
        where: { tenantId, createdAt: { gte: startOfMonth } },
      }),
    ]);

    return {
      plan,
      status: subscription?.status ?? SubscriptionStatus.TRIALING,
      currentPeriodEnd: subscription?.currentPeriodEnd ?? null,
      planName: planConfig?.name ?? plan,
      priceCents: planConfig?.priceCents ?? 0,
      apiCallsThisMonth,
      apiCallsLimit,
      dispatchesThisMonth,
      dispatchesLimit,
    };
  }

  async invoices(tenantId: string) {
    const payments = await this.prisma.payment.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    return payments.map((p) => ({
      id: p.id,
      createdAt: p.createdAt,
      amountCents: p.amount,
      status:
        p.status === 'CONFIRMED'
          ? 'PAID'
          : p.status === 'FAILED'
            ? 'PAST_DUE'
            : 'OPEN',
      method: p.method,
      description: p.description ?? 'Assinatura Affiliate SaaS',
      externalId: p.externalId,
    }));
  }

  async plans() {
    const configs = await this.prisma.planConfig.findMany({
      where: { active: true },
      orderBy: { priceCents: 'asc' },
    });
    return configs.map((c) => ({
      tier: c.tier,
      name: c.name,
      priceCents: c.priceCents,
      apiCallsLimit: c.apiCallsLimit,
      dispatchesLimit: c.dispatchesLimit,
      features: (c.features as string[]) ?? [],
    }));
  }

  async paymentConfig() {
    const config = await this.prisma.paymentConfig.findUnique({
      where: { id: 'default' },
    });
    return (
      config ?? {
        id: 'default',
        pixKey: '',
        pixMerchantName: '',
        pixCity: '',
        pixCopiaECola: '',
        pixEnabled: false,
        pixInstructions: '',
      }
    );
  }

  async handleWebhook(payload: any) {
    const { event, data } = payload;

    if (event === 'payment.confirmed') {
      await this.prisma.payment.updateMany({
        where: { id: data.paymentId },
        data: { status: 'CONFIRMED' },
      });
    }

    if (event === 'payment.failed') {
      await this.prisma.payment.updateMany({
        where: { id: data.paymentId },
        data: { status: 'FAILED' },
      });
    }

    return { received: true };
  }
}