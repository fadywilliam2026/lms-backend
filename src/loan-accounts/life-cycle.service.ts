import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { AccountStateActions } from './types/account-state-actions';
import { AccountState, AccountSubState, InstallmentState, LoanAccount, LoanTransactionType } from '@prisma/client';
import { PrismaService } from 'nestjs-prisma';
import { LoanTransactionService } from '../loan-transaction/loan-transaction.service';
import { LoanManagementService } from '../loan-management/loan-management.service';
import { MakeRepaymentDto } from './dto/make-repayment.dto';
import { Decimal } from '@prisma/client/runtime/library';
import moment from 'moment';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Events } from '../common/types/event';

@Injectable()
export class LoanAccountLifeCycleService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly loanTransactionService: LoanTransactionService,
    private readonly loanManagementService: LoanManagementService,
    private readonly eventEmitter: EventEmitter2,
  ) {}
  private readonly requestApproval = async (loanAccount: LoanAccount) => {
    return await this.prismaService.loanAccount.update({
      where: { id: loanAccount.id },
      data: { accountState: AccountState.PENDING_APPROVAL },
    });
  };

  private readonly setIncomplete = async (loanAccount: LoanAccount) => {
    return await this.prismaService.loanAccount.update({
      where: { id: loanAccount.id },
      data: { accountState: AccountState.PARTIAL_APPLICATION },
    });
  };

  private readonly reject = async (loanAccount: LoanAccount) => {
    return await this.prismaService.loanAccount.update({
      where: { id: loanAccount.id },
      data: { accountState: AccountState.CLOSED, accountSubState: AccountSubState.REJECTED, closedAt: new Date() },
    });
  };

  private readonly withdraw = async (loanAccount: LoanAccount) => {
    return await this.prismaService.loanAccount.update({
      where: { id: loanAccount.id },
      data: { accountState: AccountState.CLOSED, accountSubState: AccountSubState.WITHDRAWN, closedAt: new Date() },
    });
  };

  private readonly approve = async (loanAccount: LoanAccount) => {
    return await this.prismaService.loanAccount.update({
      where: { id: loanAccount.id },
      data: { accountState: AccountState.APPROVED, approvedAt: new Date() },
    });
  };

  private readonly undoApproval = async (loanAccount: LoanAccount) => {
    return await this.prismaService.loanAccount.update({
      where: { id: loanAccount.id },
      data: { accountState: AccountState.PENDING_APPROVAL, approvedAt: null },
    });
  };

  private readonly disburse = async (
    loanAccount: LoanAccount,
    args: { userId: number; disbursementAt?: Date; firstInstallmentAt?: Date },
  ) => {
    await this.loanTransactionService.create({
      data: {
        amount: +loanAccount.loanAmount,
        entryDate: args.disbursementAt || new Date(),
        type: LoanTransactionType.DISBURSEMENT,
        loanAccountId: loanAccount.id,
        userId: args.userId,
      },
    });

    const result = await this.prismaService.loanAccount.update({
      where: { id: loanAccount.id },
      data: {
        accountState: AccountState.ACTIVE,
        disbursementDetails: {
          // TODO/QUESTION: It should be update though it wasn't created as all disbursement details fields are optional
          //                so the question is what should we do about the expectedDisbursementAt field?
          create: {
            disbursementAt: args.disbursementAt || new Date(),
            firstInstallmentAt: args.firstInstallmentAt,
          },
        },
        client: {
          update: {
            currentLimit: {
              decrement: +loanAccount.loanAmount,
            },
          },
        },
      },
      include: {
        disbursementDetails: true,
        client: true,
        user: true,
      },
    });
    await this.loanManagementService.generateInstallments(loanAccount.id);

    if (result.user.webhookUrl)
      this.eventEmitter.emit(Events.LoanAccountDisbursement, {
        loanAccountId: result.id,
        userId: result.userId,
        clientId: result.clientId,
        commercialName: result.client.commercialName,
        loanLimit: result.client.currentLimit,
        disbursmentTime: result.disbursementDetails.disbursementAt,
      });

    return result;
  };

  private readonly writeOff = async (loanAccount: LoanAccount, args: { userId: number }) => {
    await this.loanTransactionService.create({
      data: {
        amount: +loanAccount.principalBalance,
        entryDate: new Date(),
        type: LoanTransactionType.WRITE_OFF,
        loanAccountId: loanAccount.id,
        userId: args.userId,
      },
    });
    return await this.prismaService.loanAccount.update({
      where: { id: loanAccount.id },
      data: { accountState: AccountState.CLOSED, accountSubState: AccountSubState.WRITTEN_OFF, closedAt: new Date() },
    });
  };

  private readonly terminate = async (loanAccount: LoanAccount, args: { valueDate: Date; userId: number }) => {
    await this.prismaService.installment.updateMany({
      where: {
        loanAccountId: loanAccount.id,
        state: {
          not: 'PAID',
        },
      },
      data: {
        dueDate: args.valueDate,
      },
    });
    const extendedLoanAccount = await this.prismaService.loanAccount.findUnique({
      where: { id: +loanAccount.id },
      include: {
        disbursementDetails: true,
        product: { include: { predefinedFees: true } },
        periodicPayments: true,
        installments: {
          orderBy: { dueDate: 'desc' },
          where: { state: 'PAID' },
        },
      },
    });
    const fullPrepaymentAmount = this.loanManagementService.getFullPrepaymentAmount(
      extendedLoanAccount,
      args.valueDate,
    );
    await this.loanTransactionService.create({
      data: {
        principalAmount: +loanAccount.principalBalance,
        interestAmount: +new Decimal(fullPrepaymentAmount).sub(loanAccount.principalBalance),
        amount: fullPrepaymentAmount,
        entryDate: args.valueDate,
        type: LoanTransactionType.REPAYMENT,
        loanAccountId: loanAccount.id,
        userId: args.userId,
      },
    });

    return await this.prismaService.loanAccount.update({
      where: { id: loanAccount.id },
      data: {
        accountState: AccountState.CLOSED,
        accountSubState: AccountSubState.TERMINATED,
        closedAt: new Date(),
        principalBalance: 0,
        interestBalance: 0,
        feesBalance: 0,
        penaltyBalance: 0,
        client: {
          update: {
            currentLimit: {
              increment: +loanAccount.principalBalance,
            },
          },
        },
      },
    });
  };

  private readonly makeRepayment = async (loanAccount: LoanAccount, args: { makeRepaymentDto: MakeRepaymentDto }) => {
    await this.loanManagementService.makeRepayment(loanAccount.id, args.makeRepaymentDto);

    const allInstallmentsPaid = await this.loanManagementService.areInstallmentsPaid(loanAccount.id);

    if (allInstallmentsPaid) {
      return await this.prismaService.loanAccount.update({
        where: { id: loanAccount.id },
        data: {
          accountState: AccountState.CLOSED,
          accountSubState: AccountSubState.PAID,
          closedAt: args.makeRepaymentDto.valueDate,
        },
      });
    }

    return loanAccount;
  };

  private readonly makeInstallmentRepayment = async (
    loanAccount: LoanAccount,
    args: { installmentId: number; makeRepaymentDto: MakeRepaymentDto },
  ) => {
    // TODO: Refactor this out to a validation function.
    const installment = await this.prismaService.installment.findUnique({ where: { id: args.installmentId } });
    if (!installment) {
      throw new NotFoundException('Loan installment not found');
    }

    await this.loanManagementService.makeInstallmentRepayment(args.installmentId, args.makeRepaymentDto);

    const areLateInstallmentsExist = await this.loanManagementService.areLateInstallmentsExist(
      installment.loanAccountId,
    );
    if (!areLateInstallmentsExist) {
      await this.prismaService.loanAccount.update({
        where: { id: installment.loanAccountId },
        data: {
          accountState: AccountState.ACTIVE,
        },
      });
    }

    const allInstallmentsPaid = await this.loanManagementService.areInstallmentsPaid(installment.loanAccountId);
    // TODO: Refactor this out
    if (allInstallmentsPaid) {
      await this.prismaService.loanAccount.update({
        where: { id: installment.loanAccountId },
        data: {
          accountState: AccountState.CLOSED,
          accountSubState: AccountSubState.PAID,
          closedAt: args.makeRepaymentDto.valueDate,
        },
      });
    }

    // TODO/Question: Should I return installment or loan account?
    return installment;
  };

  private readonly earlyPayment = async (
    loanAccount: LoanAccount,
    args: { userId: number; makeRepaymentDto: MakeRepaymentDto },
  ) => {
    // Note: the amount can be too close to the whole loan amount
    if (args.makeRepaymentDto.amount >= +loanAccount.loanAmount)
      throw new UnprocessableEntityException('Early Payment cannot exceed Loan Amount');

    const firstInstallment = await this.prismaService.installment.findFirstOrThrow({
      where: { loanAccountId: loanAccount.id },
    });

    if (firstInstallment.state !== InstallmentState.PENDING)
      throw new UnprocessableEntityException('Cannot perform Early Payment for non Pending first installment.');

    const daysLeft = moment(firstInstallment.dueDate).diff(args.makeRepaymentDto.valueDate);
    if (daysLeft <= 0) throw new UnprocessableEntityException('Value date cannot exceeded first installment due date');

    await this.prismaService.$transaction(async prisma => {
      await prisma.installment.deleteMany({ where: { loanAccountId: loanAccount.id } });

      await prisma.loanAccount.update({
        where: { id: loanAccount.id },
        data: {
          loanAmount: loanAccount.loanAmount.minus(args.makeRepaymentDto.amount),
          accountSubState: AccountSubState.EARLY_PAYMENT,
          client: {
            update: {
              currentLimit: {
                increment: args.makeRepaymentDto.amount,
              },
            },
          },
        },
      });

      await this.loanTransactionService.create(
        {
          data: {
            amount: +args.makeRepaymentDto.amount,
            entryDate: args.makeRepaymentDto.valueDate || new Date(),
            type: LoanTransactionType.REPAYMENT,
            loanAccountId: loanAccount.id,
            userId: args.userId,
          },
        },
        prisma,
      );
      await this.loanManagementService.generateInstallments(loanAccount.id, prisma, true);
    });

    return true;
  };

  readonly stateMachine = {
    [AccountState.PARTIAL_APPLICATION]: {
      [AccountStateActions.REQUEST_APPROVAL]: this.requestApproval,
      [AccountStateActions.REJECT]: this.reject,
      [AccountStateActions.WITHDRAW]: this.withdraw,
    },
    [AccountState.PENDING_APPROVAL]: {
      [AccountStateActions.SET_INCOMPLETE]: this.setIncomplete,
      [AccountStateActions.REJECT]: this.reject,
      [AccountStateActions.WITHDRAW]: this.withdraw,
      [AccountStateActions.APPROVE]: this.approve,
    },
    [AccountState.CLOSED]: {},
    [AccountState.APPROVED]: {
      [AccountStateActions.WITHDRAW]: this.withdraw,
      [AccountStateActions.UNDO]: this.undoApproval,
      [AccountStateActions.DISBURSE]: this.disburse,
    },
    [AccountState.ACTIVE]: {
      [AccountStateActions.WRITE_OFF]: this.writeOff,
      [AccountStateActions.PAY_OFF]: null,
      [AccountStateActions.TERMINATE]: this.terminate,
      [AccountStateActions.MAKE_REPAYMENT]: this.makeRepayment,
      [AccountStateActions.MAKE_INSTALLMENT_REPAYMENT]: this.makeInstallmentRepayment,
      [AccountStateActions.EARLY_PAYMENT]: this.earlyPayment,
    },
    [AccountState.ACTIVE_IN_ARREARS]: {
      [AccountStateActions.WRITE_OFF]: this.writeOff,
      [AccountStateActions.PAY_OFF]: null,
      [AccountStateActions.TERMINATE]: this.terminate,
      [AccountStateActions.MAKE_REPAYMENT]: this.makeRepayment,
      [AccountStateActions.MAKE_INSTALLMENT_REPAYMENT]: this.makeInstallmentRepayment,
    },
  } as const;
}
