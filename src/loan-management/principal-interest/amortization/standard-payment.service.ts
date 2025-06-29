import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CalculationService } from '../calculation/calculation.service';

@Injectable()
export class StandardPaymentService {
  constructor(private readonly calculationService: CalculationService) {}
  generateInstallments(
    loanAccount: Prisma.LoanAccountGetPayload<{
      include: { disbursementDetails: true; product: true; periodicPayments: true; paymentPlans: true };
    }>,
  ) {
    return this.calculationService.generateInstallments(loanAccount);
  }
}
