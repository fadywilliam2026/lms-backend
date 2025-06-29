import { Injectable } from '@nestjs/common';
import moment = require('moment');
import { DaysInYear, Installment, InstallmentPeriodUnit, Prisma } from '@prisma/client';
import { InstallmentHelperService } from '../installment/installment.helper.service';

@Injectable()
export class DatesService {
  constructor(private readonly installmentHelper: InstallmentHelperService) {}
  generateDates(loanAccount: Prisma.LoanAccountGetPayload<{ include: { disbursementDetails: true } }>) {
    const {
      installmentPeriodUnit,
      numInstallments,
      installmentPeriodCount,
      disbursementDetails: { disbursementAt, firstInstallmentAt },
    } = loanAccount;
    const dates = Array<Installment>(numInstallments);
    if (firstInstallmentAt) {
      dates[0] = this.installmentHelper.makeInstallment({
        dueDate: moment(firstInstallmentAt).toDate(),
      });
      for (let i = 1; i < numInstallments; i++) {
        dates[i] = this.installmentHelper.makeInstallment({
          dueDate: this.getNthDate(firstInstallmentAt, i, installmentPeriodUnit, installmentPeriodCount),
        });
      }
    } else {
      for (let i = 0; i < numInstallments; i++) {
        dates[i] = this.installmentHelper.makeInstallment({
          dueDate: this.getNthDate(disbursementAt, i + 1, installmentPeriodUnit, installmentPeriodCount),
        });
      }
    }
    return dates;
  }
  getDaysInYear(daysInYear: DaysInYear) {
    switch (daysInYear) {
      case 'ACTUAL_365_FIXED':
        return 365;
      case 'ACTUAL_360':
        return 360;
      default:
        return 365;
    }
  }
  getNthDate(date: Date, n: number, installmentPeriodUnit: InstallmentPeriodUnit, installmentPeriodCount = 1) {
    return moment(date)
      .add(n * installmentPeriodCount, installmentPeriodUnit.toLowerCase() as moment.unitOfTime.DurationConstructor)
      .toDate();
  }

  getDaysDifference(date1: Date, date2: Date) {
    return moment(date2.toISOString().split('T')[0]).diff(date1.toISOString().split('T')[0], 'days');
  }
}
