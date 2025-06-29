import { Injectable } from '@nestjs/common';
import Dinero from 'dinero.js';
import { DatesService } from '../../dates/dates.service';
import { Prisma } from '@prisma/client';
import { HelperService } from './helper.service';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class FlatService {
  constructor(private readonly datesService: DatesService, private readonly helperService: HelperService) {}
  generateInstallments(
    loanAccount: Prisma.LoanAccountGetPayload<{
      include: { disbursementDetails: true; product: true; paymentPlans: true };
    }>,
  ) {
    const dates = this.datesService.generateDates(loanAccount);
    const principal =
      loanAccount.paymentPlans?.length > 0
        ? this.helperService.generatePaymentPlanPrincipals({ ...loanAccount, installments: dates })
        : this.generatePrincipal({ ...loanAccount, installments: dates });
    return this.generateInterest({
      ...loanAccount,
      installments: principal.map(p => ({ ...p, principalDue: new Decimal(p.principalDue) })),
    });
  }
  generatePrincipal(
    loanAccount: Prisma.LoanAccountGetPayload<{ include: { disbursementDetails: true; installments: true } }>,
  ) {
    const { loanAmount, installments } = loanAccount;
    const principals = Dinero({ amount: +new Decimal(loanAmount).mul(100) }).allocate(
      Array(installments.length).fill(1),
    );
    return installments.map((installment, i) => ({
      ...installment,
      principalDue: new Decimal(principals[i].toUnit()),
    }));
  }
  generateInterest(
    loanAccount: Prisma.LoanAccountGetPayload<{
      include: { disbursementDetails: true; installments: true; product: true };
    }>,
  ) {
    const {
      loanAmount,
      disbursementDetails: { disbursementAt },
      installments,
    } = loanAccount;
    const outstandingPrincipal = new Decimal(loanAmount);
    let previousDueDate = disbursementAt;
    let previousInterest = new Decimal(0);
    return installments.map(installment => {
      let interestDue = this.helperService.calculateInterest(
        outstandingPrincipal,
        installment.dueDate,
        previousDueDate,
        loanAccount,
      );
      previousDueDate = installment.dueDate;
      if (installment.noInterest) {
        previousInterest = previousInterest.add(interestDue);
        interestDue = new Decimal(0);
      } else {
        interestDue = interestDue.add(previousInterest);
        previousInterest = new Decimal(0);
      }
      return {
        ...installment,
        interestDue: interestDue,
      };
    });
  }
}
