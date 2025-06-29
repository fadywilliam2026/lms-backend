import { AbilityBuilder, PureAbility } from '@casl/ability';
import { PrismaQuery, createPrismaAbility } from '@casl/prisma';
import { Injectable } from '@nestjs/common';
import { Role, User } from '@prisma/client';
import { Action } from '../common/types/action';
import { Roles } from '../common/types/role';
import { Subject } from '../common/types/subject';

type AppAbility = PureAbility<[Action, Subject], PrismaQuery>;

@Injectable()
export class CaslAbilityFactory {
  createForUser(user: User & { role: Role }) {
    const { can, build } = new AbilityBuilder<AppAbility>(createPrismaAbility);
    const roleName = user.role.name.toLowerCase();
    if (roleName == Roles.admin) {
      can(Action.Manage, 'all'); // read-write access to everything
    } else {
      user.role.permissions.concat(user.permissions).forEach(permission => {
        const parts = permission.split(':');
        if (parts[1].at(-1) === 's') {
          can(parts[0] as Action, parts[1].slice(0, -1) as any);
        } else {
          if (parts[1] == 'User') {
            can(parts[0] as Action, parts[1] as any, { id: user.id } as any);
          } else {
            can(parts[0] as Action, parts[1] as any, { userId: user.id } as any);
          }
        }
      });
      can(Action.Read, 'User', { id: user.id });
      //TODO: we need to investigate this condition
      can(Action.Update, 'User', { id: user.id });
    }
    return build();
  }
}
