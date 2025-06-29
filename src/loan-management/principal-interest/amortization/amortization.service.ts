import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { BalloonService } from './balloon.service';
import { PaymentPlanService } from './payment-plan.service';
import { StandardPaymentService } from './standard-payment.service';

@Injectable()
export class AmortizationService {
  constructor(
    private readonly standardPaymentService: StandardPaymentService,
    private readonly paymentPlanService: PaymentPlanService,
    private readonly balloonService: BalloonService,
  ) {}

  generateInstallments(
    loanAccount: Prisma.LoanAccountGetPayload<{
      include: { disbursementDetails: true; product: true; periodicPayments: true; paymentPlans: true };
    }>,
  ) {
    switch (loanAccount.product.amortizationMethod) {
      case 'STANDARD_PAYMENTS':
        return this.standardPaymentService.generateInstallments(loanAccount);
      case 'PAYMENT_PLAN':
        return this.paymentPlanService.generateInstallments(loanAccount);
      case 'BALLOON_PAYMENTS':
        return this.balloonService.generateInstallments(loanAccount);
      default:
        throw new NotFoundException(`Unknown amortization method: ${loanAccount.product.amortizationMethod}`);
    }
  }
}
