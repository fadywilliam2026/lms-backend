import { AmortizationMethod, InterestCalculationMethod, LoanProduct } from '@prisma/client';
import { validateRange } from '../common/helpers/general.helper';
import { LoanProductsService } from '../loanProducts/loanProducts.service';
import { CreateLoanAccountDto } from './dto/create-loan-account.dto';
import { UpdateLoanAccountDto } from './dto/update-loan-account.dto';
import { sumBy } from 'lodash';
import { BadRequestException } from '@nestjs/common';

export const setCreateLoanAccountDtoDefaults = async (
  createLoanAccountDto: CreateLoanAccountDto,
  loanProductService: LoanProductsService,
  loanProduct: LoanProduct,
) => {
  const interestProductSettings = await loanProductService.findInterestProductSettings(
    loanProduct.interestRateSettingsId,
  );

  createLoanAccountDto.gracePeriod ??= loanProduct.defaultGracePeriod;
  createLoanAccountDto.gracePeriodType ??= loanProduct.gracePeriodType;
  createLoanAccountDto.interestCalculationMethod ??= loanProduct.interestCalculationMethod;

  createLoanAccountDto.interestRate ??= interestProductSettings.defaultInterestRate;

  createLoanAccountDto.interestType ??= loanProduct.interestType;
  createLoanAccountDto.latePaymentsRecalculationMethod ??= loanProduct.latePaymentsRecalculationMethod;
  createLoanAccountDto.loanPenaltyCalculationMethod ??= loanProduct.loanPenaltyCalculationMethod;
  createLoanAccountDto.loanAmount ??= loanProduct.defaultLoanAmount;

  if (loanProduct.amortizationMethod == AmortizationMethod.BALLOON_PAYMENTS) {
    createLoanAccountDto.balloonPeriodicPayment ??= 0;
  }

  createLoanAccountDto.prepaymentAcceptance ??= loanProduct.prepaymentAcceptance;
  createLoanAccountDto.prepaymentRecalculationMethod ??= loanProduct.prepaymentRecalculationMethod;

  createLoanAccountDto.numInstallments ??= loanProduct.defaultNumInstallments;
  createLoanAccountDto.installmentPeriodCount ??= loanProduct.defaultInstallmentPeriodCount;
  createLoanAccountDto.installmentPeriodUnit ??= loanProduct.installmentPeriodUnit;
  createLoanAccountDto.organizationCommissionPercent ??= loanProduct.organizationCommissionPercent;
};

// TODO:  Sayed mentioned that this validation is lazy and it's because it doesn't
//        account for cases where two conflicting fields are set together.
export const validateLoanAccountDto = (
  loanAccountDto: CreateLoanAccountDto | UpdateLoanAccountDto,
  loanProduct: LoanProduct,
) => {
  // validateRange(
  //   loanAccountDto.defaultFirstInstallmentDueDateOffset,
  //   loanProduct.minFirstInstallmentDueDateOffset,
  //   loanProduct.maxFirstInstallmentDueDateOffset,
  //   'Default first installment due date offset must conform to the loan product constraints',
  // );

  validateRange(
    loanAccountDto.gracePeriod,
    loanProduct.minGracePeriod,
    loanProduct.maxGracePeriod,
    'Grace period must conform to the loan product constraints',
  );

  validateRange(
    loanAccountDto.loanAmount,
    loanProduct.minLoanAmount,
    loanProduct.maxLoanAmount,
    'Loan amount must conform to the loan product constraints',
  );

  validateRange(
    loanAccountDto.numInstallments,
    loanProduct.minNumInstallments,
    loanProduct.maxNumInstallments,
    'Number of installments must conform to the loan product constraints',
  );

  validateRange(
    loanAccountDto.penaltyRate,
    loanProduct.minPenaltyRate,
    loanProduct.maxPenaltyRate,
    'Penalty rate must conform to the loan product constraints',
  );
  if (loanAccountDto.paymentPlans && loanAccountDto.paymentPlans.length > 0) {
    if (sumBy(loanAccountDto.paymentPlans, 'amount') !== loanAccountDto.loanAmount)
      throw new BadRequestException("Payment plan amounts doesn't match loan amount");
    if (loanAccountDto.interestCalculationMethod == InterestCalculationMethod.DECLINING_BALANCE_DISCOUNTED)
      throw new BadRequestException('Cannot have payment plan with equal installments');
  }
};
