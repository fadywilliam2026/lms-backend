import { Type } from 'class-transformer';
import { IsDate, IsOptional, IsString } from 'class-validator';

export class DateQueryDto {
  @IsString()
  @IsOptional()
  window: 'DAY' | 'WEEK' | 'MONTH';

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  start: Date;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  end: Date;
}
