import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { Observable, Subject } from 'rxjs';
import { PlanTier, SubscriptionStatus } from '@prisma/client';

@Injectable()
export class PaymentsService {
  private paymentSubject = new Subject<any>();

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {}

  async createPix(tenantId: string, amount: number, description?: string, plan?: PlanTier) {
    const payment = await this.prisma.payment.create({
      data: {
        tenantId,
        amount,
        method: 'PIX',
        status: 'PENDING',
        type: 'SUBSCRIPTION',
        description,
        metadata: plan ? { plan } : undefined,
      },
    });

    const pixPayload = {
      transaction_amount: amount / 100,
      description: description || 'Assinatura Affiliate SaaS',
      payment_method_id: 'pix',
      payer: { email: 'customer@example.com' },
    };

    const accessToken = this.config.get<string>('MERCADOPAGO_ACCESS_TOKEN', '');

    // 1) Tenta Mercado Pago quando o token está configurado
    if (accessToken) {
      try {
        const response = await fetch('https://api.mercadopago.com/v1/payments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(pixPayload),
        });

        if (response.ok) {
          const data = await response.json();
          await this.prisma.payment.update({
            where: { id: payment.id },
            data: { externalId: data.id?.toString(), metadata: data },
          });
          const pix = data.point_of_interaction?.transaction_data;
          this.paymentSubject.next({ ...payment, pix });
          return { paymentId: payment.id, pix, external: true };
        }
      } catch {
        // cai no fallback estático
      }
    }

    // 2) Fallback: QR copia-e-cola configurado pelo admin (pagamento manual)
    const config = await this.prisma.paymentConfig.findUnique({ where: { id: 'default' } });
    const copiaECola = config?.pixCopiaECola?.trim() || '';
    const pix =
      config?.pixEnabled && copiaECola
        ? {
            qr_code_base64: null,
            qr_code: copiaECola,
            paymentId: payment.id,
            external: false,
          }
        : null;

    this.paymentSubject.next({ ...payment, pix });
    return { paymentId: payment.id, pix, external: false };
  }

  async getPayment(paymentId: string, tenantId: string) {
    const payment = await this.prisma.payment.findFirst({
      where: { id: paymentId, tenantId },
    });
    if (!payment) throw new NotFoundException('Pagamento não encontrado');
    return {
      id: payment.id,
      amount: payment.amount,
      status: payment.status,
      method: payment.method,
      type: payment.type,
      createdAt: payment.createdAt,
      metadata: payment.metadata,
    };
  }

  async createPreference(tenantId: string, items: Array<{ title: string; quantity: number; unit_price: number }>) {
    const payload = {
      items: items.map((item) => ({
        title: item.title,
        quantity: item.quantity,
        unit_price: item.unit_price,
      })),
      external_reference: tenantId,
    };

    const accessToken = this.config.get<string>('MERCADOPAGO_ACCESS_TOKEN', '');
    if (!accessToken) return { preferenceId: null, init_point: null };

    try {
      const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        return { preferenceId: data.id, init_point: data.init_point };
      }
    } catch {
      // ignore
    }

    return { preferenceId: null, init_point: null };
  }

  async stream(tenantId: string): Promise<Observable<any>> {
    return new Observable((subscriber) => {
      const subscription = this.paymentSubject.asObservable().subscribe({
        next: (entry) => {
          if (entry.tenantId === tenantId) {
            subscriber.next({ data: entry });
          }
        },
      });
      return () => subscription.unsubscribe();
    });
  }

  async handleWebhook(payload: any) {
    const { type, data } = payload;

    if (type === 'payment') {
      const paymentId = data?.id;
      if (paymentId) {
        try {
          const accessToken = this.config.get<string>('MERCADOPAGO_ACCESS_TOKEN', '');
          const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });
          if (response.ok) {
            const paymentData = await response.json();
            const approved = paymentData.status === 'approved';
            await this.prisma.payment.updateMany({
              where: { externalId: paymentId.toString() },
              data: { status: approved ? 'CONFIRMED' : 'PENDING', metadata: paymentData },
            });
            if (approved) {
              await this.activateSubscriptionForPayment(paymentId.toString());
            }
          }
        } catch {
          // ignore
        }
      }
    }

    if (type === 'payment.confirmed' || type === 'payment.approved') {
      const localId = data?.paymentId ?? data?.id;
      if (localId) {
        await this.prisma.payment.updateMany({
          where: { id: localId.toString() },
          data: { status: 'CONFIRMED' },
        });
        await this.activateSubscriptionForPayment(localId.toString());
      }
    }

    return { received: true };
  }

  async activateSubscriptionForPayment(externalId: string) {
    const payment = await this.prisma.payment.findFirst({
      where: { OR: [{ externalId }, { id: externalId }] },
    });
    if (!payment || payment.status !== 'CONFIRMED') return;

    const metadata = payment.metadata as { plan?: PlanTier } | null;
    const plan = metadata?.plan ?? PlanTier.STARTER;
    const currentPeriodEnd = new Date();
    currentPeriodEnd.setDate(currentPeriodEnd.getDate() + 30);

    const existingSub = await this.prisma.subscription.findUnique({
      where: { tenantId: payment.tenantId },
    });

    if (existingSub) {
      await this.prisma.subscription.update({
        where: { id: existingSub.id },
        data: {
          plan,
          status: SubscriptionStatus.ACTIVE,
          currentPeriodEnd,
        },
      });
    } else {
      await this.prisma.subscription.create({
        data: {
          tenantId: payment.tenantId,
          plan,
          status: SubscriptionStatus.ACTIVE,
          externalCustomerId: payment.tenantId,
          currentPeriodEnd,
        },
      });
    }
  }
}