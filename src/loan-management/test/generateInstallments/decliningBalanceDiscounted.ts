import { Decimal } from '@prisma/client/runtime/library';
import { CreateLoanAccountDto } from '../../../loan-accounts/dto/create-loan-account.dto';
import { CreateLoanProductDto } from '../../../loanProducts/dto/LoanProduct.dto';

const loanProduct: CreateLoanProductDto = {
  name: 'Loan Product',
  amortizationMethod: 'STANDARD_PAYMENTS',
  arrearsSettings: {},
  interestRateSetting: { maxInterestRate: 121 },
  maxLoanAmount: 1001,
  maxNumInstallments: 12,
};

const loanAccount: Partial<CreateLoanAccountDto> = {
  loanName: 'Hassan',
  disbursementDetails: {
    disbursementAt: new Date('2020-01-23'),
  },
  interestRate: 120,
  interestCalculationMethod: 'DECLINING_BALANCE_DISCOUNTED',
  loanAmount: 1000,
  numInstallments: 4,
  installmentPeriodUnit: 'MONTHS',
};
const result = [
  {
    dueDate: new Date('2020-02-23'),
    interestDue: new Decimal(101.92),
    principalDue: new Decimal(213.55),
  },
  {
    dueDate: new Date('2020-03-23'),
    interestDue: new Decimal(74.98),
    principalDue: new Decimal(240.49),
  },
  {
    dueDate: new Date('2020-04-23'),
    interestDue: new Decimal(55.64),
    principalDue: new Decimal(259.83),
  },
  {
    dueDate: new Date('2020-05-23'),
    interestDue: new Decimal(28.22),
    principalDue: new Decimal(286.13),
  },
];
export default { loanAccount, result, loanProduct };
