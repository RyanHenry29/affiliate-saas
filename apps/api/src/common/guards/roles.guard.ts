import { Injectable, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_ADMIN_MASTER_KEY } from '../decorators/admin-master.decorator';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isAdminMaster = this.reflector.getAllAndOverride<boolean>(IS_ADMIN_MASTER_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (isAdminMaster) {
      return user?.isAdminMaster === true;
    }

    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    if (!user?.role) {
      throw new ForbiddenException('Acesso negado: papel de usuário ausente');
    }

    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException('Acesso negado: papel insuficiente para este recurso');
    }

    return true;
  }
}
