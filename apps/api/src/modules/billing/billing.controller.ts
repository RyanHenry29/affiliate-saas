import { Controller, Get, Post, Body, Headers, ForbiddenException, BadRequestException } from '@nestjs/common';
import { BillingService } from './billing.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthUser } from '../../common/types/auth-user.type';
import { Public } from '../../common/decorators/public.decorator';
import { createHmac, timingSafeEqual } from 'crypto';

@Controller('billing')
export class BillingController {
  constructor(private billingService: BillingService) {}

  @Get('status')
  status(@CurrentUser() user: AuthUser) {
    return this.billingService.status(user.tenantId);
  }

  @Get('invoices')
  invoices(@CurrentUser() user: AuthUser) {
    return this.billingService.invoices(user.tenantId);
  }

  @Public()
  @Get('plans')
  plans() {
    return this.billingService.plans();
  }

  @Public()
  @Get('payment-config')
  paymentConfig() {
    return this.billingService.paymentConfig();
  }

  @Public()
  @Post('webhook')
  webhook(@Body() payload: any, @Headers('x-webhook-signature') signature?: string) {
    const webhookSecret = process.env.BILLING_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new BadRequestException('BILLING_WEBHOOK_SECRET is not configured');
    }
    if (!signature) {
      throw new ForbiddenException('Assinatura do webhook não fornecida');
    }
    const expected = createHmac('sha256', webhookSecret)
      .update(JSON.stringify(payload))
      .digest('hex');
    const sigBuf = Buffer.from(signature, 'hex');
    const expBuf = Buffer.from(expected, 'hex');
    if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) {
      throw new ForbiddenException('Assinatura do webhook inválida');
    }
    return this.billingService.handleWebhook(payload);
  }
}