import { Injectable } from '@nestjs/common';
import { PredefinedFee, Prisma } from '@prisma/client';
import { AmortizationService } from './amortization.service';

@Injectable()
export class PaymentDueService {
  constructor(private readonly amortization: AmortizationService) {}
  getFees(fee: PredefinedFee, loanAccount: Prisma.LoanAccountGetPayload<{ include: { installments: true } }>) {
    return this.amortization.getFees(fee, loanAccount);
  }
}
