// DEPRECATED: This file is no longer needed

// import { ExecutionContext, Injectable, NotFoundException, SetMetadata } from '@nestjs/common';
// import { AbilityRule } from '../clientAbility/client-ability.types';
// import { AuthGuard } from '@nestjs/passport';
// import { Reflector } from '@nestjs/core';
// import { PrismaService } from 'nestjs-prisma';
// import { ClientAbilityFactory } from '../clientAbility/client-ability.factory';
// import { ForbiddenError, subject } from '@casl/ability';
// import { lowerFirst } from 'lodash';
// import { IS_PUBLIC_KEY, PERMISSION_KEY } from './decorators';

// export const ClientPermission = (...requirements: AbilityRule[]) => SetMetadata(PERMISSION_KEY, requirements);

// @Injectable()
// export class ClientAuthGuard extends AuthGuard('jwt') {
//   constructor(
//     private readonly prisma: PrismaService,
//     private readonly reflector: Reflector,
//     private readonly abilityFactory: ClientAbilityFactory,
//   ) {
//     super();
//   }

//   async canActivate(context: ExecutionContext) {
//     /**
//      * if the request ip is not in the white list
//      *
//      * const request = context.switchToHttp().getRequest();
//      * const efinIp = request.ip;
//      * if (efinIp !== process.env.get('EFIN_IP')) throw new MisdirectedException();
//      */

//     const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
//       context.getHandler(),
//       context.getClass(),
//     ]);
//     if (isPublic) {
//       return true;
//     }
//     await super.canActivate(context);

//     const { user, params } = context.switchToHttp().getRequest();

//     const client = user;
//     const permissions = this.reflector.getAllAndOverride<AbilityRule[]>(PERMISSION_KEY, [
//       context.getHandler(),
//       context.getClass(),
//     ]);

//     if (permissions) {
//       const ability = this.abilityFactory.createForClient(client);
//       await Promise.all(
//         permissions.map(async ([action, subjectType, query]) => {
//           let currentSubject = subjectType;
//           if (params.id) {
//             const model = lowerFirst(subjectType.toString());
//             const record = await this.prisma[model].findUnique({
//               where: { id: parseInt(params.id) },
//             });
//             if (!record) throw new NotFoundException(`No ${subjectType} found with id: ${params.id}`);

//             currentSubject = subject(subjectType.toString(), record);
//           }
//           ForbiddenError.from(ability).throwUnlessCan(action, currentSubject, query);
//         }),
//       );
//     }
//     return true;
//   }
// }
