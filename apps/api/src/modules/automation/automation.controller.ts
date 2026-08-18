import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { AutomationService } from './automation.service';
import { CreateAutomationRuleDto } from './dto/create-automation-rule.dto';
import { UpdateAutomationRuleDto } from './dto/update-automation-rule.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthUser } from '../../common/types/auth-user.type';

@Controller('automation')
export class AutomationController {
  constructor(private automationService: AutomationService) {}

  @Get()
  list(@CurrentUser() user: AuthUser) {
    return this.automationService.list(user.tenantId);
  }

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateAutomationRuleDto) {
    return this.automationService.create(user.tenantId, dto);
  }

  @Put(':id')
  update(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: UpdateAutomationRuleDto) {
    return this.automationService.update(user.tenantId, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.automationService.remove(user.tenantId, id);
  }

  @Post(':id/toggle')
  toggle(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.automationService.toggle(user.tenantId, id);
  }
}
