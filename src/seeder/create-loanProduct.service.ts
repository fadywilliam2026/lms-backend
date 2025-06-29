import { Injectable, ConsoleLogger } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { GlService } from '../gl/gl.service';
import {
  AmortizationProfile,
  AmountCalculationMethod,
  Category,
  DaysInYear,
  InstallmentPeriodUnit,
  InterestCalculationMethod,
  InterestChargeFrequency,
  LoanPenaltyCalculationMethod,
  LoanProductType,
  TriggerPredefinedFee,
} from '@prisma/client';

@Injectable()
export class CreateLoanProductService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: ConsoleLogger,
    private readonly glService: GlService,
  ) {}
  async seed() {
    this.logger.log('Creating loanProduct');

    await this.prisma.loanProduct.create({
      data: {
        defaultLoanAmount: 1000,
        minLoanAmount: 1000,
        maxLoanAmount: 100000,
        interestCalculationMethod: InterestCalculationMethod.FLAT,
        interestRateSetting: {
          create: {
            minInterestRate: 0,
            defaultInterestRate: 2.5,
            maxInterestRate: 150,
            compoundingFrequency: InterestChargeFrequency.ANNUALIZED,
          },
        },
        daysInYear: DaysInYear.ACTUAL_360,
        defaultInstallmentPeriodCount: 1,
        defaultNumInstallments: 10,
        minNumInstallments: 1,
        maxNumInstallments: 360,
        installmentPeriodUnit: InstallmentPeriodUnit.MONTHS,
        category: Category.SME_LENDING,
        type: LoanProductType.FIXED_TERM_LOAN,
        defaultGracePeriod: 0,
        minGracePeriod: 0,
        maxGracePeriod: 10,
        defaultPenaltyRate: 0,
        minPenaltyRate: 0,
        maxPenaltyRate: 100,
        loanPenaltyCalculationMethod: LoanPenaltyCalculationMethod.NONE,
        active: true,
        name: 'Weekly loan Zero interest Fees 1.5%',
        description: 'Weekly loan Zero interest Fees 1.5%',
        organizationCommissionPercent: 0,
        installmentAllocationOrder: [],
        predefinedFees: {
          create: {
            name: 'Fees',
            triggerPredefinedFee: TriggerPredefinedFee.DISBURSEMENT,
            amountCalculationMethod: AmountCalculationMethod.LOAN_AMOUNT_PERCENTAGE,
            amount: 0,
            percentageAmount: 10,
            amortizationProfile: AmortizationProfile.NONE,
          },
        },
        gLAccountingRule: {
          createMany: { data: await this.glService.createDefaultGLRulesBody() },
        },
      },
    });
  }
}
