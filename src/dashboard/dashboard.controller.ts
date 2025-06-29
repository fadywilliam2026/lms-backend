import { Controller, Get, Query, StreamableFile, UseGuards } from '@nestjs/common';
import { AccountState } from '@prisma/client';
import { DashboardService } from './dashboard.service';
import { DateQueryDto } from './date-query.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';

@ApiBearerAuth()
@UseGuards(ThrottlerGuard)
@Throttle({ default: { limit: 3, ttl: 60000 } })
@ApiTags('dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('clients')
  getClientsTotals() {
    return this.dashboardService.getClientsTotalbyState();
  }

  @Get('LoanPortfolioStatus')
  getLoanPortfolioStatus() {
    return this.dashboardService.getLoansStates();
  }

  @Get('loans')
  getLoanAmountsStats() {
    return this.dashboardService.getLoanAmountsStats();
  }

  @Get('collections')
  getRepaymentTransactions(@Query() query: DateQueryDto) {
    return this.dashboardService.getRepaymentTransactions(query);
  }

  @Get('disbursements')
  getDisbursementTransactions(@Query() query: DateQueryDto) {
    return this.dashboardService.getDisbursementTransactions(query);
  }

  @Get('latePayments')
  getLatePayments() {
    return this.dashboardService.getLatePayments();
  }

  @Get('activeOrganizations')
  getActiveOrganizations(@Query() query: { 'states[]': AccountState[] }) {
    const states = query['states[]'];
    return this.dashboardService.getActiveOrganizations(states);
  }

  @Get('loans-by-client-industry')
  getLoansByClientIndustry(@Query() query: { 'states[]': AccountState[] }) {
    const states = query['states[]'];
    return this.dashboardService.getLoansByClientIndustry(states);
  }

  @Get('loans-by-organization-industry')
  getLoansByOrganizationIndustry() {
    return this.dashboardService.getLoansByOrganizationIndustry();
  }

  @Get('loans-by-organization-sub-industry')
  getLoansByOrganizationSubIndustry() {
    return this.dashboardService.getLoansByOrganizationSubIndustry();
  }

  @Get('loans-by-tenor')
  getLoansByTenor(@Query() query: { 'states[]': AccountState[] }) {
    const states = query['states[]'];
    return this.dashboardService.getLoansByTenor(states);
  }

  @Get('expected')
  getExpectedInstallments(@Query() query: DateQueryDto) {
    return this.dashboardService.getExpectedInstallments(query);
  }

  @Get('var')
  getValueAtRisk() {
    return this.dashboardService.getValueAtRisk();
  }

  @Get('var-data')
  getValueAtRiskData() {
    return this.dashboardService.getValueAtRiskData();
  }

  @Get('credit-limits')
  getCreditLimits() {
    return this.dashboardService.getCreditLimits();
  }

  @Get('loan-transactions')
  async getLoanTransactions() {
    const csvReport = await this.dashboardService.getLoanTransaction();

    return new StreamableFile(csvReport, {
      disposition: 'attachment; filename=loan_transactions.csv',
    });
  }
}
