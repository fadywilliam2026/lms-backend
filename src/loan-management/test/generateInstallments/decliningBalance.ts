import { Decimal } from '@prisma/client/runtime/library';
import { CreateLoanAccountDto } from '../../../loan-accounts/dto/create-loan-account.dto';
import { CreateLoanProductDto } from '../../../loanProducts/dto/LoanProduct.dto';

const loanProduct: CreateLoanProductDto = {
  name: 'Loan Product',
  amortizationMethod: 'STANDARD_PAYMENTS',
  arrearsSettings: {},
  interestRateSetting: { maxInterestRate: 121 },
  maxLoanAmount: 100000,
  maxNumInstallments: 120,
};

const loanAccount: Partial<CreateLoanAccountDto> = {
  loanName: 'Hassan',
  disbursementDetails: {
    disbursementAt: new Date('2020-01-23'),
  },
  interestRate: 120,
  interestCalculationMethod: 'DECLINING_BALANCE',
  loanAmount: 1000,
  numInstallments: 4,
  installmentPeriodUnit: 'MONTHS',
};
const result = [
  {
    dueDate: new Date('2020-02-23'),
    principalDue: new Decimal(250),
    interestDue: new Decimal(101.92),
  },
  {
    dueDate: new Date('2020-03-23'),
    principalDue: new Decimal(250),
    interestDue: new Decimal(71.51),
  },
  {
    dueDate: new Date('2020-04-23'),
    principalDue: new Decimal(250),
    interestDue: new Decimal(50.96),
  },
  {
    dueDate: new Date('2020-05-23'),
    principalDue: new Decimal(250),
    interestDue: new Decimal(24.66),
  },
];

export default { loanAccount, result, loanProduct };
