import { Controller, Get, Post, Delete, Param, Body } from '@nestjs/common';
import { AiProviderService } from './ai-provider.service';
import { UpsertProviderDto } from './dto/upsert-provider.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthUser } from '../../common/types/auth-user.type';

@Controller('ai-provider')
export class AiProviderController {
  constructor(private aiProviderService: AiProviderService) {}

  @Get('catalog')
  catalog() {
    return this.aiProviderService.catalog();
  }

  @Get()
  list(@CurrentUser() user: AuthUser) {
    return this.aiProviderService.list(user.tenantId);
  }

  @Post()
  upsert(@CurrentUser() user: AuthUser, @Body() dto: UpsertProviderDto) {
    return this.aiProviderService.upsert(user.tenantId, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.aiProviderService.remove(user.tenantId, id);
  }

  @Post(':id/test')
  test(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.aiProviderService.test(user.tenantId, id);
  }

  @Post(':id/generate')
  generate(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body('prompt') prompt: string,
    @Body('systemPrompt') systemPrompt?: string,
  ) {
    return this.aiProviderService.generate(user.tenantId, id, prompt, systemPrompt);
  }
}
