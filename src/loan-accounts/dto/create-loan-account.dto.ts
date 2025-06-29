import {
  AccountState,
  AccountSubState,
  GracePeriodType,
  InstallmentPeriodUnit,
  InterestCalculationMethod,
  InterestChargeFrequency,
  InterestType,
  LatePaymentsRecalculationMethod,
  LoanPenaltyCalculationMethod,
  PrepaymentRecalculationMethod,
} from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import Refine from '../../common/validators/Refine';

export class DisbursementDetails {
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  disbursementAt?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  expectedDisbursementAt?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  firstInstallmentAt?: Date;
}

export class PeriodicPayment {
  @IsOptional()
  @IsNumber()
  id?: number;

  @IsOptional()
  @IsNumber()
  endingInstallmentPosition: number;

  @IsOptional()
  @IsNumber()
  index?: number;

  @IsOptional()
  @IsNumber()
  paymentPlanIndex?: number;

  @IsOptional()
  @IsNumber()
  pmt: number;
}

export class PaymentPlan {
  @IsOptional()
  @IsNumber()
  id?: number;

  @IsNumber()
  periodCount: number;

  @IsEnum(InstallmentPeriodUnit)
  periodUnit: InstallmentPeriodUnit;

  @IsNumber()
  amount: number;
}

export class CreateLoanAccountDto {
  @IsOptional()
  customFields?: any;

  @IsNumber()
  clientId: number;

  @IsOptional()
  @IsNumber()
  guarantorId?: number;

  @IsNumber()
  productId: number;

  @IsOptional()
  @IsEnum(AccountState)
  accountState?: AccountState;

  @IsOptional()
  @IsEnum(AccountSubState)
  accountSubState?: AccountSubState;

  @IsOptional()
  @IsObject()
  @Type(() => DisbursementDetails)
  @ValidateNested()
  disbursementDetails?: DisbursementDetails;

  @IsOptional()
  @IsNumber()
  gracePeriod?: number;

  @IsOptional()
  @IsEnum(GracePeriodType)
  gracePeriodType?: GracePeriodType;

  @IsOptional()
  @IsEnum(InterestCalculationMethod)
  interestCalculationMethod: InterestCalculationMethod;

  @IsOptional()
  @IsEnum(InterestChargeFrequency)
  interestChargeFrequency?: InterestChargeFrequency;

  @IsOptional()
  @IsNumber()
  interestRate: number;

  @IsOptional()
  @IsEnum(InterestType)
  interestType?: InterestType;

  @IsOptional()
  @IsEnum(LatePaymentsRecalculationMethod)
  latePaymentsRecalculationMethod?: LatePaymentsRecalculationMethod;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  loanAmount: number;

  @IsString()
  loanName: string;

  @IsOptional()
  @IsEnum(LoanPenaltyCalculationMethod)
  loanPenaltyCalculationMethod?: LoanPenaltyCalculationMethod;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsNumber()
  penaltyRate: number;

  @IsOptional()
  @IsBoolean()
  prepaymentAcceptance?: boolean;

  @IsOptional()
  @IsEnum(PrepaymentRecalculationMethod)
  prepaymentRecalculationMethod?: PrepaymentRecalculationMethod;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  numInstallments: number;

  @IsOptional()
  @IsNumber()
  installmentPeriodCount?: number;

  @IsOptional()
  @IsEnum(InstallmentPeriodUnit)
  installmentPeriodUnit?: InstallmentPeriodUnit;

  @IsOptional()
  @IsNumber()
  balloonPeriodicPayment?: number;

  @IsOptional()
  @Type(() => PeriodicPayment)
  @ValidateNested()
  periodicPayments?: PeriodicPayment[];

  @IsOptional()
  @Type(() => PaymentPlan)
  @ValidateNested()
  paymentPlans?: PaymentPlan[];

  @IsOptional()
  @IsNumber()
  userId?: number;

  @IsOptional()
  @Min(0)
  @Max(100)
  @IsNumber()
  organizationCommissionPercent?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Refine((value, obj: CreateLoanAccountDto) => value < obj.numInstallments)
  startingInterestOnlyPeriodCount?: number;
}
