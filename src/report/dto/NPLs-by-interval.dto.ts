import { Transform, Type } from 'class-transformer';
import { IsDate, IsNumber, IsString } from 'class-validator';

export class NPLsByIntervalDto {
  @IsDate()
  @Transform(({ value }) => new Date(value))
  @Type(() => Date)
  referenceDate: Date;

  @IsNumber()
  intervalLimitDays: number;

  @IsString()
  dueField: string;
}
