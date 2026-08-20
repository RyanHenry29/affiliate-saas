import { Controller, Get, Post, Put, Delete, Param, Body, Query } from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpsertFeatureFlagDto } from './dto/upsert-feature-flag.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { UpdatePaymentConfigDto } from './dto/update-payment-config.dto';
import { SetTenantSubscriptionDto } from './dto/set-tenant-subscription.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthUser } from '../../common/types/auth-user.type';
import { AdminMasterOnly } from '../../common/decorators/admin-master.decorator';

@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  // ---------- Tenants ----------

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

  @Put('tenants/:id/subscription')
  @AdminMasterOnly()
  setTenantSubscription(@Param('id') id: string, @Body() dto: SetTenantSubscriptionDto) {
    return this.adminService.setTenantSubscription(id, dto);
  }

  // ---------- Usuários ----------

  @Get('users')
  @AdminMasterOnly()
  listUsers() {
    return this.adminService.listUsers();
  }

  @Put('users/:id/role')
  @AdminMasterOnly()
  setUserRole(@Param('id') id: string, @Body('role') role: string) {
    return this.adminService.setUserRole(id, role);
  }

  @Put('users/:id/status')
  @AdminMasterOnly()
  setUserStatus(@Param('id') id: string, @Body('isActive') isActive: boolean) {
    return this.adminService.setUserStatus(id, isActive);
  }

  @Delete('users/:id')
  @AdminMasterOnly()
  removeUser(@Param('id') id: string) {
    return this.adminService.removeUser(id);
  }

  // ---------- Planos ----------

  @Get('plans')
  @AdminMasterOnly()
  listPlans() {
    return this.adminService.listPlans();
  }

  @Put('plans/:tier')
  @AdminMasterOnly()
  updatePlan(@Param('tier') tier: string, @Body() dto: UpdatePlanDto) {
    return this.adminService.updatePlan(tier, dto);
  }

  // ---------- Pagamento (QR PIX) ----------

  @Get('payment-config')
  @AdminMasterOnly()
  getPaymentConfig() {
    return this.adminService.getPaymentConfig();
  }

  @Put('payment-config')
  @AdminMasterOnly()
  updatePaymentConfig(@Body() dto: UpdatePaymentConfigDto) {
    return this.adminService.updatePaymentConfig(dto);
  }

  // ---------- Convites ----------

  @Get('invites')
  @AdminMasterOnly()
  listInvites() {
    return this.adminService.listAllInvites();
  }

  // ---------- Flags / métricas ----------

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