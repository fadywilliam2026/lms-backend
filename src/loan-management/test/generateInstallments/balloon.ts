import { Decimal } from '@prisma/client/runtime/library';
import { CreateLoanAccountDto } from '../../../loan-accounts/dto/create-loan-account.dto';
import { CreateLoanProductDto } from '../../../loanProducts/dto/LoanProduct.dto';

const loanProduct: CreateLoanProductDto = {
  name: 'Loan Product',
  amortizationMethod: 'BALLOON_PAYMENTS',
  arrearsSettings: {},
  interestRateSetting: { maxInterestRate: 121 },
  maxLoanAmount: 100000,
  maxNumInstallments: 120,
};

const loanAccount: Partial<CreateLoanAccountDto> = {
  loanName: 'Hassan',
  disbursementDetails: {
    disbursementAt: new Date('2020-01-31'),
  },
  interestCalculationMethod: 'DECLINING_BALANCE',
  loanAmount: 10000,
  numInstallments: 24,
  installmentPeriodUnit: 'MONTHS',
  balloonPeriodicPayment: 41.67,
  interestRate: 0.4167,
};
const result = [
  {
    dueDate: new Date('2020-02-29'),
    principalDue: new Decimal(0),
    interestDue: new Decimal(41.67),
  },
  {
    dueDate: new Date('2020-03-31'),
    principalDue: new Decimal(0),
    interestDue: new Decimal(41.67),
  },
  {
    dueDate: new Date('2020-04-30'),
    principalDue: new Decimal(0),
    interestDue: new Decimal(41.67),
  },
  {
    dueDate: new Date('2020-05-31'),
    principalDue: new Decimal(0),
    interestDue: new Decimal(41.67),
  },
  {
    dueDate: new Date('2020-06-30'),
    principalDue: new Decimal(0),
    interestDue: new Decimal(41.67),
  },
  {
    dueDate: new Date('2020-07-31'),
    principalDue: new Decimal(0),
    interestDue: new Decimal(41.67),
  },
  {
    dueDate: new Date('2020-08-31'),
    principalDue: new Decimal(0),
    interestDue: new Decimal(41.67),
  },
  {
    dueDate: new Date('2020-09-30'),
    principalDue: new Decimal(0),
    interestDue: new Decimal(41.67),
  },
  {
    dueDate: new Date('2020-10-31'),
    principalDue: new Decimal(0),
    interestDue: new Decimal(41.67),
  },
  {
    dueDate: new Date('2020-11-30'),
    principalDue: new Decimal(0),
    interestDue: new Decimal(41.67),
  },
  {
    dueDate: new Date('2020-12-31'),
    principalDue: new Decimal(0),
    interestDue: new Decimal(41.67),
  },
  {
    dueDate: new Date('2021-01-31'),
    principalDue: new Decimal(0),
    interestDue: new Decimal(41.67),
  },
  {
    dueDate: new Date('2021-02-28'),
    principalDue: new Decimal(0),
    interestDue: new Decimal(41.67),
  },
  {
    dueDate: new Date('2021-03-31'),
    principalDue: new Decimal(0),
    interestDue: new Decimal(41.67),
  },
  {
    dueDate: new Date('2021-04-30'),
    principalDue: new Decimal(0),
    interestDue: new Decimal(41.67),
  },
  {
    dueDate: new Date('2021-05-31'),
    principalDue: new Decimal(0),
    interestDue: new Decimal(41.67),
  },
  {
    dueDate: new Date('2021-06-30'),
    principalDue: new Decimal(0),
    interestDue: new Decimal(41.67),
  },
  {
    dueDate: new Date('2021-07-31'),
    principalDue: new Decimal(0),
    interestDue: new Decimal(41.67),
  },
  {
    dueDate: new Date('2021-08-31'),
    principalDue: new Decimal(0),
    interestDue: new Decimal(41.67),
  },
  {
    dueDate: new Date('2021-09-30'),
    principalDue: new Decimal(0),
    interestDue: new Decimal(41.67),
  },
  {
    dueDate: new Date('2021-10-31'),
    principalDue: new Decimal(0),
    interestDue: new Decimal(41.67),
  },
  {
    dueDate: new Date('2021-11-30'),
    principalDue: new Decimal(0),
    interestDue: new Decimal(41.67),
  },
  {
    dueDate: new Date('2021-12-31'),
    principalDue: new Decimal(0),
    interestDue: new Decimal(41.67),
  },
  {
    dueDate: new Date('2022-01-31'),
    principalDue: new Decimal(10000),
    interestDue: new Decimal(41.67),
  },
];

export default { loanAccount, result, loanProduct };
