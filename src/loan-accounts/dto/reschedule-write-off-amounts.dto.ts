import { IsNumber } from 'class-validator';

export class RescheduleWriteOffAmount {
  @IsNumber()
  fee: number;

  @IsNumber()
  interest: number;

  @IsNumber()
  principal: number;

  @IsNumber()
  penalty: number;
}
