import { FinancialResource } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class UpdateAccountingRuleDto {
  @IsEnum(FinancialResource)
  financialResource: FinancialResource;

  glAccountId: number;
}
