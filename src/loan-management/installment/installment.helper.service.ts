import { Injectable } from '@nestjs/common';
import { Installment, InstallmentState, Prisma } from '@prisma/client';
import moment = require('moment');
import uniq from 'lodash/uniq';
import compact from 'lodash/compact';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class InstallmentHelperService {
  getOverDuePrincipal(installment: Installment): Decimal {
    const { principalDue, principalPaid } = installment;
    return Decimal.sub(principalDue, principalPaid);
  }
  getOverdueInterest(installment: Installment): Decimal {
    const { interestDue, interestPaid } = installment;
    return Decimal.sub(interestDue, interestPaid);
  }
  getDaysLate(installment: Installment, date = moment()) {
    const { dueDate, state } = installment;
    const daysDiff = date.diff(moment(dueDate).startOf('D'), 'days');
    return Math.max(state === 'PAID' ? 0 : daysDiff, 0);
  }
  getPaymentAllocation(
    installment: Prisma.InstallmentGetPayload<{ include: { loanAccount: { include: { product: true } } } }>,
    paymentAmount: Decimal,
  ) {
    const toPay = {
      principalToPay: 0,
      interestToPay: 0,
      feesToPay: 0,
      penaltyToPay: 0,
    };
    const repaymentAllocationOrder = uniq([
      ...installment.loanAccount.product.installmentAllocationOrder,
      'PENALTY',
      'INTEREST',
      'PRINCIPAL',
      'FEES',
    ]);
    for (const allocation of repaymentAllocationOrder) {
      if (paymentAmount.isZero()) break;
      const allocationAmount = new Decimal(installment[`${allocation.toLowerCase()}Due`]).minus(
        installment[`${allocation.toLowerCase()}Paid`],
      );
      if (allocationAmount.isPositive()) {
        const minAmount = Decimal.min(paymentAmount, allocationAmount);
        toPay[`${allocation.toLowerCase()}ToPay`] = +minAmount.toFixed(2);
        paymentAmount = paymentAmount.sub(minAmount);
      }
    }
    const totalToBePaid = this.addUpMoney(Object.values(toPay));
    return {
      toPay,
      paymentAmount,
      state: (this.getDueAmount(installment) === totalToBePaid ? 'PAID' : 'PARTIALLY_PAID') as InstallmentState,
    };
  }
  isLate(installment: Prisma.InstallmentGetPayload<{ include: { loanAccount: true } }>, date = moment()) {
    const {
      dueDate,
      loanAccount: { gracePeriod },
    } = installment;
    return date.isAfter(moment(dueDate).add(gracePeriod, 'days'));
  }
  isGrace(installment: Prisma.InstallmentGetPayload<{ include: { loanAccount: true } }>, date = moment()) {
    const {
      dueDate,
      loanAccount: { gracePeriod },
    } = installment;
    return date.isSameOrAfter(moment(dueDate)) && moment().isSameOrBefore(moment(dueDate).add(gracePeriod, 'days'));
  }
  isDue(installment: Installment) {
    const { dueDate } = installment;
    return moment().isSameOrAfter(moment(dueDate));
  }
  getPenaltyPerDay(installment: Prisma.InstallmentGetPayload<{ include: { loanAccount: true } }>) {
    switch (installment.loanAccount.loanPenaltyCalculationMethod) {
      case 'OVERDUE_PRINCIPAL':
        return this.getOverDuePrincipal(installment).mul(installment.loanAccount.penaltyRate / 100);
      case 'OVERDUE_PRINCIPAL_AND_INTEREST':
        return this.getOverDuePrincipal(installment)
          .add(this.getOverdueInterest(installment))
          .mul(installment.loanAccount.penaltyRate / 100);
      default:
        return new Decimal(0);
    }
  }
  addUpMoney(arr: number[]) {
    return arr?.length ? Decimal.sum(...arr).toNumber() : 0;
  }

  addUpDecimalMoney(arr: Decimal[]) {
    return new Decimal(arr?.length ? Decimal.sum(...arr).toFixed(2) : 0);
  }
  getDueAmount(installment: Installment) {
    const { principalDue, interestDue, feesDue, penaltyDue } = installment;
    const { principalPaid, interestPaid, feesPaid, penaltyPaid } = installment;
    const totalDue = this.addUpDecimalMoney(compact([principalDue, interestDue, feesDue, penaltyDue]));
    const totalPaid = this.addUpDecimalMoney(compact([principalPaid, interestPaid, feesPaid, penaltyPaid]));
    return Math.max(0, +Decimal.sub(totalDue, totalPaid).toNumber());
  }
  makeInstallment(data: {
    dueDate: Date;
    interestDue?: Decimal;
    principalDue?: Decimal;
    noInterest?: boolean;
  }): Installment {
    return {
      feesDue: new Decimal(0),
      feesPaid: new Decimal(0),
      interestDue: new Decimal(0),
      interestPaid: new Decimal(0),
      penaltyDue: new Decimal(0),
      penaltyPaid: new Decimal(0),
      principalDue: new Decimal(0),
      principalPaid: new Decimal(0),
      state: 'PENDING',
      noInterest: false,
      ...data,
    } as Installment;
  }
  getUnPaidInstallments<T extends Installment>(installments: T[]): T[] {
    return installments
      .sort((a, b) => a.dueDate.valueOf() - b.dueDate.valueOf())
      .filter(installment => installment.state !== 'PAID');
  }
  getLastPaidInstallment<T extends Installment>(installments: T[]): T {
    return installments
      .sort((a, b) => b.dueDate.valueOf() - a.dueDate.valueOf())
      .find(installment => installment.state === 'PAID');
  }
}
