import { Controller, Get, Post, Body, Query, Param } from '@nestjs/common';
import { OffersService } from './offers.service';
import { ImportOfferDto } from './dto/import-offer.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthUser } from '../../common/types/auth-user.type';

@Controller('offers')
export class OffersController {
  constructor(private offersService: OffersService) {}

  @Get()
  list(
    @CurrentUser() user: AuthUser,
    @Query('marketplace') marketplace?: string,
    @Query('niche') niche?: string,
    @Query('q') q?: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.offersService.list(user.tenantId, user.isAdminMaster, {
      marketplace,
      niche,
      q,
      status,
      page,
      limit,
    });
  }

  @Get('ai-search')
  aiSearch(@CurrentUser() user: AuthUser, @Query('query') query: string) {
    return this.offersService.aiSearch(user.tenantId, user.isAdminMaster, query);
  }

  @Get('mine')
  mine(@CurrentUser() user: AuthUser) {
    return this.offersService.mine(user.tenantId);
  }

  @Get('shopee')
  shopee(@CurrentUser() user: AuthUser) {
    return this.offersService.getShopeeOffers(user.tenantId);
  }

  @Post('import')
  importOffer(@CurrentUser() user: AuthUser, @Body() dto: ImportOfferDto) {
    return this.offersService.importOffer(dto, user.tenantId);
  }

  @Post('mine/shopee')
  mineShopee(@CurrentUser() user: AuthUser) {
    return this.offersService.mineShopee();
  }

  @Get(':id/history')
  history(@Param('id') id: string) {
    return this.offersService.priceHistory(id);
  }

  @Post(':id/publish')
  publish(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.offersService.setStatus(id, 'PUBLISHED', user.tenantId, user.id);
  }

  @Post(':id/ignore')
  ignore(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.offersService.setStatus(id, 'IGNORED', user.tenantId, user.id);
  }

  @Post(':id/reopen')
  reopen(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.offersService.setStatus(id, 'PENDING', user.tenantId, user.id);
  }
}