import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
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
    const requiredRoles = this.reflector.getAllAndOverride<Role>(ROLE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    console.log(requiredRoles);

    const request = context.switchToHttp().getRequest();

    const user = request.user;

    if (!user) return false;

    const projectId = request.params.projectId;

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
