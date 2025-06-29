import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AmortizationService } from './amortization/amortization.service';

@Injectable()
export class PrincipalInterestService {
  constructor(private readonly amortizationService: AmortizationService) {}
  generateInstallments(
    loanAccount: Prisma.LoanAccountGetPayload<{
      include: { disbursementDetails: true; periodicPayments: true; product: true; paymentPlans: true };
    }>,
  ) {
    return this.amortizationService.generateInstallments(loanAccount);
  }
}
