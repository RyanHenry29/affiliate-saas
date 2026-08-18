import { Injectable, HttpException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { Observable, Subject } from 'rxjs';

@Injectable()
export class PaymentsService {
  private paymentSubject = new Subject<any>();

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {}

  async createPix(tenantId: string, amount: number, description?: string) {
    const payment = await this.prisma.payment.create({
      data: {
        tenantId,
        amount,
        method: 'PIX',
        status: 'PENDING',
        type: 'SUBSCRIPTION',
        description,
      },
    });

    const pixPayload = {
      transaction_amount: amount,
      description: description || 'Assinatura Affiliate SaaS',
      payment_method_id: 'pix',
      payer: { email: 'customer@example.com' },
    };

    try {
      const response = await fetch('https://api.mercadopago.com/v1/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.config.get<string>('MERCADO_PAGO_ACCESS_TOKEN', '')}`,
        },
        body: JSON.stringify(pixPayload),
      });

      if (response.ok) {
        const data = await response.json();
        await this.prisma.payment.update({
          where: { id: payment.id },
          data: { externalId: data.id?.toString(), metadata: data },
        });
        this.paymentSubject.next({ ...payment, pix: data.point_of_interaction?.transaction_data });
        return { paymentId: payment.id, pix: data.point_of_interaction?.transaction_data };
      }
    } catch {
      // Fallback: return payment without external integration
    }

    return { paymentId: payment.id, pix: null };
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

    try {
      const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.config.get<string>('MERCADO_PAGO_ACCESS_TOKEN', '')}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        return { preferenceId: data.id, init_point: data.init_point };
      }
    } catch {
      // Fallback
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
          const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
            headers: {
              Authorization: `Bearer ${this.config.get<string>('MERCADO_PAGO_ACCESS_TOKEN', '')}`,
            },
          });
          if (response.ok) {
            const paymentData = await response.json();
            const status = paymentData.status === 'approved' ? 'CONFIRMED' : 'PENDING';
            await this.prisma.payment.updateMany({
              where: { externalId: paymentId.toString() },
              data: { status, metadata: paymentData },
            });
          }
        } catch {
          // ignore
        }
      }
    }

    return { received: true };
  }
}
