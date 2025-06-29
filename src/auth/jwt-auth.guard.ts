import { ForbiddenError, subject } from '@casl/ability';
import { ExecutionContext, Injectable, NotFoundException, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import lowerFirst from 'lodash/lowerFirst';
import { CaslAbilityFactory } from '../casl/casl-ability.factory';
import { Action } from '../common/types/action';
import { Roles } from '../common/types/role';
import { Subject } from '../common/types/subject';
import { PrismaService } from 'nestjs-prisma';
import { IS_ADMIN_KEY, IS_PUBLIC_KEY, PERMISSION_KEY } from './decorators';

type AbilityRule = [Action, Subject, string?];

export const Permission = (...requirements: AbilityRule[]) => SetMetadata(PERMISSION_KEY, requirements);

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private readonly prisma: PrismaService,
    private reflector: Reflector,
    private caslAbilityFactory: CaslAbilityFactory,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }
    await super.canActivate(context);

    const { user, params } = context.switchToHttp().getRequest();
    const isAdmin = this.reflector.getAllAndOverride<boolean>(IS_ADMIN_KEY, [context.getHandler(), context.getClass()]);
    if (isAdmin) {
      const roleName = user.role.name.toLowerCase();
      return roleName == Roles.admin;
    }

    const permissions = this.reflector.getAllAndOverride<AbilityRule[]>(PERMISSION_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (permissions) {
      const ability = this.caslAbilityFactory.createForUser(user);
      await Promise.all(
        permissions.map(async ([action, subjectType, query]) => {
          if (params.id) {
            const record = await this.prisma[lowerFirst(subjectType.toString())].findUnique({
              where: { id: parseInt(params.id, 10) },
            });
            if (!record) throw new NotFoundException(`No ${subjectType} found with id: ${params.id}`);
            ForbiddenError.from(ability).throwUnlessCan(action, subject(subjectType.toString(), record), query);
          } else {
            ForbiddenError.from(ability).throwUnlessCan(action, subjectType, query);
          }
        }),
      );
    }

    return true;
  }
}
