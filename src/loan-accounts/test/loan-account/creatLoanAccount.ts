import {
  AccountState,
  GracePeriodType,
  InstallmentPeriodUnit,
  InterestCalculationMethod,
  InterestChargeFrequency,
  InterestType,
  LatePaymentsRecalculationMethod,
  LoanPenaltyCalculationMethod,
  PrepaymentRecalculationMethod,
} from '@prisma/client';
import { CreateLoanAccountDto } from '../../dto/create-loan-account.dto';

export const createLoanAccount: CreateLoanAccountDto = {
  customFields: null,
  clientId: 1,
  guarantorId: null,
  userId: 2,
  accountState: AccountState.PARTIAL_APPLICATION,
  accountSubState: null,
  gracePeriod: 0,
  gracePeriodType: GracePeriodType.NONE,
  interestCalculationMethod: InterestCalculationMethod.FLAT,
  interestChargeFrequency: InterestChargeFrequency.ANNUALIZED,
  interestRate: 2.5,
  interestType: InterestType.SIMPLE_INTEREST,
  latePaymentsRecalculationMethod: LatePaymentsRecalculationMethod.INCREASE_OVERDUE_INSTALLMENTS,
  loanAmount: 10000,
  loanName: 'Early Payment',
  loanPenaltyCalculationMethod: LoanPenaltyCalculationMethod.NONE,
  notes: null,
  penaltyRate: 0,
  balloonPeriodicPayment: null,
  prepaymentAcceptance: true,
  prepaymentRecalculationMethod: PrepaymentRecalculationMethod.NO_RECALCULATION,
  productId: 1,
  numInstallments: 10,
  installmentPeriodCount: 1,
  installmentPeriodUnit: InstallmentPeriodUnit.MONTHS,
  startingInterestOnlyPeriodCount: 0,
  organizationCommissionPercent: 0,
};
