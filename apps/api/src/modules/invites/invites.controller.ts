import { Controller, Get, Post, Delete, Param, Body } from '@nestjs/common';
import { InvitesService } from './invites.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthUser } from '../../common/types/auth-user.type';

@Controller('invites')
export class InvitesController {
  constructor(private invitesService: InvitesService) {}

  @Post()
  create(@CurrentUser() user: AuthUser, @Body('email') email: string) {
    return this.invitesService.create(user.tenantId, email);
  }

  @Get()
  list(@CurrentUser() user: AuthUser) {
    return this.invitesService.list(user.tenantId);
  }

  @Delete(':id')
  revoke(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.invitesService.revoke(user.tenantId, id);
  }

  @Post('accept')
  accept(@CurrentUser() user: AuthUser, @Body('token') token: string) {
    return this.invitesService.accept(token, user.id);
  }
}
