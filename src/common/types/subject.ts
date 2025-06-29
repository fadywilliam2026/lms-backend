import { Subjects } from '@casl/prisma';
import {
  AccountArrearsSettings,
  Client,
  DisbursementDetails,
  Document,
  Installment,
  InterestProductSettings,
  LoanAccount,
  LoanProduct,
  NotificationTemplate,
  Organization,
  OTP,
  PeriodicPayment,
  PredefinedFee,
  PrincipalPaymentProductSettings,
  Prisma,
  ProductArrearsSettings,
  RefreshToken,
  Role,
  User,
} from '@prisma/client';

export type Subject = Subjects<{
  User: User;
  Role: Role;
  RefreshToken: RefreshToken;
  Client: Client;
  LoanProduct: LoanProduct;
  PrincipalPaymentProductSettings: PrincipalPaymentProductSettings;
  ProductArrearsSettings: ProductArrearsSettings;
  InterestProductSettings: InterestProductSettings;
  Document: Document;
  LoanAccount: LoanAccount;
  AccountArrearsSettings: AccountArrearsSettings;
  DisbursementDetails: DisbursementDetails;
  PeriodicPayment: PeriodicPayment;
  PredefinedFee: PredefinedFee;
  Installment: Installment;
  OTP: OTP;
  NotificationTemplate: NotificationTemplate;
  Organization: Organization;
  all: typeof Prisma.ModelName;
}>;
