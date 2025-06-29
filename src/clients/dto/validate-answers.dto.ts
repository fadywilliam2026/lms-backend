import { Type } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsOptional, IsString, Length, ValidateNested } from 'class-validator';

export class CustomFieldsAnswers {
  @IsString()
  @IsNotEmpty()
  commercialRecord: string;

  @IsString()
  @IsOptional()
  establishmentDate: string;

  @IsString()
  @IsNotEmpty()
  industry: string;
}

class ExtraFields {
  @IsString()
  @IsNotEmpty()
  legalStructure: string;

  @IsString()
  @IsNotEmpty()
  annualRevenueInLastYear: string;

  @IsString()
  @IsNotEmpty()
  monthlyTransactionVolume: string;

  @IsString()
  @IsNotEmpty()
  noOfFullTimeEmployees: string;
}

export class ValidateAnswersDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @Length(14, 14)
  @IsString()
  nationalId: string;

  @IsString()
  @IsNotEmpty()
  commercialName: string;

  @IsString()
  @IsNotEmpty()
  taxRecordId: string;

  @IsString()
  @IsNotEmpty()
  address: string;

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
  @Type(() => ExtraFields)
  extraFields: ExtraFields;
}
