import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorator/require-role.decorator';
import { PermissionCheckService } from '../../permission/permission-check.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @Inject(forwardRef(() => PermissionCheckService))
    private permissionCheckService: PermissionCheckService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true; // No role requirement, allow access
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.userId || !user.organizationId) {
      return false;
    }

    // Check if user has any of the required roles
    for (const role of requiredRoles) {
      const hasRole = await this.permissionCheckService.hasRole(
        user.userId,
        user.organizationId,
        role,
      );
      if (hasRole) {
        return true;
      }
    }

    return false;
  }
}
