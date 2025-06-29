import {
  AmortizationMethod,
  DaysInYear,
  InstallmentPeriodUnit,
  InterestCalculationMethod,
  InterestChargeFrequency,
} from '@prisma/client';
import { Transform, Type, plainToClass } from 'class-transformer';
import { IsArray, IsNotEmpty, IsNumber, IsOptional, ValidateNested } from 'class-validator';
import { PaymentPlan } from '../../loan-accounts/dto/create-loan-account.dto';
import { PredefinedFee } from '../../loanProducts/dto/LoanProduct.dto';

class ProductDTO {
  @IsOptional()
  amortizationMethod?: AmortizationMethod = 'STANDARD_PAYMENTS';

  @IsOptional()
  @ValidateNested({ each: true })
  @IsArray()
  @Type(() => PredefinedFee)
  @Transform(({ value }) => value)
  predefinedFees?: PredefinedFee[] = [];

  @IsNotEmpty()
  daysInYear: DaysInYear;
}

class DisbursementDetailsDTO {
  @Transform(({ value }) => new Date(value))
  disbursementAt: Date;

  @IsOptional()
  @Transform(({ value }) => new Date(value))
  firstInstallmentAt: Date;
}
export class CalculatorDTO {
  @IsNotEmpty()
  @Transform(({ value }) => +value)
  loanAmount: number;

  @IsNotEmpty()
  @Transform(({ value }) => +value)
  interestRate: number;

  @IsNotEmpty()
  interestChargeFrequency: InterestChargeFrequency;
  @IsNotEmpty()
  interestCalculationMethod: InterestCalculationMethod;

  @IsNotEmpty()
  @Transform(({ value }) => +value)
  installmentPeriodCount: number;

  @IsNotEmpty()
  installmentPeriodUnit: InstallmentPeriodUnit;

  @IsNotEmpty()
  @Transform(({ value }) => +value)
  numInstallments: number;

  @IsNotEmpty()
  @Transform(({ value }) => +value)
  organizationCommissionPercent: number;

  @Transform(
    ({ value }) => {
      return plainToClass(ProductDTO, value);
    },
    {
      toClassOnly: true,
    },
  )
  @IsNotEmpty()
  @ValidateNested({ each: true })
  product: ProductDTO;

  @Transform(({ value }) => value, {
    toClassOnly: true,
  })
  @Type(() => DisbursementDetailsDTO)
  @IsNotEmpty()
  disbursementDetails: DisbursementDetailsDTO;

  @IsOptional()
  @Type(() => PaymentPlan)
  @ValidateNested()
  paymentPlans?: PaymentPlan[];

  @IsNumber()
  @Transform(({ value }) => +value)
  @IsOptional()
  startingInterestOnlyPeriodCount?: number;
}
