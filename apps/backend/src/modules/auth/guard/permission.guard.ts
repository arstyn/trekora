import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  PERMISSION_KEY,
  PermissionMetadata,
} from '../decorator/require-permission.decorator';
import { PermissionCheckService } from '../../permission/permission-check.service';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @Inject(forwardRef(() => PermissionCheckService))
    private permissionCheckService: PermissionCheckService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const permissionMetadata =
      this.reflector.getAllAndOverride<PermissionMetadata>(PERMISSION_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);

    if (!permissionMetadata) {
      return true; // No permission requirement, allow access
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.userId || !user.organizationId) {
      throw new ForbiddenException('User not authenticated');
    }

    const { resource, action } = permissionMetadata;

    // Check if user has the required permission
    const hasPermission = await this.permissionCheckService.hasPermission(
      user.userId,
      user.organizationId,
      resource,
      action,
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        `Permission denied: ${action} on ${resource}`,
      );
    }

    return true;
  }
}
