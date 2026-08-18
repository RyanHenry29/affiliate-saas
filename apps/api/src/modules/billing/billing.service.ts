import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class BillingService {
  constructor(private prisma: PrismaService) {}

  async status(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { id: true, name: true, plan: true, createdAt: true },
    });

    const lastPayment = await this.prisma.payment.findFirst({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });

    return {
      tenant,
      lastPayment,
      billingStatus: lastPayment?.status || 'NONE',
    };
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
