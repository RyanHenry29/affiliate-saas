import { Controller, Get, Sse, Query, MessageEvent } from '@nestjs/common';
import { AuditService } from './audit.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthUser } from '../../common/types/auth-user.type';
import { Observable, map } from 'rxjs';

@Controller('audit')
export class AuditController {
  constructor(private auditService: AuditService) {}

  @Get()
  list(
    @CurrentUser() user: AuthUser,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.auditService.list(user.tenantId, Number(page) || 1, Number(limit) || 50);
  }

  @Sse('stream')
  stream(@CurrentUser() user: AuthUser): Observable<MessageEvent> {
    return this.auditService.stream(user.tenantId).pipe(
      map((entry) => ({ data: entry } as MessageEvent)),
    );
  }
}
