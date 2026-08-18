import { Controller, Get, Post, Delete, Param, Body, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthUser } from '../../common/types/auth-user.type';

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

  @Post(':id/role')
  setRole(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body('role') role: string) {
    return this.usersService.setRole(user.tenantId, id, role);
  }

  @Delete(':id')
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.usersService.removeUser(user.tenantId, id);
  }
}
