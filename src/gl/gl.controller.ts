import { Body, Controller, Get, Param, ParseIntPipe, Post, Query, Req } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'nestjs-prisma';
import { LoanTransactionService } from '../loan-transaction/loan-transaction.service';
import { CreateGLJournalEntryDTO } from './dto/gl-journal-entry.dto';
import { GlService } from './gl.service';
import { Decimal } from '@prisma/client/runtime/library';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('General Ledger')
@ApiBearerAuth()
@Controller('gl')
export class GlController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly loanTransaction: LoanTransactionService,
    private readonly glService: GlService,
  ) {}

  @Post('/account')
  async createAccount(@Body() createAccountDto: any) {
    return await this.prisma.gLAccount.create({
      data: createAccountDto,
    });
  }

  @Get('/accounts')
  async getAccounts(@Query() args: Prisma.GLAccountFindManyArgs) {
    return await this.prisma.gLAccount.findMany({ where: JSON.parse((args.where as string) || '{}') });
  }

  @Post('/transaction')
  async createTransaction(@Req() { user: { id } }, @Body() createTransaction: CreateGLJournalEntryDTO) {
    return await this.loanTransaction.createManualTransaction(id, createTransaction);
  }

  @Get('/:glAccountId/balance')
  getAccountBalance(@Param('glAccountId', ParseIntPipe) glAccountId: number) {
    return this.glService.getAccountBalance(glAccountId).then(result => {
      return result?.[0]?.balance ?? new Decimal(0);
    });
  }

  @Get('fund-utilization')
  getFundUtilization() {
    return this.glService.getFundUtilization();
  }

  @Get('/balance-sheet')
  getBalanceSheet(@Query('startDate') startDate: string, @Query('endDate') endDate: string) {
    return this.glService.getBalanceSheet(startDate, endDate);
  }

  @Get('/profit-and-loss')
  async getProfitAndLoss(@Query('startDate') startDate: string, @Query('endDate') endDate: string) {
    return await this.glService.getProfitAndLoss(startDate, endDate);
  }

  @Get('/trial-balance')
  async getTrialBalance(@Query('startDate') startDate: string, @Query('endDate') endDate: string) {
    return await this.glService.getTrialBalance(startDate, endDate);
  }

  @Get('fund-sources')
  getFundSources() {
    return this.glService.getFundSources();
  }
}
