import { Controller, Get, Post, Delete, Param, Body, Query } from '@nestjs/common';
import { ConnectionsService } from './connections.service';
import { UpsertCredentialDto } from './dto/upsert-credential.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthUser } from '../../common/types/auth-user.type';

@Controller('connections')
export class ConnectionsController {
  constructor(private connectionsService: ConnectionsService) {}

  @Get('catalog')
  catalog() {
    return this.connectionsService.catalog();
  }

  @Get()
  list(
    @CurrentUser() user: AuthUser,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.connectionsService.list(user.tenantId, Number(page) || 1, Number(limit) || 50);
  }

  @Post()
  upsert(@CurrentUser() user: AuthUser, @Body() dto: UpsertCredentialDto) {
    return this.connectionsService.upsert(user.tenantId, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.connectionsService.remove(user.tenantId, id);
  }

  @Post(':id/sync')
  sync(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.connectionsService.sync(user.tenantId, id);
  }

  @Post('import-link')
  importLink(
    @CurrentUser() user: AuthUser,
    @Body('marketplace') marketplace: string,
    @Body('externalUrl') externalUrl: string,
  ) {
    return this.connectionsService.importLink(user.tenantId, marketplace, externalUrl);
  }
}
