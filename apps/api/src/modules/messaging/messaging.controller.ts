import { Controller, Get, Post, Body } from '@nestjs/common';
import { MessagingService } from './messaging.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthUser } from '../../common/types/auth-user.type';
import { CreateInstanceDto } from './dto/create-instance.dto';

@Controller('messaging')
export class MessagingController {
  constructor(private messagingService: MessagingService) {}

  @Get('instances')
  listInstances(@CurrentUser() user: AuthUser) {
    return this.messagingService.listInstances(user.tenantId);
  }

  @Post('instances')
  createInstance(@CurrentUser() user: AuthUser, @Body() dto: CreateInstanceDto) {
    return this.messagingService.createInstance(user.tenantId, dto.name);
  }

  @Post('instances/refresh')
  refreshStatuses(@CurrentUser() user: AuthUser) {
    return this.messagingService.refreshStatuses(user.tenantId);
  }
}
