import { ApiProperty } from '@nestjs/swagger';
import { ClientState, Gender, PreferredLanguage } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsString,
  Length,
  ValidateNested,
} from 'class-validator';

export class CreateClientsDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsString()
  @IsOptional()
  commercialName: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  gender?: Gender;

  @IsDateString()
  @IsOptional()
  birthDate?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  governorate?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @ApiProperty({ example: '12345678901234' })
  nationalId: string;

  @IsNumberString()
  @Length(9, 9)
  @IsOptional()
  taxRecordId: string;

  @IsOptional()
  customFields?: any;

  @IsString()
  @IsOptional()
  notes: string;

  @IsString()
  @IsOptional()
  preferredLanguage?: PreferredLanguage;

  @IsNumber()
  @IsOptional()
  loanCycle?: number;

  @IsString()
  @IsOptional()
  state: ClientState;

  @IsNumber()
  @IsOptional()
  initialLimit?: number;

  @IsNumber()
  @IsOptional()
  currentLimit?: number;

  @IsNumber()
  @IsOptional()
  approvedLimit?: number;

  @IsNumber()
  @IsOptional()
  organizationId?: number;

  @IsOptional()
  @IsArray()
  @Type(() => Attachment)
  @ValidateNested({ each: true })
  attachments?: Attachment[];

  @IsNumber()
  @IsOptional()
  userId: number;
}

class Attachment {
  @IsString()
  type: string;

  @IsArray()
  @Type(() => File)
  @ValidateNested({ each: true })
  files: File[];
}

class File {
  @IsString()
  title: string;
}
