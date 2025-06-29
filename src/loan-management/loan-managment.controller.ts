import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { omit } from 'lodash';
import moment from 'moment';
import { PrismaService } from 'nestjs-prisma';
import { CalculatorDTO } from './calculator/calculator.dto';
import { InstallmentHelperService } from './installment/installment.helper.service';
import { LoanCalculationService } from './loan-calculation/loan-calculation.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Decimal } from '@prisma/client/runtime/library';
import { LoanTransactionService } from '../loan-transaction/loan-transaction.service';

@ApiTags('loan-management')
@ApiBearerAuth()
@Controller('loan-management')
export class LoanManagementController {
  constructor(
    private readonly loanCalculationService: LoanCalculationService,
    private readonly prisma: PrismaService,
    private readonly installmentHelper: InstallmentHelperService,
    private readonly loanTransactionService: LoanTransactionService,
  ) {}

  @Get('/:loanAccountId/preview-installments')
  async previewInstallments(@Param('loanAccountId') loanAccountId: string, @Query() query) {
    const date = moment(query.date);
    const loanAccount = await this.prisma.loanAccount.findUnique({
      where: { id: +loanAccountId },
      include: {
        disbursementDetails: true,
        product: { include: { predefinedFees: true } },
        periodicPayments: true,
        paymentPlans: true,
        installments: true,
      },
    });
    loanAccount.disbursementDetails = { ...loanAccount.disbursementDetails, disbursementAt: new Date() };
    const installments = (
      loanAccount.installments.length > 0
        ? loanAccount.installments
        : this.loanCalculationService.generateInstallments(loanAccount).installments
    ) as Prisma.InstallmentGetPayload<{
      include: { loanAccount: true };
    }>[];
    installments.forEach(installment => {
      if (installment.state === 'PAID') {
        return;
      }
      installment.loanAccount = omit(loanAccount, ['installments']);
      if (this.installmentHelper.isLate(installment, date)) {
        installment.state = 'LATE';
      } else if (this.installmentHelper.isGrace(installment, date)) {
        installment.state = 'GRACE';
      }
      const daysLate = this.installmentHelper.getDaysLate(installment, date);
      if (daysLate > installment.loanAccount.gracePeriod) {
        installment.penaltyDue = new Decimal(
          this.installmentHelper.getPenaltyPerDay(installment).mul(daysLate).toFixed(2),
        );
      }
    });
    return installments;
  }

  @Get('/:loanAccountId/total-prepayment-amount')
  async getTotalPrepaymentAmount(@Param('loanAccountId') loanAccountId: string, @Query() query) {
    const valueDate = query.valueDate ? new Date(query.valueDate) : new Date();
    const loanAccount = await this.prisma.loanAccount.findUnique({
      where: { id: +loanAccountId },
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
    return this.loanCalculationService.getFullPrepaymentAmount(loanAccount, valueDate);
  }

  @Get('/:loanAccountId/interest-amount-of-elapsed-days')
  async getInterestAmountOfElapsedDays(@Param('loanAccountId') loanAccountId: string, @Query() query) {
    const valueDate = query.valueDate ? new Date(query.valueDate) : new Date();
    const loanAccount = await this.prisma.loanAccount.findUnique({
      where: { id: +loanAccountId },
      include: {
        disbursementDetails: true,
        product: { include: { predefinedFees: true } },
        installments: {
          orderBy: { dueDate: 'desc' },
          where: { state: 'PAID' },
        },
      },
    });
    return this.loanCalculationService.getInterestAmountOfElapsedDays(loanAccount, valueDate).toFixed(2);
  }

  @Post('/calculator')
  async calculator(
    @Body()
    query: CalculatorDTO,
  ) {
    return this.loanCalculationService.generateInstallments(query as any);
  }

  @Get('/loan-transaction/:clientId')
  async getLoanTransaction(@Param('clientId') clientId: string) {
    return await this.loanTransactionService.getClientLoanTransaction(+clientId);
  }
}
