import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsOptional } from 'class-validator';
import { AccountStateActions } from '../types/account-state-actions';

export class ChangeStateDto {
  @IsEnum(AccountStateActions)
  action: AccountStateActions;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  valueDate?: Date;
}
