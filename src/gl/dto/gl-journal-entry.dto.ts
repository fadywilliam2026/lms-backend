import { plainToClass, Transform, Type } from 'class-transformer';
import { IsArray, IsDate, IsDefined, IsNumber, IsOptional, ValidateNested } from 'class-validator';

class Entry {
  @IsNumber()
  amount: number;

  @IsNumber()
  glAccountId: number;
}

export class CreateGLJournalEntryDTO {
  @IsDefined()
  @ValidateNested({ each: true })
  @IsArray()
  @Type(() => Entry)
  @Transform(({ value }) => value?.map(v => plainToClass(Entry, v)))
  credits: Entry[];

  @IsDefined()
  @ValidateNested({ each: true })
  @IsArray()
  @Type(() => Entry)
  @Transform(({ value }) => value?.map(v => plainToClass(Entry, v)))
  debits: Entry[];

  @IsDefined()
  @IsDate()
  @Type(() => Date)
  date: Date;

  @IsOptional()
  notes?: string;
}
