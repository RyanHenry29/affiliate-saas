import { Controller, Get, Post, Body, Sse } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthUser } from '../../common/types/auth-user.type';
import { Public } from '../../common/decorators/public.decorator';
import { Observable, map } from 'rxjs';
import { MessageEvent } from '@nestjs/common';

@Controller('payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Post('pix')
  createPix(
    @CurrentUser() user: AuthUser,
    @Body('amount') amount: number,
    @Body('description') description?: string,
  ) {
    return this.paymentsService.createPix(user.tenantId, amount, description);
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
  webhook(@Body() payload: any) {
    return this.paymentsService.handleWebhook(payload);
  }
}
