import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { DisbursementService } from './disbursement/disbursement.service';
import { PaymentDueService } from './payment-due/payment-due.service';
import { SettlementFeeService } from './settlement/index.service';

@Injectable()
export class FeesService {
  constructor(
    private readonly disbursementFee: DisbursementService,
    private readonly paymentDueFee: PaymentDueService,
    private readonly settlementFee: SettlementFeeService,
  ) {}
  calculatePaymentDueFees(
    loanAccount: Prisma.LoanAccountGetPayload<{
      include: { installments: true; product: { include: { predefinedFees: true } } };
    }>,
  ) {
    return loanAccount.product.predefinedFees.map(fee => {
      switch (fee.triggerPredefinedFee) {
        case 'PAYMENT_DUE':
          return this.paymentDueFee.getFees(fee, loanAccount);
        default:
          return Array(loanAccount.numInstallments).fill(0);
      }
    });
  }
  calculateDisbursementFees(
    loanAccount: Prisma.LoanAccountGetPayload<{
      include: { installments; product: { include: { predefinedFees: true } } };
    }>,
  ) {
    const fees = loanAccount.product.predefinedFees?.map(fee => {
      switch (fee.triggerPredefinedFee) {
        case 'DISBURSEMENT':
          return this.disbursementFee.getFees(fee, loanAccount);
        default:
          return 0;
      }
    });

    return fees.length ? +Decimal.sum(...fees).toFixed(2) : 0;
  }
  calculateSettlementFee(
    loanAccount: Prisma.LoanAccountGetPayload<{
      include: { installments; product: { include: { predefinedFees: true } } };
    }>,
  ) {
    const fees = loanAccount.product.predefinedFees?.map(fee => {
      switch (fee.triggerPredefinedFee) {
        case 'SETTLEMENT':
          return this.settlementFee.getFees(fee, loanAccount);
        default:
          return 0;
      }
    });

    return fees.length ? +Decimal.sum(...fees).toFixed(2) : 0;
  }
}
