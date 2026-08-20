import { Controller, Get, Query } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthUser } from '../../common/types/auth-user.type';

@Controller('analytics')
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Get('overview')
  overview(@CurrentUser() user: AuthUser, @Query('period') period?: string) {
    return this.analyticsService.overview(user.tenantId, period);
  }

  @Get('dispatches-by-hour')
  dispatchesByHour(@CurrentUser() user: AuthUser) {
    return this.analyticsService.dispatchesByHour(user.tenantId);
  }

  @Get('dispatches-by-marketplace')
  dispatchesByMarketplace(@CurrentUser() user: AuthUser, @Query('period') period?: string) {
    return this.analyticsService.dispatchesByMarketplace(user.tenantId, period);
  }

  @Get('top-niches')
  topNiches(@CurrentUser() user: AuthUser, @Query('period') period?: string) {
    return this.analyticsService.topNiches(user.tenantId, period);
  }

  @Get('conversion')
  conversion(@CurrentUser() user: AuthUser, @Query('period') period?: string) {
    return this.analyticsService.conversion(user.tenantId, period);
  }
}