import { Controller, Get, Post, Body, Param, Sse, Headers, ForbiddenException } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthUser } from '../../common/types/auth-user.type';
import { Public } from '../../common/decorators/public.decorator';
import { Observable, map } from 'rxjs';
import { MessageEvent } from '@nestjs/common';
import { createHmac } from 'crypto';

@Controller('payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Post('pix')
  createPix(
    @CurrentUser() user: AuthUser,
    @Body('amount') amount: number,
    @Body('description') description?: string,
    @Body('plan') plan?: string,
  ) {
    return this.paymentsService.createPix(
      user.tenantId,
      amount,
      description,
      plan as any,
    );
  }

  @Get(':id')
  getPayment(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.paymentsService.getPayment(id, user.tenantId);
  }

  @Post('preference')
  createPreference(
    @CurrentUser() user: AuthUser,
    @Body('items') items: Array<{ title: string; quantity: number; unit_price: number }>,
  ) {
    return this.paymentsService.createPreference(user.tenantId, items);
  }

  @Sse('stream')
  stream(@CurrentUser() user: AuthUser): Observable<MessageEvent> {
    return new Observable<MessageEvent>((subscriber) => {
      this.paymentsService.stream(user.tenantId).then((obs) => {
        obs.subscribe({
          next: (event) => subscriber.next(event as MessageEvent),
        });
      });
    });
  }

  @Public()
  @Post('webhook')
  webhook(@Body() payload: any, @Headers('x-signature') signature?: string) {
    const webhookSecret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
    if (webhookSecret && signature) {
      const expected = createHmac('sha256', webhookSecret)
        .update(JSON.stringify(payload))
        .digest('hex');
      if (signature !== expected) {
        throw new ForbiddenException('Assinatura do webhook inválida');
      }
    }
    return this.paymentsService.handleWebhook(payload);
  }
}