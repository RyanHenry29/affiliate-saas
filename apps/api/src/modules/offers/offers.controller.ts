import { Controller, Get } from '@nestjs/common';
import { OffersService } from './offers.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthUser } from '../../common/types/auth-user.type';

@Controller('offers')
export class OffersController {
  constructor(private offersService: OffersService) {}

  @Get()
  list(@CurrentUser() user: AuthUser) {
    return this.offersService.list(user.tenantId, user.isAdminMaster);
  }

  @Get('mine')
  mine(@CurrentUser() user: AuthUser) {
    return this.offersService.mine(user.tenantId);
  }

  @Get('shopee')
  shopee(@CurrentUser() user: AuthUser) {
    return this.offersService.getShopeeOffers(user.tenantId);
  }
}
