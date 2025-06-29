import { Injectable } from '@nestjs/common';
import { Installment, Prisma } from '@prisma/client';
import { FeesService } from '../fees/fees.service';
import { InstallmentHelperService } from '../installment/installment.helper.service';
import { PrincipalInterestService } from '../principal-interest/principal-interest.service';
import zip from 'lodash/zip';
import map from 'lodash/map';
import _ from 'lodash';
import { Decimal } from '@prisma/client/runtime/library';
import { HelperService } from '../principal-interest/calculation/helper.service';

@Injectable()
export class LoanCalculationService {
  constructor(
    private readonly principalInterestService: PrincipalInterestService,
    private readonly installmentHelperService: InstallmentHelperService,
    private readonly feesService: FeesService,
    private readonly helperService: HelperService,
  ) {}
  generateInstallments(
    loanAccount: Prisma.LoanAccountGetPayload<{
      include: {
        disbursementDetails: true;
        product: { include: { predefinedFees: true } };
        periodicPayments: true;
        paymentPlans: true;
        installments: true;
      };
    }>,
    oldDisbursementFee?: number,
  ) {
    const newInstallments: Installment[] = this.principalInterestService.generateInstallments(loanAccount);

    (loanAccount.principalDue = this.installmentHelperService.addUpDecimalMoney(map(newInstallments, 'principalDue'))),
      (loanAccount.interestDue = this.installmentHelperService.addUpDecimalMoney(map(newInstallments, 'interestDue'))),
      (loanAccount.feesDue = this.installmentHelperService.addUpDecimalMoney(map(newInstallments, 'feesDue'))),
      (loanAccount.installments = newInstallments.map(installment => ({
        ...installment,
        interestDue: new Decimal(installment.interestDue.toFixed(2)),
        feesDue: new Decimal(installment.feesDue.toFixed(2)),
        principalDue: new Decimal(installment.principalDue.toFixed(2)),
        organizationCommissionDue: new Decimal(
          new Decimal(loanAccount.organizationCommissionPercent).mul(installment.interestDue).div(100).toFixed(2),
        ),
      })));

    const fees = zip.apply(_, this.calculatePaymentDueFees(loanAccount));
    const disbursementFee = oldDisbursementFee || this.feesService.calculateDisbursementFees(loanAccount);
    return {
      ...loanAccount,
      feesDue: new Decimal(disbursementFee),
      installments: fees?.length
        ? loanAccount.installments.map((installment, i) => ({
            ...installment,
            feesDue: this.installmentHelperService.addUpDecimalMoney(fees[i]),
          }))
        : loanAccount.installments,
    };
  }

  calculatePaymentDueFees(
    loanAccount: Prisma.LoanAccountGetPayload<{
      include: { installments: true; product: { include: { predefinedFees: true } } };
    }>,
  ) {
    return this.feesService.calculatePaymentDueFees(loanAccount);
  }
  getFullPrepaymentAmount(
    loanAccount: Prisma.LoanAccountGetPayload<{
      include: { disbursementDetails: true; installments: true; product: { include: { predefinedFees: true } } };
    }>,
    valueDate: Date,
  ) {
    const interestDue = this.getInterestAmountOfElapsedDays(loanAccount, valueDate);
    const settlementFee = this.feesService.calculateSettlementFee(loanAccount);
    return +Decimal.max(0, interestDue).plus(settlementFee).plus(loanAccount.principalBalance).toFixed(2);
  }

  getInterestAmountOfElapsedDays(
    loanAccount: Prisma.LoanAccountGetPayload<{
      include: {
        installments: true;
        disbursementDetails: true;
        product: true;
      };
    }>,
    valueDate: Date,
  ) {
    const lastPaidInstallment =
      loanAccount.installments?.[0]?.dueDate || loanAccount.disbursementDetails.disbursementAt;

    return this.helperService.calculateInterestOverDays(
      new Decimal(loanAccount.principalBalance),
      valueDate,
      lastPaidInstallment,
      loanAccount,
    );
  }
}
