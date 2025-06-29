import { Injectable } from '@nestjs/common';
import { PredefinedFee, Prisma } from '@prisma/client';
import { AmortizationService } from './amortization.service';

@Injectable()
export class DisbursementService {
  constructor(private readonly amortization: AmortizationService) {}
  getFees(fee: PredefinedFee, loanAccount: Prisma.LoanAccountGetPayload<{ include: { installments } }>) {
    return this.amortization.getFees(fee, loanAccount);
  }
}
