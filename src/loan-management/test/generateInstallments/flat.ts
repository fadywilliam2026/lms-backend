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
  interestCalculationMethod: 'FLAT',
  loanAmount: 1000,
  numInstallments: 4,
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
    interestDue: new Decimal(95.34),
  },
  {
    dueDate: new Date('2020-04-23'),
    principalDue: new Decimal(250),
    interestDue: new Decimal(101.92),
  },
  {
    dueDate: new Date('2020-05-23'),
    principalDue: new Decimal(250),
    interestDue: new Decimal(98.63),
  },
];

export default { loanAccount, result, loanProduct };
