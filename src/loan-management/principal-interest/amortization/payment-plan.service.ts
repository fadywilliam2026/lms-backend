import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { irr } from 'financial';
import { DatesService } from '../../dates/dates.service';

@Injectable()
export class PaymentPlanService {
  constructor(private readonly dateService: DatesService) {}

  generateInstallments(
    loanAccount: Prisma.LoanAccountGetPayload<{ include: { disbursementDetails: true; periodicPayments: true } }>,
  ) {
    const dates = this.dateService.generateDates(loanAccount);

    let cashflow = [-loanAccount.loanAmount];

    for (const payment of loanAccount.periodicPayments) {
      cashflow.push(...Array(payment.endingInstallmentPosition - cashflow.slice(1).length).fill(payment.pmt));
    }

    const interestRate = irr(cashflow) * 100;
    let previousBalance = new Decimal(loanAccount.loanAmount);
    cashflow = cashflow.slice(1);
    for (let i = 0; i < cashflow.length; i++) {
      const interestDue = previousBalance.mul(interestRate / 100);
      const principalDue = new Decimal(cashflow[i]).sub(interestDue);
      dates[i].interestDue = new Decimal(interestDue.toFixed(2));
      dates[i].principalDue = new Decimal(principalDue.toFixed(2));
      previousBalance = previousBalance.sub(principalDue);
    }
    return dates;
  }
}
