import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsOptional } from 'class-validator';

export class DisburseDto {
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  @ApiProperty({ type: Date })
  disbursementAt: Date;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  @ApiProperty({ type: Date })
  firstInstallmentAt: Date;
}
