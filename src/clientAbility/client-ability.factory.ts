// DEPRECATED: This file is no longer needed

// import { AbilityBuilder } from '@casl/ability';
// import { Injectable } from '@nestjs/common';
// import { Client } from '@prisma/client';
// import { Action, AppAbility } from './client-ability.types';
// import { createPrismaAbility } from '@casl/prisma';

// @Injectable()
// export class ClientAbilityFactory {
//   createForClient(client: Client) {
//     const { can, build } = new AbilityBuilder<AppAbility>(createPrismaAbility);
//     can([Action.Sign], 'Client', { id: client.id });
//     can([Action.Read], 'Client', { id: client.id });
//     can([Action.Read], 'LoanAccount', { clientId: client.id });
//     return build();
//   }
// }
