import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { StorageService } from '../storage.service';
import { AssetPermission } from '../enums/asset-permission.enum';
import { PERMISSION_KEY } from '../decorators/asset-permission.decorator';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(
    private reflector: Reflector,

    private storageService: StorageService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<AssetPermission>(
      PERMISSION_KEY,
      [context.getHandler(), context.getClass()],
    );

    const request = context.switchToHttp().getRequest();

    const user = request.user;

    if (!user) return false;

    const projectId =
      request.cookies?.['projectId'] || request.params?.['projectId'];

    if (projectId) {
      const member = await this.authService.checkRole(user.userId, projectId);
      if (!member) {
        throw new ForbiddenException('You are not member of this project');
      }

      request.projectMember = member;

      return requiredRoles.includes(member.role.toUpperCase());
    }

    return false;
  }
}
