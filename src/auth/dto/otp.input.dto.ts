import { PickType } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class VerifyOTPDto {
  @IsNotEmpty()
  phone: string;

  @IsNotEmpty()
  otp: string;
}

export class PhoneDTO extends PickType(VerifyOTPDto, ['phone']) {}
