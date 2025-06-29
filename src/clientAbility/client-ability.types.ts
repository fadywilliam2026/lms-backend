// DEPRECATED: This file is no longer needed

// import { PureAbility } from '@casl/ability';
// import { PrismaQuery, Subjects } from '@casl/prisma';
// import { Client, LoanAccount } from '@prisma/client';

// export enum Action {
//   Sign = 'sign',
//   Read = 'read',
// }

// export type Subject = Subjects<{
//   Client: Client;
//   LoanAccount: LoanAccount;
// }>;

// export type AppAbility = PureAbility<[Action, Subject], PrismaQuery>;

// export type AbilityRule = [Action, Subject, string?];

// export type AuthenticatedClient = Client;

// export type ReqWithClient = Request & { client: AuthenticatedClient };
