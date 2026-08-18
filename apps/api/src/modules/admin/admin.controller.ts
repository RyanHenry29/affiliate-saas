import { Controller, Get, Post, Put, Delete, Param, Body, Query } from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpsertFeatureFlagDto } from './dto/upsert-feature-flag.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthUser } from '../../common/types/auth-user.type';
import { AdminMasterOnly } from '../../common/decorators/admin-master.decorator';

@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('tenants')
  @AdminMasterOnly()
  listTenants() {
    return this.adminService.listTenants();
  }

  @Post('tenants')
  @AdminMasterOnly()
  createTenant(@Body() dto: CreateTenantDto) {
    return this.adminService.createTenant(dto);
  }

  @Put('tenants/:id')
  @AdminMasterOnly()
  updateTenant(@Param('id') id: string, @Body() dto: Partial<CreateTenantDto>) {
    return this.adminService.updateTenant(id, dto);
  }

  @Delete('tenants/:id')
  @AdminMasterOnly()
  removeTenant(@Param('id') id: string) {
    return this.adminService.removeTenant(id);
  }

  @Get('metrics')
  @AdminMasterOnly()
  metrics() {
    return this.adminService.metrics();
  }

  @Get('feature-flags')
  @AdminMasterOnly()
  listFeatureFlags(@Query('tenantId') tenantId?: string) {
    return this.adminService.listFeatureFlags(tenantId);
  }

  @Post('feature-flags')
  @AdminMasterOnly()
  upsertFeatureFlag(@Body() dto: UpsertFeatureFlagDto) {
    return this.adminService.upsertFeatureFlag(dto);
  }

  @Delete('feature-flags/:id')
  @AdminMasterOnly()
  removeFeatureFlag(@Param('id') id: string) {
    return this.adminService.removeFeatureFlag(id);
  }

  @Post('pix-payment')
  @AdminMasterOnly()
  adminPixPayment(@CurrentUser() user: AuthUser, @Body('amount') amount: number) {
    return this.adminService.adminPixPayment(user.tenantId, amount);
  }
}
