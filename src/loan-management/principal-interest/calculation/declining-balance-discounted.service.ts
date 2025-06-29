import { Injectable } from '@nestjs/common';
import { DatesService } from '../../dates/dates.service';
import { pmt, ppmt } from 'financial';
import sum from 'lodash/sum';
import { Installment, Prisma } from '@prisma/client';
import { HelperService } from './helper.service';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class DecliningBalanceDiscountedService {
  constructor(
    private readonly datesService: DatesService,
    private readonly helperService: HelperService,
  ) {}

  generatePrincipal(
    loanAccount: Prisma.LoanAccountGetPayload<{ include: { disbursementDetails; installments: true } }>,
  ) {
    const { loanAmount, interestRate, installments, interestChargeFrequency, installmentPeriodUnit } = loanAccount;
    const principalDues = Array(installments.length);
    for (let i = 0; i < installments.length; i++) {
      principalDues[i] = +new Decimal(
        ppmt(
          this.helperService.calculatePeriodicInterest(interestRate, interestChargeFrequency, installmentPeriodUnit),
          i + 1,
          installments.length,
          -loanAmount,
        ),
      ).toFixed(2);
    }
    principalDues[0] = +loanAmount.sub(sum(principalDues.slice(1))).toFixed(2);
    return installments.map((installment, i) => ({
      ...installment,
      principalDue: principalDues[i],
    }));
  }
  generateInstallments(
    loanAccount: Prisma.LoanAccountGetPayload<{ include: { disbursementDetails: true; product: true } }>,
  ) {
    const dates = this.datesService.generateDates(loanAccount);
    return this.generateInstallmentsWithExistingDates(loanAccount, dates);
  }
  generateInstallmentsWithExistingDates(
    loanAccount: Prisma.LoanAccountGetPayload<{ include: { disbursementDetails: true; product: true } }>,
    dates: Installment[],
  ) {
    const {
      loanAmount,
      interestRate,
      disbursementDetails: { disbursementAt },
      interestChargeFrequency,
      installmentPeriodUnit,
      startingInterestOnlyPeriodCount = 0,
    } = loanAccount;
    let outstandingPrincipal = loanAmount;

    const fixedPmt = pmt(
      this.helperService.calculatePeriodicInterest(interestRate, interestChargeFrequency, installmentPeriodUnit),
      dates.length - startingInterestOnlyPeriodCount,
      -loanAmount,
    );
    let previousDueDate = disbursementAt;
    return dates.map((installment, i) => {
      const interestDue = this.helperService.calculateInterest(
        outstandingPrincipal,
        installment.dueDate,
        previousDueDate,
        loanAccount,
      );
      const principalDue =
        i === dates.length - 1
          ? outstandingPrincipal
          : i < startingInterestOnlyPeriodCount
            ? 0
            : Decimal.sub(fixedPmt, interestDue);
      outstandingPrincipal = Decimal.sub(outstandingPrincipal, principalDue);
      previousDueDate = installment.dueDate;
      return {
        ...installment,
        interestDue: new Decimal(interestDue.toFixed(2)),
        principalDue: new Decimal(principalDue.toFixed(2)),
      };
    });
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
    let outstandingPrincipal = new Decimal(loanAmount);
    let previousDueDate = disbursementAt;
    return installments.map(installment => {
      const interestDue = this.helperService.calculateInterest(
        outstandingPrincipal,
        installment.dueDate,
        previousDueDate,
        loanAccount,
      );
      outstandingPrincipal = outstandingPrincipal.sub(installment.principalDue);
      previousDueDate = installment.dueDate;
      return {
        ...installment,
        interestDue: new Decimal(interestDue.toFixed(2)),
      };
    });
  }
}
