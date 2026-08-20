import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import type { AuthUser } from '@affiliate-saas/shared-types';

export interface TenantScopedRequest {
  user?: AuthUser;
}

@Injectable()
export class TenantScopeInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<TenantScopedRequest>();
    const user = request.user;
    if (user && !user.isAdminMaster) {
      (request as unknown as { tenantId?: string }).tenantId = user.tenantId;
    }
    return next.handle();
  }
}
