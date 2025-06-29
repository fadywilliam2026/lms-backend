import { Injectable } from '@nestjs/common';
import { DaysInYear, InstallmentPeriodUnit, InterestChargeFrequency, Prisma } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { sortBy } from 'lodash';
import moment from 'moment';
import { DatesService } from '../../dates/dates.service';
import { InstallmentHelperService } from '../../installment/installment.helper.service';

@Injectable()
export class HelperService {
  constructor(
    private readonly datesService: DatesService,
    private readonly installmentHelper: InstallmentHelperService,
  ) {}
  calculateInterest(
    outstandingPrincipal: Decimal,
    currentDueDate: Date,
    previousDueDate: Date,
    loanAccount: Prisma.LoanAccountGetPayload<{ include: { product: true; disbursementDetails: true } }>,
  ) {
    const { daysInYear } = loanAccount.product;
    const {
      interestRate,
      interestChargeFrequency,
      installmentPeriodUnit,
      installmentPeriodCount,
      disbursementDetails: { disbursementAt, firstInstallmentAt },
    } = loanAccount;

    if (
      daysInYear == DaysInYear.ACTUAL_365_FIXED ||
      (previousDueDate == disbursementAt && moment(currentDueDate).diff(moment(firstInstallmentAt)) == 0)
    ) {
      return Decimal.mul(
        outstandingPrincipal,
        this.calculatePeriodicInterest(interestRate, interestChargeFrequency, InstallmentPeriodUnit.YEARS),
      )
        .mul(new Decimal(this.datesService.getDaysDifference(previousDueDate, currentDueDate)))
        .div(this.datesService.getDaysInYear(daysInYear));
    } else {
      const daysDiff = this.datesService.getDaysDifference(previousDueDate, currentDueDate);
      const nextInstallment = this.datesService.getNthDate(
        previousDueDate,
        1,
        installmentPeriodUnit,
        installmentPeriodCount,
      );
      const normalDaysDiff = this.datesService.getDaysDifference(previousDueDate, nextInstallment);
      return Decimal.mul(
        outstandingPrincipal,
        this.calculatePeriodicInterest(interestRate, interestChargeFrequency, installmentPeriodUnit),
      )
        .mul(installmentPeriodCount)
        .mul(daysDiff)
        .div(normalDaysDiff);
    }
  }
  calculatePeriodicInterest(
    interestRate: number,
    interestChargeFrequency: InterestChargeFrequency,
    installmentPeriodUnit: InstallmentPeriodUnit,
  ) {
    const conversionTable = {
      [InterestChargeFrequency.ANNUALIZED]: {
        [InstallmentPeriodUnit.DAYS]: 365,
        [InstallmentPeriodUnit.WEEKS]: 52,
        [InstallmentPeriodUnit.MONTHS]: 12,
        [InstallmentPeriodUnit.QUARTERS]: 4,
        [InstallmentPeriodUnit.YEARS]: 1,
      },
      [InterestChargeFrequency.EVERY_QUARTER]: {
        [InstallmentPeriodUnit.DAYS]: 365 / 4,
        [InstallmentPeriodUnit.WEEKS]: 52 / 4,
        [InstallmentPeriodUnit.MONTHS]: 3,
        [InstallmentPeriodUnit.QUARTERS]: 1,
        [InstallmentPeriodUnit.YEARS]: 1 / 4,
      },
      [InterestChargeFrequency.EVERY_MONTH]: {
        [InstallmentPeriodUnit.DAYS]: 30,
        [InstallmentPeriodUnit.WEEKS]: 4,
        [InstallmentPeriodUnit.MONTHS]: 1,
        [InstallmentPeriodUnit.QUARTERS]: 1 / 3,
        [InstallmentPeriodUnit.YEARS]: 1 / 12,
      },
      [InterestChargeFrequency.EVERY_WEEK]: {
        [InstallmentPeriodUnit.DAYS]: 7,
        [InstallmentPeriodUnit.WEEKS]: 1,
        [InstallmentPeriodUnit.MONTHS]: 1 / 4,
        [InstallmentPeriodUnit.QUARTERS]: 1 / 13,
        [InstallmentPeriodUnit.YEARS]: 1 / 52,
      },
      [InterestChargeFrequency.EVERY_DAY]: {
        [InstallmentPeriodUnit.DAYS]: 1,
        [InstallmentPeriodUnit.WEEKS]: 1 / 7,
        [InstallmentPeriodUnit.MONTHS]: 1 / 30,
        [InstallmentPeriodUnit.QUARTERS]: 1 / 90,
        [InstallmentPeriodUnit.YEARS]: 1 / 365,
      },
    };
    return interestRate / 100 / conversionTable[interestChargeFrequency][installmentPeriodUnit];
  }
  calculateInterestOverDays(
    outstandingPrincipal: Decimal,
    currentDueDate: Date,
    previousDueDate: Date,
    loanAccount: Prisma.LoanAccountGetPayload<{ include: { product: true } }>,
  ) {
    const { daysInYear } = loanAccount.product;
    const { interestRate, interestChargeFrequency } = loanAccount;
    return outstandingPrincipal
      .mul(this.calculatePeriodicInterest(interestRate, interestChargeFrequency, InstallmentPeriodUnit.YEARS))
      .mul(this.datesService.getDaysDifference(previousDueDate, currentDueDate))
      .div(this.datesService.getDaysInYear(daysInYear));
  }

  generatePaymentPlanPrincipals(
    loanAccount: Prisma.LoanAccountGetPayload<{
      include: { disbursementDetails: true; installments: true; paymentPlans: true };
    }>,
  ) {
    const {
      installments,
      paymentPlans,
      disbursementDetails: { disbursementAt },
    } = loanAccount;
    paymentPlans.forEach(payment => {
      const date = this.datesService.getNthDate(disbursementAt, 1, payment.periodUnit, payment.periodCount);
      const installment = installments.find(e => e.dueDate.toDateString() == date.toDateString());
      if (installment) installment.principalDue = new Decimal(payment.amount);
      else {
        const installmentAfter = installments.find(e => e.dueDate.valueOf() > date.valueOf());

        installments.push(
          this.installmentHelper.makeInstallment({
            dueDate: date,
            principalDue: new Decimal(payment.amount),
            noInterest: installmentAfter ? true : false,
          }),
        );
      }
    });

    return sortBy(installments, 'dueDate');
  }
}
