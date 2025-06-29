import { Injectable } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { InstallmentService } from './installment/installment.service';
import { PrismaService } from 'nestjs-prisma';
import { LoanCalculationService } from './loan-calculation/loan-calculation.service';
import { PrepaymentService } from './prepayment/prepayment.service';
import { PaymentService } from './payment/payment.service';
import { InstallmentHelperService } from './installment/installment.helper.service';
import { RecalculationService } from './recalculation/recalculation.service';
import { LoanTransactionService } from '../loan-transaction/loan-transaction.service';
import { Decimal } from '@prisma/client/runtime/library';
import { MakeRepaymentDto } from '../loan-accounts/dto/make-repayment.dto';

export type PrismaTransaction = Parameters<Parameters<typeof PrismaClient.prototype.$transaction>[0]>[0];
@Injectable()
export class LoanManagementService {
  constructor(
    private readonly installmentService: InstallmentService,
    private readonly loanCalculationService: LoanCalculationService,
    private readonly prepaymentService: PrepaymentService,
    private readonly prisma: PrismaService,
    private readonly paymentService: PaymentService,
    private readonly installmentHelperService: InstallmentHelperService,
    private readonly recalculationService: RecalculationService,
    private readonly loanTransactionService: LoanTransactionService,
  ) {}

  async generateInstallments(
    loanAccountId: number,
    txnPrisma: PrismaTransaction = this.prisma,
    ignoreDisbursementFees: boolean = false,
  ) {
    const loanAccount = await txnPrisma.loanAccount.findUnique({
      where: { id: loanAccountId },
      include: {
        disbursementDetails: true,
        product: { include: { predefinedFees: true } },
        periodicPayments: true,
        paymentPlans: true,
        installments: true,
      },
    });

    const newLoanAccountInstallments = this.loanCalculationService.generateInstallments(
      loanAccount,
      +loanAccount.feesDue,
    );
    return await this.installmentService.createInstallments(
      loanAccountId,
      newLoanAccountInstallments,
      txnPrisma,
      ignoreDisbursementFees,
    );
  }

  async getInstallments(loanAccountId: number, params?: { where: Prisma.InstallmentWhereInput }) {
    return await this.prisma.installment.findMany({
      where: { loanAccountId, ...params?.where },
      orderBy: { dueDate: 'asc' },
    });
  }
  async areInstallmentsPaid(loanAccountId: number) {
    const installmentAggregate = await this.prisma.installment.aggregate({
      where: {
        loanAccountId,
        state: {
          not: 'PAID',
        },
      },
      _count: true,
    });
    return installmentAggregate._count === 0;
  }
  async areLateInstallmentsExist(loanAccountId: number) {
    const installemtAggregate = await this.prisma.installment.aggregate({
      where: {
        loanAccountId,
        state: 'LATE',
      },
      _count: true,
    });
    return installemtAggregate._count > 0;
  }
  getDiff(
    a: Prisma.LoanAccountGetPayload<{
      select: { feesPaid: true; principalPaid: true; interestPaid: true; penaltyPaid: true };
    }>,
    b: Prisma.LoanAccountGetPayload<{
      select: { feesPaid: true; principalPaid: true; interestPaid: true; penaltyPaid: true };
    }>,
  ) {
    return {
      principalAmount: +Decimal.sub(b.principalPaid, a.principalPaid),
      feesAmount: +Decimal.sub(b.feesPaid, a.feesPaid),
      interestAmount: +Decimal.sub(b.interestPaid, a.interestPaid),
      penaltyAmount: +Decimal.sub(b.penaltyPaid, a.penaltyPaid),
    };
  }
  async makeInstallmentRepayment(installmentId: number, payment: MakeRepaymentDto) {
    const installment = await this.prisma.installment.findUnique({
      where: { id: installmentId },
      include: { loanAccount: { include: { product: true } } },
    });
    const paymentAmount = new Decimal(payment.amount);
    const { query, paymentAmount: newPaymentAmount } = this.installmentService.makeRepayment(
      installment,
      paymentAmount,
      payment.valueDate,
    );
    const newLoanAccount = await query;
    const diff = this.getDiff(installment.loanAccount, newLoanAccount);

    await this.loanTransactionService.create({
      data: {
        amount: payment.amount,
        type: 'REPAYMENT',
        entryDate: payment.valueDate,
        feesAmount: diff.feesAmount,
        principalAmount: diff.principalAmount,
        interestAmount: diff.interestAmount,
        penaltyAmount: diff.penaltyAmount,
        organizationCommissionAmount: +installment.organizationCommissionDue.mul(
          new Decimal(diff.interestAmount).div(installment.interestDue),
        ),
        loanAccountId: installment.loanAccountId,
        principalBalance: +newLoanAccount.principalBalance,
        userId: newLoanAccount.userId,
      },
    });

    await this.prisma.loanAccount.update({
      where: { id: installment.loanAccountId },
      data: {
        client: {
          update: {
            currentLimit: {
              increment: diff.principalAmount,
            },
          },
        },
      },
    });

    return newPaymentAmount;
  }
  async makeRepayment(loanAccountId: number, payment: MakeRepaymentDto) {
    const originalLoanAccount = await this.prisma.loanAccount.findUnique({
      where: { id: loanAccountId },
      include: { installments: { include: { loanAccount: { include: { product: true } } } } },
    });
    let paymentAmount = new Decimal(payment.amount);

    const { loanAccount: afterPaymentLoanAccount, paymentAmount: newPaymentAmount } =
      await this.paymentService.makeRepayment(originalLoanAccount, paymentAmount, payment.valueDate);
    paymentAmount = newPaymentAmount;
    let principalAmountPaid;
    if (!paymentAmount.isZero()) {
      const { loanAccount: afterPrepaymentLoanAccount, paymentAmount: newPaymentAmount } =
        await this.prepaymentService.makePrepayment(afterPaymentLoanAccount, paymentAmount, payment.valueDate);
      paymentAmount = newPaymentAmount;
      const { feesAmount, principalAmount, interestAmount, penaltyAmount } = this.getDiff(
        originalLoanAccount,
        afterPrepaymentLoanAccount,
      );
      principalAmountPaid = principalAmount;
      await this.loanTransactionService.create({
        data: {
          amount: +new Decimal(payment.amount).sub(paymentAmount).toFixed(2),
          type: 'REPAYMENT',
          entryDate: payment.valueDate,
          feesAmount,
          principalAmount,
          interestAmount,
          penaltyAmount,
          loanAccountId,
          principalBalance: afterPrepaymentLoanAccount.principalBalance,
          userId: afterPrepaymentLoanAccount.userId,
        },
      });

      await this.recalculationService.recalculate(afterPrepaymentLoanAccount);
    } else {
      const { feesAmount, principalAmount, interestAmount, penaltyAmount } = this.getDiff(
        originalLoanAccount,
        afterPaymentLoanAccount,
      );
      principalAmountPaid = principalAmount;
      await this.loanTransactionService.create({
        data: {
          amount: +new Decimal(payment.amount).sub(paymentAmount).toFixed(2),
          type: 'REPAYMENT',
          entryDate: payment.valueDate,
          feesAmount,
          principalAmount,
          interestAmount,
          penaltyAmount,
          loanAccountId,
          principalBalance: +afterPaymentLoanAccount.principalBalance,
          userId: afterPaymentLoanAccount.userId,
        },
      });
    }
    await this.prisma.loanAccount.update({
      where: { id: loanAccountId },
      data: {
        client: {
          update: {
            currentLimit: {
              increment: principalAmountPaid,
            },
          },
        },
      },
    });
    return +paymentAmount.toFixed(2);
  }
  async applyPenalty(loanAccountId: number) {
    const installments = await this.prisma.installment.findMany({
      where: {
        loanAccountId,
        state: {
          not: 'PAID',
        },
      },
      include: { loanAccount: { include: { product: true } } },
    });
    return await Promise.all(installments.map(installment => this.installmentService.applyPenalty(installment)));
  }
  async changeInstallmentsState(loanAccountId: number) {
    const installments = await this.prisma.installment.findMany({
      where: {
        loanAccountId,
        state: {
          not: 'PAID',
        },
      },
      include: { loanAccount: true },
    });
    return await Promise.all(
      installments.map(installment => this.installmentService.changeInstallmentState(installment)),
    );
  }
  async getDueAmount(loanAccountId: number) {
    const installments = await this.prisma.installment.findMany({
      where: {
        loanAccountId,
        state: {
          not: 'PAID',
        },
        dueDate: {
          gte: new Date(),
        },
      },
      include: { loanAccount: true },
    });
    return this.installmentHelperService.addUpMoney(
      installments.map(installment => this.installmentHelperService.getDueAmount(installment)),
    );
  }
  getFullPrepaymentAmount(
    loanAccount: Prisma.LoanAccountGetPayload<{
      include: { disbursementDetails: true; installments: true; product: { include: { predefinedFees: true } } };
    }>,
    valueDate: Date,
  ) {
    return this.loanCalculationService.getFullPrepaymentAmount(loanAccount, valueDate);
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
    return this.loanCalculationService.getInterestAmountOfElapsedDays(loanAccount, valueDate);
  }
}
