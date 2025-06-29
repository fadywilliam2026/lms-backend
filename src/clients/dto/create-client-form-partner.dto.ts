import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsPositive,
  IsString,
  Length,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { CreateClientsDto } from './create-clients.dto';
import { PartialType } from '@nestjs/mapped-types';
import { CustomFieldsAnswers } from './validate-answers.dto';
import { DuePaymentHistory, Holder, PaymentFrequency, Transfer } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class Transaction {
  @IsNumber()
  @IsPositive()
  timestamp: number;

  @IsNumber()
  amount: number;
}

enum UseOfProceeds {
  inventory = 'inventory',
  marketing = 'marketing',
}

enum IScore {
  bad = 'bad',
  good = 'good',
  very_good = 'very_good',
  excellent = 'excellent',
}

enum Location {
  A = 'A',
  B = 'B',
  C = 'C',
  A_B = 'A_B',
  B_C = 'B_C',
  A_C = 'A_C',
  A_B_C = 'A_B_C',
}

enum OwnershipStatus {
  owned = 'owned',
  rented = 'rented',
  both = 'both',
}

export class CreateClientFromPartnerDto extends PartialType(CreateClientsDto) {
  @IsString()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  commercialName: string;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  startDate?: Date;

  @IsNumber()
  @IsOptional()
  @IsInt()
  requestedLoanTenor?: number;

  @IsNumber()
  @IsOptional()
  @Min(1)
  numberOfBranches?: number;

  @IsNumber()
  @Max(3)
  @Min(1)
  @IsInt()
  @IsOptional()
  reputation?: number;

  @IsEnum(OwnershipStatus)
  @IsOptional()
  ownershipStatus?: OwnershipStatus;

  @IsEnum(Location)
  @IsOptional()
  location?: Location;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsInt()
  @IsOptional()
  productMixPercent?: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsInt()
  @IsOptional()
  grossMarginPercent?: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsInt()
  @IsOptional()
  partnerCoveragePercent?: number;

  @IsBoolean()
  @IsOptional()
  seasonalityEffect?: boolean;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsInt()
  @IsOptional()
  importedRawMaterialPercent?: number;

  @IsNumber()
  @IsInt()
  @IsOptional()
  durationOfSameInventoryStorage?: number;

  @IsNumber()
  @IsInt()
  @IsOptional()
  numberDistributionsPerMonth?: number;

  @IsOptional()
  @IsInt()
  inventoryDaysOnHand?: number;

  @IsOptional()
  @IsInt()
  receivablesDaysOnHand?: number;

  @IsOptional()
  @IsInt()
  payableDaysOnHand?: number;

  @IsEnum(IScore)
  @IsOptional()
  personalIScore?: IScore;

  @IsEnum(IScore)
  @IsOptional()
  companyCreditCheck?: IScore;

  @IsOptional()
  @IsInt()
  investments?: number;

  @IsOptional()
  @IsInt()
  liabilities?: number;

  @IsEnum(UseOfProceeds)
  @IsOptional()
  useOfProceeds?: UseOfProceeds;

  @IsEnum(DuePaymentHistory)
  @IsOptional()
  @ApiProperty({ example: 'NO' })
  duePaymentHistory?: DuePaymentHistory;

  @IsOptional()
  @IsNumber()
  historicalLoansCount?: number;

  @IsOptional()
  @IsNumber()
  partnerHistoricalLoansCount?: number;

  @IsOptional()
  @IsNumber()
  yearsOfOperations?: number;

  @IsOptional()
  @IsNumber()
  pastDuesCount?: number;

  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({ example: 'email@test.com' })
  email: string;

  @IsNumberString({ no_symbols: true })
  @Length(11, 11)
  @IsNotEmpty()
  @ApiProperty({ example: '01000000000' })
  phone: string;

  @IsString()
  @IsNotEmpty()
  governorate: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @ValidateNested({ each: true })
  @Type(() => CustomFieldsAnswers)
  customFields: CustomFieldsAnswers;

  @ValidateNested({ each: true })
  @Type(() => Transaction)
  transactions: Transaction[];

  @IsEnum(PaymentFrequency)
  paymentFrequency: PaymentFrequency;

  @IsString()
  taxRecordId: string;
}

export class CreateClientForCreditEngineDto extends CreateClientFromPartnerDto {
  @IsNumber()
  clientId: number;

  @IsNumber()
  organizationId: number;

  @IsEnum(Holder)
  controlOfCashFlow: Holder;

  @IsEnum(Holder)
  carrierOfPaymentRisk: Holder;

  @IsEnum(Transfer)
  methodOfLoanRepayment: Transfer;
}
