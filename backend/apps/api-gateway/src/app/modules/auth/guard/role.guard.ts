import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../enums/role.enum';
import { ROLE_KEY } from '../decorators/role.decorator';
import { AuthService } from '../auth.service';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) return false;

    let member = null;
    let projectId = request.cookies?.['projectId'];

    if (projectId && projectId !== 'null') {
      member = await this.authService.checkRole(user.userId, projectId);
    }

    if (!member) {
      projectId = request.params?.['projectId'];

      if (projectId && projectId !== 'null') {
        member = await this.authService.checkRole(user.userId, projectId);
      }
    }

    if (!member) {
      throw new ForbiddenException('You are not a member of this project');
    }

    request.projectMember = member;

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    return requiredRoles.includes(member.role.toUpperCase());
  }
}
