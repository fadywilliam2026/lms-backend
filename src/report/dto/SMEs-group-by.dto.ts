import { IsEnum, IsNotEmpty } from 'class-validator';

export enum SMEType {
  ACTIVE = 'active',
  ONBOARDING = 'onboarding',
}

export enum GroupBy {
  INDUSTRY = 'industry',
  TENOR = 'tenor',
}

export enum IncludeType {
  TOTAL = 'total',
  PRINCIPAL = 'principal',
  income = 'income',
}

export class SMEsQueryDto {
  @IsEnum(SMEType)
  @IsNotEmpty()
  smeType: SMEType;

  @IsEnum(GroupBy)
  @IsNotEmpty()
  groupBy: GroupBy;

  @IsEnum(IncludeType)
  @IsNotEmpty()
  includeType: IncludeType;
}
