import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Events } from '../common/types/event';
import { PrismaService } from 'nestjs-prisma';
import { NotifyClientService } from './notify-client.service';
import { Decimal } from '@prisma/client/runtime/library';
@Injectable()
export class LoanAccountListener {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifyClientService: NotifyClientService,
  ) {}

  @OnEvent(Events.LoanAccountCreated)
  async handleLoanAccountCreatedEvent(loanAccountId: number) {
    const loanAccount = await this.prisma.loanAccount.findUnique({
      where: { id: loanAccountId },
      select: {
        clientId: true,
      },
    });

    const client = await this.prisma.client.findUnique({
      where: { id: loanAccount.clientId },
    });

    await this.notifyClientService.notifyClient(Events.LoanAccountCreated, client, loanAccount);
  }

  @OnEvent(Events.LoanAccountApproved)
  async handleLoanAccountApprovedEvent(loanAccountId: number) {
    const loanAccount = await this.prisma.loanAccount.findUnique({
      where: { id: loanAccountId },
      select: {
        clientId: true,
      },
    });

    const client = await this.prisma.client.findUnique({
      where: { id: loanAccount.clientId },
    });

    await this.notifyClientService.notifyClient(Events.LoanAccountApproved, client, loanAccount);
  }

  @OnEvent(Events.LoanAccountRejected)
  async handleLoanAccountRejectedEvent(loanAccountId: number) {
    const loanAccount = await this.prisma.loanAccount.findUnique({
      where: { id: loanAccountId },
      select: {
        clientId: true,
      },
    });

    const client = await this.prisma.client.findUnique({
      where: { id: loanAccount.clientId },
    });

    await this.notifyClientService.notifyClient(Events.LoanAccountRejected, client, loanAccount);
  }

  @OnEvent(Events.LoanAccountDisbursement)
  async handleLoanAccountDisbursementEvent(loanAccount: { clientId: number }) {
    const client = await this.prisma.client.findUnique({
      where: { id: loanAccount.clientId },
    });

    await this.notifyClientService.notifyClient(Events.LoanAccountDisbursement, client, loanAccount);
  }

  @OnEvent(Events.LoanAccountWriteOff)
  async handleLoanAccountWriteOffEvent(loanAccountId: number) {
    const loanAccount = await this.prisma.loanAccount.findUnique({
      where: { id: loanAccountId },
      select: {
        clientId: true,
      },
    });

    const client = await this.prisma.client.findUnique({
      where: { id: loanAccount.clientId },
    });

    await this.notifyClientService.notifyClient(Events.LoanAccountWriteOff, client, loanAccount);
  }

  @OnEvent(Events.LoanAccountClosed)
  async handleLoanAccountClosedEvent(loanAccountId: number) {
    const loanAccount = await this.prisma.loanAccount.findUnique({
      where: { id: loanAccountId },
      select: {
        clientId: true,
      },
    });

    const client = await this.prisma.client.findUnique({
      where: { id: loanAccount.clientId },
    });

    await this.notifyClientService.notifyClient(Events.LoanAccountClosed, client, loanAccount);
  }

  @OnEvent(Events.LoanAccountRefinanced)
  async handleLoanAccountRefinancedEvent(loanAccountId: number) {
    const loanAccount = await this.prisma.loanAccount.findUnique({
      where: { id: loanAccountId },
      select: {
        clientId: true,
      },
    });

    const client = await this.prisma.client.findUnique({
      where: { id: loanAccount.clientId },
    });

    await this.notifyClientService.notifyClient(Events.LoanAccountRefinanced, client, loanAccount);
  }

  @OnEvent(Events.LoanAccountInArrears)
  async handleLoanAccountInArrearsEvent(loanAccountId: number) {
    const loanAccount = await this.prisma.loanAccount.findUnique({
      where: { id: loanAccountId },
      select: {
        clientId: true,
      },
    });

    const client = await this.prisma.client.findUnique({
      where: { id: loanAccount.clientId },
    });

    const lateInstallments = await this.prisma.installment.findMany({
      where: { loanAccountId: loanAccountId, state: 'LATE' },
    });

    let totalLatePayments = new Decimal(0);

    for (const installment of lateInstallments) {
      const { feesDue, interestDue, principalDue, penaltyDue, organizationCommissionDue, fundersInterestDue } =
        installment;

      totalLatePayments = totalLatePayments
        .add(feesDue)
        .add(interestDue)
        .add(principalDue)
        .add(penaltyDue)
        .add(organizationCommissionDue)
        .add(fundersInterestDue);
    }

    await this.notifyClientService.notifyClient(Events.LoanAccountInArrears, client, {
      totalLatePayments,
    });
  }

  @OnEvent(Events.LoanAccountUpdated)
  async handleLoanAccountUpdatedEvent(loanAccountId: number) {
    const loanAccount = await this.prisma.loanAccount.findUnique({
      where: { id: loanAccountId },
      select: {
        clientId: true,
      },
    });

    const client = await this.prisma.client.findUnique({
      where: { id: loanAccount.clientId },
    });

    await this.notifyClientService.notifyClient(Events.LoanAccountUpdated, client);
  }

  @OnEvent(Events.LoanAccountInstallmentDue)
  async handleLoanAccountInstallmentDueEvent(loanAccountId: number) {
    const loanAccount = await this.prisma.loanAccount.findUnique({
      where: { id: loanAccountId },
      select: {
        clientId: true,
      },
    });

    const client = await this.prisma.client.findUnique({
      where: { id: loanAccount.clientId },
    });

    const installment = await this.prisma.installment.findFirst({
      where: { loanAccountId, state: 'PENDING' },
      orderBy: { dueDate: 'asc' },
    });

    const { dueDate, feesDue, interestDue, principalDue, penaltyDue, organizationCommissionDue, fundersInterestDue } =
      installment;

    const installmentAmount = feesDue
      .add(interestDue)
      .add(principalDue)
      .add(penaltyDue)
      .add(organizationCommissionDue)
      .add(fundersInterestDue);

    //TODO: function to calculate late payments

    await this.notifyClientService.notifyClient(Events.LoanAccountInstallmentDue, client, {
      dueDate,
      installmentAmount,
    });
  }

  @OnEvent(Events.LoanAccountInstallmentPaid)
  async handleLoanAccountInstallmentPaidEvent(loanAccountId: number) {
    const loanAccount = await this.prisma.loanAccount.findUnique({
      where: { id: loanAccountId },
      select: {
        clientId: true,
      },
    });

    const client = await this.prisma.client.findUnique({
      where: { id: loanAccount.clientId },
    });

    const loanAccountInstallment = await this.prisma.installment.findFirst({
      where: { loanAccountId: loanAccountId, state: 'PAID' },
      orderBy: { dueDate: 'desc' },
    });

    const { feesPaid, interestPaid, principalPaid, penaltyPaid } = loanAccountInstallment;

    const installmentAmount = feesPaid.add(interestPaid).add(principalPaid).add(penaltyPaid);

    await this.notifyClientService.notifyClient(Events.LoanAccountInstallmentPaid, client, {
      installmentAmount,
    });
  }
}
