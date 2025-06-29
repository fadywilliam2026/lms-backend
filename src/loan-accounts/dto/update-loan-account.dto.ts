import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateLoanAccountDto } from './create-loan-account.dto';

export class UpdateLoanAccountDto extends PartialType(
  OmitType(CreateLoanAccountDto, ['productId', 'userId'] as const),
) {}
