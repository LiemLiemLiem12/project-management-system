import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { StorageService } from '../storage.service';
import { AssetPermission } from '../enums/asset-permission.enum';
import { PERMISSION_KEY } from '../decorators/asset-permission.decorator';

@Injectable()
export class AssetPermissionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private storageService: StorageService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermission = this.reflector.getAllAndOverride<
      AssetPermission | AssetPermission[]
    >(PERMISSION_KEY, [context.getHandler(), context.getClass()]);

    if (!requiredPermission || requiredPermission.length === 0) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    const fileId = request.params?.fileId || request.body?.fileId;
    const parentId =
      request.params?.parentId ||
      request.body?.parentId ||
      request.query?.parentId;

    const targetId = fileId || parentId;

    if (!user) {
      return false;
    }

    if (!targetId) {
      return true;
    }

    const permissionsFetch: string[] =
      await this.storageService.checkPermission(targetId, user.userId);

    const permissions = permissionsFetch.flatMap(
      (permisson: any) => permisson.permission,
    );

    // console.log(`Permissions for targetId ${targetId}:`, permissions);

    const requiredPermsArray = Array.isArray(requiredPermission)
      ? requiredPermission
      : [requiredPermission];

    const hasPermission = requiredPermsArray.some((perm) =>
      permissions.includes(perm),
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        'You do not have permission to perform this action on this asset or folder.',
      );
    }

    return true;
  }
}
