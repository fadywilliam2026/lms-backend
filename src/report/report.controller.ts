import { UseGuards, Controller, Get, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import { ReportService } from './report.service';
import { NPLsByIntervalDto } from './dto/NPLs-by-interval.dto';
import { SMEsQueryDto } from './dto/SMEs-group-by.dto';

@ApiBearerAuth()
@UseGuards(ThrottlerGuard)
@ApiTags('reports')
@Controller('reports')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Get('all-clients')
  @HttpCode(HttpStatus.OK)
  getClients() {
    return this.reportService.getClients();
  }

  @Get('top-clients')
  @HttpCode(HttpStatus.OK)
  getTopClients() {
    return this.reportService.getTopClients();
  }

  @Get('top-industries')
  @HttpCode(HttpStatus.OK)
  async getTopIndustries() {
    return this.reportService.getTopIndustries();
  }

  @Get('trend')
  @HttpCode(HttpStatus.OK)
  getTrend() {
    return this.reportService.getTrend();
  }

  @Get('npls')
  @HttpCode(HttpStatus.OK)
  getNPLs() {
    return this.reportService.getNPLs();
  }

  @Get('fra-npls')
  @HttpCode(HttpStatus.OK)
  getFraNpls() {
    return this.reportService.getFraNpls();
  }

  @Get('loan-portfolio')
  @HttpCode(HttpStatus.OK)
  async getLoanPortfolio() {
    return this.reportService.getLoanPortfolio();
  }

  @Get('partners')
  @HttpCode(HttpStatus.OK)
  async getPartners() {
    return this.reportService.getPartners();
  }

  @Get('total-portfolio')
  @HttpCode(HttpStatus.OK)
  getTotalPortfolio() {
    return this.reportService.getTotalPortfolio();
  }

  @Get('rejected-loans')
  @HttpCode(HttpStatus.OK)
  getRejectedLoans() {
    return this.reportService.getRejectedLoans();
  }

  @Get('npls-by-intervals')
  @HttpCode(HttpStatus.OK)
  getNPLsByIntervals(@Query() NPLsByIntervalQuery: NPLsByIntervalDto) {
    return this.reportService.getNPLsByInterval(NPLsByIntervalQuery);
  }

  @Get('onboardingSMEs')
  @HttpCode(HttpStatus.OK)
  getOnboardingSMEs() {
    return this.reportService.getOnboardingSMEs();
  }

  @Get('activeSMEs')
  @HttpCode(HttpStatus.OK)
  getActiveSMEs() {
    return this.reportService.getActiveSMEs();
  }

  @Get('smes/written-off-loans')
  @HttpCode(HttpStatus.OK)
  getWrittenOffLoans(@Query() params: SMEsQueryDto) {
    const { groupBy, smeType, includeType } = params;

    const methodMap = {
      'active-total-industry': () => this.reportService.getWrittenOffLoansForActiveSMEsByIndustry(),
      'active-total-tenor': () => this.reportService.getWrittenOffLoansForActiveSMEsByTenor(),
      'active-principal-industry': () => this.reportService.getPrincipalOfWrittenOffLoansForActiveSMEsByIndustry(),
      'active-principal-tenor': () => this.reportService.getPrincipalOfWrittenOffLoansForActiveSMEsByTenor(),
      'onboarding-total-industry': () => this.reportService.getWrittenOffLoansForOnboardingSMEsByIndustry(),
      'onboarding-total-tenor': () => this.reportService.getWrittenOffLoansForOnboardingSMEsByTenor(),
      'onboarding-principal-industry': () =>
        this.reportService.getPrincipalOfWrittenOffLoansForOnboardingSMEsByIndustry(),
      'onboarding-principal-tenor': () => this.reportService.getPrincipalOfWrittenOffLoansForOnboardingSMEsByTenor(),
    };

    const key = `${smeType}-${includeType}-${groupBy}` as keyof typeof methodMap;
    return methodMap[key]();
  }

  @Get('smes/late-repayment-loans')
  @HttpCode(HttpStatus.OK)
  getLoanReport(@Query() params: SMEsQueryDto) {
    const { groupBy, smeType, includeType } = params;

    const methodMap = {
      'active-total-industry': () => this.reportService.getLateRepaymentsLoansForActiveSMEsByIndustry(),
      'active-total-tenor': () => this.reportService.getLateRepaymentsLoansForActiveSMEsByTenor(),
      'active-principal-industry': () => this.reportService.getPrincipalLateRepaymentsLoansForActiveSMEsByIndustry(),
      'active-principal-tenor': () => this.reportService.getPrincipalLateRepaymentsLoansForActiveSMEsByTenor(),
      'active-income-industry': () => this.reportService.getIncomeLateRepaymentsLoansForActiveSMEsByIndustry(),
      'active-income-tenor': () => this.reportService.getIncomeLateRepaymentsLoansForActiveSMEsByTenor(),
      'onboarding-total-industry': () => this.reportService.getLateRepaymentsLoansForOnboardingSMEsByIndustry(),
      'onboarding-total-tenor': () => this.reportService.getLateRepaymentsLoansForOnboardingSMEsByTenor(),
      'onboarding-principal-industry': () =>
        this.reportService.getPrincipalLateRepaymentsLoansForOnboardingSMEsByIndustry(),
      'onboarding-principal-tenor': () => this.reportService.getPrincipalLateRepaymentsLoansForOnboardingSMEsByTenor(),
      'onboarding-income-industry': () => this.reportService.getIncomeLateRepaymentsLoansForOnboardingSMEsByIndustry(),
      'onboarding-income-tenor': () => this.reportService.getIncomeLateRepaymentsLoansForOnboardingSMEsByTenor(),
    };

    const key = `${smeType}-${includeType}-${groupBy}` as keyof typeof methodMap;
    return methodMap[key]();
  }

  @Get('no_loans_disbursed_for_active_clients_industry')
  @HttpCode(HttpStatus.OK)
  getNoLoansDisbursedForActiveClients() {
    return this.reportService.getNumberOfLoansDisbursedByIndustryForActiveClients();
  }

  @Get('no_loans_disbursed_for_ordinary_clients_industry')
  @HttpCode(HttpStatus.OK)
  getNoLoansDisbursedForOrdinaryClients() {
    return this.reportService.getNumberOfLoansDisbursedByIndustryForOrdinaryClients();
  }

  @Get('no_loans_disbursed_for_active_clients_by_tenor')
  @HttpCode(HttpStatus.OK)
  getNoLoansDisbursedForActiveClientsByTenor() {
    return this.reportService.getNumberOfLoansDisbursedByTenorForActiveClients();
  }

  @Get('no_loans_disbursed_for_ordinary_clients_by_tenor')
  @HttpCode(HttpStatus.OK)
  getNoLoansDisbursedForOrdinaryClientsByTenor() {
    return this.reportService.getNumberOfLoansDisbursedByTenorForOrdinaryClients();
  }

  @Get('Value_loans_disbursed_for_active_clients_industry')
  @HttpCode(HttpStatus.OK)
  getValueLoansDisbursedForActiveClients() {
    return this.reportService.getValueOfLoansDisbursedByIndustryForActiveClients();
  }

  @Get('Value_loans_disbursed_for_ordinary_clients_industry')
  @HttpCode(HttpStatus.OK)
  getValueLoansDisbursedForOrdinaryClients() {
    return this.reportService.getValueOfLoansDisbursedByIndustryForOrdinaryClients();
  }

  @Get('Value_loans_disbursed_for_active_clients_by_tenor')
  @HttpCode(HttpStatus.OK)
  getValueLoansDisbursedForActiveClientsByTenor() {
    return this.reportService.getValueOfLoansDisbursedByTenorForActiveClients();
  }

  @Get('Value_loans_disbursed_for_ordinary_clients_by_tenor')
  @HttpCode(HttpStatus.OK)
  getValueLoansDisbursedForOrdinaryClientsByTenor() {
    return this.reportService.getValueOfLoansDisbursedByTenorForOrdinaryClients();
  }

  @Get('income_loans_disbursed_for_active_clients_industry')
  @HttpCode(HttpStatus.OK)
  getIncomeLoansDisbursedForActiveClients() {
    return this.reportService.getIncomeOfLoansDisbursedByIndustryForActiveClients();
  }

  @Get('income_loans_disbursed_for_ordinary_clients_industry')
  @HttpCode(HttpStatus.OK)
  getIncomeLoansDisbursedForOrdinaryClients() {
    return this.reportService.getIncomeOfLoansDisbursedByIndustryForOrdinaryClients();
  }

  @Get('income_loans_disbursed_for_active_clients_by_tenor')
  @HttpCode(HttpStatus.OK)
  getIncomeLoansDisbursedForActiveClientsByTenor() {
    return this.reportService.getIncomeOfLoansDisbursedByTenorForActiveClients();
  }

  @Get('income_loans_disbursed_for_ordinary_clients_by_tenor')
  @HttpCode(HttpStatus.OK)
  getIncomeLoansDisbursedForOrdinaryClientsByTenor() {
    return this.reportService.getIncomeOfLoansDisbursedByTenorForOrdinaryClients();
  }
}
