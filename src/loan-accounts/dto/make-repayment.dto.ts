import { Type } from 'class-transformer';
import { IsDate, IsNumber } from 'class-validator';

export class MakeRepaymentDto {
  @IsNumber()
  amount: number;

  @IsDate()
  @Type(() => Date)
  valueDate: Date;
}
