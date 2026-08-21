import { Controller, Get, Post, Delete, Param, Body, Query, ForbiddenException } from '@nestjs/common';
import { UsersService } from './users.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthUser } from '../../common/types/auth-user.type';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  list(@CurrentUser() user: AuthUser) {
    return this.usersService.listUsers(user.tenantId);
  }

  @Get(':id')
  get(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.usersService.getUser(user.tenantId, id);
  }

  @Roles('OWNER', 'ADMIN_MASTER')
  @Post(':id/role')
  setRole(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body('role') role: string) {
    if (role === 'ADMIN_MASTER' && !user.isAdminMaster) {
      throw new ForbiddenException('Apenas o administrador master pode conceder o papel ADMIN_MASTER');
    }
    return this.usersService.setRole(user.tenantId, id, role);
  }

  @Roles('OWNER', 'ADMIN_MASTER')
  @Delete(':id')
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.usersService.removeUser(user.tenantId, id);
  }
}
