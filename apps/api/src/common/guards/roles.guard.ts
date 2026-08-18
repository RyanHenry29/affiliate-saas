import { Injectable, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_ADMIN_MASTER_KEY } from '../decorators/admin-master.decorator';

@Injectable()
export class RolesGuard {
  constructor(private reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean {
    const isAdminMaster = this.reflector.getAllAndOverride<boolean>(IS_ADMIN_MASTER_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isAdminMaster) {
      const request = context.switchToHttp().getRequest();
      return request.user?.isAdminMaster === true;
    }
    return true;
  }
}
