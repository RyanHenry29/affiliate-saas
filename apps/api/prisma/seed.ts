import {
  PrismaClient,
  Prisma,
  PlanTier,
  SubscriptionStatus,
} from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const DEFAULT_PLANS: Array<{
  tier: PlanTier;
  name: string;
  priceCents: number;
  apiCallsLimit: number;
  dispatchesLimit: number;
  features: string[];
}> = [
  {
    tier: PlanTier.STARTER,
    name: 'Starter',
    priceCents: 9700,
    apiCallsLimit: 3000,
    dispatchesLimit: 1000,
    features: [
      'Até 3.000 ofertas processadas / mês',
      '1.000 disparos / mês',
      'Shopee + Amazon (APIs oficiais)',
      'WhatsApp e Telegram',
      'Fila com retry e rate limit',
    ],
  },
  {
    tier: PlanTier.PRO,
    name: 'Professional',
    priceCents: 19700,
    apiCallsLimit: 25000,
    dispatchesLimit: 10000,
    features: [
      'Até 25.000 ofertas processadas / mês',
      '10.000 disparos / mês',
      'Todos os marketplaces + scoring',
      'Automações ilimitadas',
      'Analytics de conversão',
    ],
  },
  {
    tier: PlanTier.AGENCY,
    name: 'Scale',
    priceCents: 49700,
    apiCallsLimit: 100000,
    dispatchesLimit: 50000,
    features: [
      'Até 100.000 ofertas processadas / mês',
      '50.000 disparos / mês',
      'Instâncias ilimitadas',
      'Multi-tenant para agências',
      'Webhooks de API',
    ],
  },
];

async function main() {
  const masterEmail = process.env.ADMIN_MASTER_EMAIL ?? 'admin@senaflow.local';
  const masterPassword = process.env.ADMIN_MASTER_PASSWORD ?? 'ChangeMe!123';

  const existing = await prisma.tenant.findFirst({ where: { isAdminMaster: true } });
  if (!existing) {
    const passwordHash = await bcrypt.hash(masterPassword, 12);

    const tenant = await prisma.tenant.create({
      data: {
        name: 'Senaflow Master',
        isAdminMaster: true,
        users: {
          create: [
            {
              email: masterEmail,
              passwordHash,
              role: 'ADMIN_MASTER',
            },
          ],
        },
        subscription: {
          create: {
            plan: PlanTier.AGENCY,
            status: SubscriptionStatus.ACTIVE,
            externalCustomerId: 'admin-master',
            currentPeriodEnd: new Date('2099-01-01'),
          },
        },
      },
    });

    console.log(`Admin master criado: tenant=${tenant.id} email=${masterEmail}`);
  } else {
    const masterUser = await prisma.user.findFirst({
      where: { tenantId: existing.id, role: 'ADMIN_MASTER' },
    });
    if (masterUser && masterUser.email !== masterEmail) {
      const clash = await prisma.user.findUnique({ where: { email: masterEmail } });
      if (!clash) {
        await prisma.user.update({
          where: { id: masterUser.id },
          data: { email: masterEmail },
        });
        console.log(`Admin master email reconciliado para: ${masterEmail}`);
      } else {
        console.log(`Admin master já existe com email ${masterEmail}`);
      }
    } else {
      console.log(`Admin master já existe: tenant=${existing.id}`);
    }
  }

  for (const plan of DEFAULT_PLANS) {
    await prisma.planConfig.upsert({
      where: { tier: plan.tier },
      update: { ...plan },
      create: {
        ...plan,
        features: plan.features as unknown as Prisma.InputJsonValue,
      },
    });
  }
  console.log('Planos configurados:', DEFAULT_PLANS.map((p) => p.tier).join(', '));

  await prisma.paymentConfig.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      pixKey: '',
      pixMerchantName: '',
      pixCity: '',
      pixCopiaECola: '',
      pixEnabled: false,
      pixInstructions: 'Pague o PIX e o plano é ativado automaticamente após a confirmação.',
    },
  });
  console.log('Config de pagamento criada.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());