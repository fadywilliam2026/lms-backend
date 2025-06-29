import { CreateLoanAccountDto } from '../../../loan-accounts/dto/create-loan-account.dto';
import { CreateLoanProductDto } from '../../../loanProducts/dto/LoanProduct.dto';

const loanProduct: CreateLoanProductDto = {
  name: 'Loan Product',
  amortizationMethod: 'STANDARD_PAYMENTS',
  predefinedFees: [
    {
      amount: 500,
      amountCalculationMethod: 'FLAT',
      amortizationProfile: 'SUM_OF_YEARS_DIGITS',
      percentageAmount: 0,
      triggerPredefinedFee: 'DISBURSEMENT',
    },
  ],
  arrearsSettings: {},
  interestRateSetting: {},
  maxLoanAmount: 10000,
  maxNumInstallments: 120,
};

const loanAccount: Partial<CreateLoanAccountDto> = {
  loanName: 'Hassan',
  disbursementDetails: {
    disbursementAt: new Date('2015-01-01'),
  },
  loanAmount: 6000,
  numInstallments: 6,
  installmentPeriodUnit: 'MONTHS',
};

const installments = [
  {
    dueDate: new Date('2015-02-01'),
    interestDue: 60.0,
    principalDue: 975.29,
  },
  {
    dueDate: new Date('2015-03-01'),
    interestDue: 50.25,
    principalDue: 985.04,
  },
  {
    dueDate: new Date('2015-04-01'),
    interestDue: 40.4,
    principalDue: 994.89,
  },
  {
    dueDate: new Date('2015-05-01'),
    interestDue: 30.45,
    principalDue: 1004.84,
  },
  {
    dueDate: new Date('2015-06-01'),
    interestDue: 20.4,
    principalDue: 1014.89,
  },
  {
    dueDate: new Date('2015-07-01'),
    interestDue: 10.25,
    principalDue: 1025.05,
  },
];
const result = [[142.86, 119.05, 95.24, 71.43, 47.62, 23.81]];

export default { loanAccount, result, loanProduct, installments };
