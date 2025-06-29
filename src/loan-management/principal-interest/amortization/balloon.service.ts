import { Injectable } from '@nestjs/common';
import { DatesService } from '../../dates/dates.service';
import { Prisma } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class BalloonService {
  constructor(private readonly dateService: DatesService) {}
  generateInstallments(loanAccount: Prisma.LoanAccountGetPayload<{ include: { disbursementDetails: true } }>) {
    const { loanAmount, balloonPeriodicPayment, interestRate } = loanAccount;
    const dates = this.dateService.generateDates(loanAccount);
    let previousBalance = new Decimal(loanAmount);

    for (let i = 0; i < dates.length; i++) {
      const interestDue = previousBalance.mul(interestRate / 100);
      const principalDue = i === dates.length - 1 ? previousBalance : Decimal.sub(balloonPeriodicPayment, interestDue);
      dates[i].interestDue = new Decimal(interestDue.toFixed(2));
      dates[i].principalDue = new Decimal(principalDue.toFixed(2));
      previousBalance = previousBalance.sub(principalDue);
    }
    return dates;
  }
}
