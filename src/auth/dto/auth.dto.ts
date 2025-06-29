import { ApiProperty } from '@nestjs/swagger';
import { Holder, Transfer } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDefined,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  Matches,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3, { message: 'First name must be at least 3 characters long' })
  @Matches(/^[a-zA-Z0-9-_.]+$/, {
    message: 'First name must not contain white space or special characters except - _ and .',
  })
  firstName: string;

  @IsOptional()
  @IsString()
  @MinLength(3, { message: 'Last name must be at least 3 characters long' })
  @Matches(/^[a-zA-Z0-9-_.]+$/, {
    message: 'Last name must not contain white space or special characters except - _ and .',
  })
  lastName?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email?: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/, {
    message:
      'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character such as @$!%*?&',
  })
  password?: string;

  @IsString()
  @IsNotEmpty()
  @IsPhoneNumber('EG')
  phone?: string;

  @IsOptional()
  organizationId?: number;
  @IsOptional()
  customFields?: any;

  @IsString()
  @IsOptional()
  role?: string;

  @IsInt()
  roleId: number;

  @IsOptional()
  @IsArray()
  @Type(() => Attachment)
  @ValidateNested({ each: true })
  attachments?: Attachment[];

  @IsEnum(Holder)
  controlOfCashFlow: Holder;

  @IsEnum(Holder)
  carrierOfPaymentRisk: Holder;

  @IsEnum(Transfer)
  methodOfLoanRepayment: Transfer;
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
export class LoginDto {
  @IsDefined()
  @IsEmail()
  @ApiProperty({ example: 'admin@test.com' })
  email: string;

  @IsDefined()
  @MinLength(8)
  @ApiProperty({ example: '12345678' })
  password: string;
}
