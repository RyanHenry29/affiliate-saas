import { Controller, Get, Query } from '@nestjs/common';
import { MonitoringService } from './monitoring.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthUser } from '../../common/types/auth-user.type';

@Controller('monitoring')
export class MonitoringController {
  constructor(private monitoringService: MonitoringService) {}

  @Get('queue')
  queue(@CurrentUser() _user: AuthUser) {
    return this.monitoringService.queueHealth();
  }

  @Get('errors')
  errors(@CurrentUser() user: AuthUser, @Query('limit') limit?: string) {
    return this.monitoringService.recentErrors(user.tenantId, Number(limit) || 50);
  }
}