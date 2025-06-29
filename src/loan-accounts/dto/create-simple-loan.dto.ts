import { PaymentFrequency } from '@prisma/client';
import { IsEnum, IsNumber, IsPositive, IsString, Length } from 'class-validator';

export class CreateSimpleLoanDto {
  @IsNumber()
  @IsPositive()
  loanAmount: number;

  @IsString()
  @Length(14, 14)
  nationalId: string;

  @IsNumber()
  organizationId: number;

  @IsEnum(PaymentFrequency)
  paymentFrequency: PaymentFrequency;

  @IsNumber()
  tenor: number;
}
