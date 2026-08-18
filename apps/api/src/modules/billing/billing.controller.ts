import { Controller, Get, Post, Body } from '@nestjs/common';
import { BillingService } from './billing.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthUser } from '../../common/types/auth-user.type';
import { Public } from '../../common/decorators/public.decorator';

@Controller('billing')
export class BillingController {
  constructor(private billingService: BillingService) {}

  @Get('status')
  status(@CurrentUser() user: AuthUser) {
    return this.billingService.status(user.tenantId);
  }

  @Public()
  @Post('webhook')
  webhook(@Body() payload: any) {
    return this.billingService.handleWebhook(payload);
  }
}
