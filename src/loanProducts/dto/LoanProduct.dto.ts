import { PartialType } from '@nestjs/mapped-types';
import {
  AmortizationMethod,
  AmortizationProfile,
  AmountCalculationMethod,
  ApplyDateMethod,
  CappingConstraintType,
  CappingMethod,
  Category,
  InterestChargeFrequency,
  CurrencyCode,
  DaysInYear,
  ElementsRecalculationMethod,
  FeeAmortizationUponRescheduleOption,
  GracePeriodType,
  InstallmentAllocation,
  InstallmentCurrencyRounding,
  InstallmentElementsRoundingMethod,
  InstallmentPeriodUnit,
  InstallmentReschedulingMethod,
  InstallmentScheduleMethod,
  InterestApplicationMethod,
  InterestBalanceCalculationMethod,
  InterestCalculationMethod,
  InterestType,
  LatePaymentsRecalculationMethod,
  LoanPenaltyCalculationMethod,
  LoanProductType,
  PaymentMethod,
  PrepaymentRecalculationMethod,
  PrincipalPaidInstallmentStatus,
  Prisma,
  RoundingInstallmentScheduleMethod,
  ScheduleDueDatesMethod,
  ScheduleInterestDaysCountMethod,
  SettlementOptions,
  ShortMonthHandlingMethod,
  TaxCalculationMethod,
  TriggerPredefinedFee,
} from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDefined,
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  ValidateNested,
} from 'class-validator';

class ArrearsSettings {
  @IsNumber()
  @IsOptional()
  defaultTolerancePercentageOfOutstandingPrincipal?: number;

  @IsNumber()
  @IsOptional()
  defaultTolerancePeriod?: number;

  @IsNumber()
  @IsOptional()
  maxTolerancePercentageOfOutstandingPrincipal?: number;

  @IsNumber()
  @IsOptional()
  maxTolerancePeriod?: number;

  @IsNumber()
  @IsOptional()
  minTolerancePercentageOfOutstandingPrincipal?: number;

  @IsNumber()
  @IsOptional()
  minTolerancePeriod?: number;

  @IsNumber()
  @IsOptional()
  monthlyToleranceDay?: number;
}

class InterestRateSetting {
  @IsBoolean()
  @IsOptional()
  allowNegativeInterestRate?: boolean;

  @IsEnum(InterestChargeFrequency)
  @IsOptional()
  compoundingFrequency?: InterestChargeFrequency;

  @IsNumber()
  @IsOptional()
  defaultInterestRate?: number;

  @IsOptional()
  @IsNumber()
  maxInterestRate?: number;

  @IsOptional()
  @IsNumber()
  minInterestRate?: number;
}

class PrincipalPaymentSettings {
  @IsNumber()
  defaultAmount: number;

  @IsNumber()
  defaultPercentage: number;

  @IsNumber()
  maxAmount: number;

  @IsNumber()
  maxPercentage: number;

  @IsNumber()
  minAmount: number;

  @IsNumber()
  minPercentage: number;
}

export class PredefinedFee {
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => !!value)
  active?: boolean = true;

  @IsOptional()
  @Transform(({ value }) => value || 'NONE')
  amortizationProfile: AmortizationProfile = 'NONE';

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => +value)
  amount: number;

  @IsOptional()
  amountCalculationMethod: AmountCalculationMethod;

  @IsOptional()
  @Transform(({ value }) => value || 'MONTHLY_FROM_ACTIVATION')
  applyDateMethod?: ApplyDateMethod = 'MONTHLY_FROM_ACTIVATION';

  @IsOptional()
  @Transform(({ value }) => value || 'END_AMORTIZATION_ON_THE_ORIGINAL_ACCOUNT')
  feeAmortizationUponRescheduleOption?: FeeAmortizationUponRescheduleOption =
    'END_AMORTIZATION_ON_THE_ORIGINAL_ACCOUNT';

  @IsOptional()
  name?: string;

  @IsOptional()
  @Transform(({ value }) => +value)
  percentageAmount: number;

  @IsOptional()
  triggerPredefinedFee: TriggerPredefinedFee;
}
export class UpdatePredefinedFee extends PredefinedFee {
  id: number;
}

export class CreateLoanProductDto {
  @IsDefined()
  @IsString()
  name: string;

  @IsBoolean()
  @IsOptional()
  accrueLateInterest?: boolean;

  @IsBoolean()
  @IsOptional()
  active?: boolean;

  @IsOptional()
  @IsEnum(AmortizationMethod)
  amortizationMethod?: AmortizationMethod;

  @IsBoolean()
  @IsOptional()
  applyAutomaticInterestOnP0repayment?: boolean;

  @ValidateNested()
  @Type(() => ArrearsSettings)
  arrearsSettings?: ArrearsSettings;

  @IsBoolean()
  @IsOptional()
  cappingaApplyAccruedChargesBeforeLocking?: boolean;

  @IsOptional()
  @IsEnum(CappingConstraintType)
  cappingConstraintType?: CappingConstraintType;

  @IsOptional()
  @IsEnum(CappingMethod)
  cappingMethod?: CappingMethod;

  @IsOptional()
  @IsNumber()
  cappingPercentage?: number;

  @IsOptional()
  category?: Category;

  @IsOptional()
  @IsEnum(CurrencyCode)
  currencyCode?: CurrencyCode;

  @IsOptional()
  @IsEnum(DaysInYear)
  daysInYear?: DaysInYear;

  @IsOptional()
  @IsNumber()
  defaultFirstInstallmentDueDateOffset?: number;

  @IsOptional()
  @IsNumber()
  defaultGracePeriod?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  defaultLoanAmount?: number;

  @IsOptional()
  @IsNumber()
  defaultNumInstallments?: number;

  @IsOptional()
  @IsNumber()
  defaultPenaltyRate?: number;

  @IsNumber()
  @IsOptional()
  defaultPrincipalInstallmentInterval?: number;

  @IsNumber()
  defaultInstallmentPeriodCount?: number;

  @IsOptional()
  @IsNumber()
  dormancyPeriodDays?: number;

  @IsOptional()
  @IsEnum(ElementsRecalculationMethod)
  elementsRecalculationMethod?: ElementsRecalculationMethod;

  @IsOptional()
  @IsArray()
  fixedDaysOfMonth?: Prisma.LoanProductCreatefixedDaysOfMonthInput | number[];

  @IsBoolean()
  @IsOptional()
  futurePaymentsAcceptance?: boolean;

  @IsOptional()
  @IsEnum(GracePeriodType)
  gracePeriodType?: GracePeriodType;

  @IsOptional()
  @IsEnum(InterestApplicationMethod)
  interestApplicationMethod?: InterestApplicationMethod;

  @IsOptional()
  @IsEnum(InterestBalanceCalculationMethod)
  interestBalanceCalculationMethod?: InterestBalanceCalculationMethod;

  @IsOptional()
  @IsEnum(InterestCalculationMethod)
  interestCalculationMethod?: InterestCalculationMethod;

  @IsOptional()
  @ValidateNested()
  @Type(() => InterestRateSetting)
  interestRateSetting?: InterestRateSetting;

  @IsOptional()
  @IsEnum(InterestType)
  interestType?: InterestType;

  @IsOptional()
  @IsEnum(LatePaymentsRecalculationMethod)
  latePaymentsRecalculationMethod?: LatePaymentsRecalculationMethod;

  @IsOptional()
  @IsEnum(LoanPenaltyCalculationMethod)
  loanPenaltyCalculationMethod?: LoanPenaltyCalculationMethod;

  @IsOptional()
  @IsNumber()
  loanPenaltyGracePeriod?: number;

  @IsOptional()
  @IsEnum(LoanProductType)
  type?: LoanProductType;

  @IsOptional()
  @IsNumber()
  lockPeriodDays?: number;

  @IsOptional()
  @IsNumber()
  maxFirstInstallmentDueDateOffset?: number;

  @IsOptional()
  @IsNumber()
  maxGracePeriod?: number;

  @IsOptional()
  @IsNumber()
  maxLoanAmount?: number;

  @IsOptional()
  @IsNumber()
  maxNumberOfDisbursementTranches?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  maxNumInstallments?: number;

  @IsOptional()
  @IsNumber()
  maxPenaltyRate?: number;

  @IsOptional()
  @IsNumber()
  minFirstInstallmentDueDateOffset?: number;

  @IsOptional()
  @IsNumber()
  minGracePeriod?: number;

  @IsOptional()
  @IsNumber()
  minLoanAmount?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  minNumInstallments?: number;

  @IsOptional()
  @IsNumber()
  minPenaltyRate?: number;

  @IsOptional()
  @IsNumber()
  offsetPercentage?: number;

  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @IsBoolean()
  @IsOptional()
  prepaymentAcceptance?: boolean;

  @IsOptional()
  @IsEnum(PrepaymentRecalculationMethod)
  prepaymentRecalculationMethod?: PrepaymentRecalculationMethod;

  @IsOptional()
  @IsEnum(PrincipalPaidInstallmentStatus)
  principalPaidInstallmentStatus?: PrincipalPaidInstallmentStatus;

  @IsOptional()
  @ValidateNested()
  @Type(() => PrincipalPaymentSettings)
  principalPaymentSettings?: PrincipalPaymentSettings;

  @IsOptional()
  @IsString()
  description?: string;

  @IsBoolean()
  @IsOptional()
  allowRedraw?: boolean;

  @IsOptional()
  @IsArray()
  installmentAllocationOrder?: Prisma.LoanProductCreateinstallmentAllocationOrderInput | InstallmentAllocation[];

  @IsOptional()
  @IsEnum(InstallmentCurrencyRounding)
  installmentCurrencyRounding?: InstallmentCurrencyRounding;

  @IsOptional()
  @IsEnum(InstallmentElementsRoundingMethod)
  installmentElementsRoundingMethod?: InstallmentElementsRoundingMethod;

  @IsOptional()
  @IsEnum(InstallmentPeriodUnit)
  installmentPeriodUnit?: InstallmentPeriodUnit;

  @IsOptional()
  @IsEnum(InstallmentReschedulingMethod)
  installmentReschedulingMethod?: InstallmentReschedulingMethod;

  @IsOptional()
  @IsEnum(InstallmentScheduleMethod)
  installmentScheduleMethod?: InstallmentScheduleMethod;

  @IsOptional()
  @IsEnum(RoundingInstallmentScheduleMethod)
  roundingInstallmentScheduleMethod?: RoundingInstallmentScheduleMethod;

  @IsOptional()
  @IsEnum(ScheduleDueDatesMethod)
  scheduleDueDatesMethod?: ScheduleDueDatesMethod;

  @IsOptional()
  @IsEnum(ScheduleInterestDaysCountMethod)
  scheduleInterestDaysCountMethod?: ScheduleInterestDaysCountMethod;

  @IsOptional()
  @IsEnum(SettlementOptions)
  settlementOptions?: SettlementOptions;

  @IsOptional()
  @IsEnum(ShortMonthHandlingMethod)
  shortMonthHandlingMethod?: ShortMonthHandlingMethod;

  @IsOptional()
  @IsEnum(TaxCalculationMethod)
  taxCalculationMethod?: TaxCalculationMethod;

  @IsOptional()
  @IsBoolean()
  taxesOnFeesEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  taxesOnInterestEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  taxesOnPenaltyEnabled?: boolean;

  @IsOptional()
  @IsNumber()
  organizationCommissionPercent?: number;

  @IsOptional()
  @ValidateNested({ each: true })
  @IsArray()
  @Type(() => PredefinedFee)
  predefinedFees?: PredefinedFee[] = [];
}

export class UpdateLoanProductDto extends PartialType(CreateLoanProductDto) {
  @IsOptional()
  @ValidateNested({ each: true })
  @IsArray()
  @Type(() => PredefinedFee)
  predefinedFees?: UpdatePredefinedFee[];

  @IsBoolean()
  @IsOptional()
  deleted?: boolean;
}
