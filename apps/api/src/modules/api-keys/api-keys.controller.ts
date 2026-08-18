import { Controller, Get, Post, Delete, Param, Body } from '@nestjs/common';
import { ApiKeysService } from './api-keys.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthUser } from '../../common/types/auth-user.type';

@Controller('api-keys')
export class ApiKeysController {
  constructor(private apiKeysService: ApiKeysService) {}

  @Post()
  create(@CurrentUser() user: AuthUser, @Body('name') name: string) {
    return this.apiKeysService.create(user.tenantId, name);
  }

  @Get()
  list(@CurrentUser() user: AuthUser) {
    return this.apiKeysService.list(user.tenantId);
  }

  @Delete(':id')
  revoke(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.apiKeysService.revoke(user.tenantId, id);
  }
}
