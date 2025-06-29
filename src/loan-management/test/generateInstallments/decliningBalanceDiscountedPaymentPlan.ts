import { Decimal } from '@prisma/client/runtime/library';
import { CreateLoanAccountDto } from '../../../loan-accounts/dto/create-loan-account.dto';
import { CreateLoanProductDto } from '../../../loanProducts/dto/LoanProduct.dto';

const loanProduct: CreateLoanProductDto = {
  name: 'Loan Product',
  amortizationMethod: 'PAYMENT_PLAN',
  arrearsSettings: {},
  interestRateSetting: {},
  maxLoanAmount: 100000,
  maxNumInstallments: 120,
};

const loanAccount: Partial<CreateLoanAccountDto> = {
  loanName: 'Hassan',
  disbursementDetails: {
    disbursementAt: new Date('2019-12-02'),
  },
  loanAmount: 1000,
  installmentPeriodUnit: 'MONTHS',
  numInstallments: 15,
  periodicPayments: [
    {
      pmt: 200,
      endingInstallmentPosition: 12,
    },
    {
      pmt: 80,
      endingInstallmentPosition: 15,
    },
  ],
};

const result = [
  {
    dueDate: new Date('2020-01-02'),
    interestDue: new Decimal(175.75),
    principalDue: new Decimal(24.25),
  },
  {
    dueDate: new Date('2020-02-02'),
    interestDue: new Decimal(171.49),
    principalDue: new Decimal(28.51),
  },
  {
    dueDate: new Date('2020-03-02'),
    interestDue: new Decimal(166.48),
    principalDue: new Decimal(33.52),
  },
  {
    dueDate: new Date('2020-04-02'),
    interestDue: new Decimal(160.59),
    principalDue: new Decimal(39.41),
  },
  {
    dueDate: new Date('2020-05-02'),
    interestDue: new Decimal(153.66),
    principalDue: new Decimal(46.34),
  },
  {
    dueDate: new Date('2020-06-02'),
    interestDue: new Decimal(145.52),
    principalDue: new Decimal(54.48),
  },
  {
    dueDate: new Date('2020-07-02'),
    interestDue: new Decimal(135.94),
    principalDue: new Decimal(64.06),
  },
  {
    dueDate: new Date('2020-08-02'),
    interestDue: new Decimal(124.69),
    principalDue: new Decimal(75.31),
  },
  {
    dueDate: new Date('2020-09-02'),
    interestDue: new Decimal(111.45),
    principalDue: new Decimal(88.55),
  },
  {
    dueDate: new Date('2020-10-02'),
    interestDue: new Decimal(95.89),
    principalDue: new Decimal(104.11),
  },
  {
    dueDate: new Date('2020-11-02'),
    interestDue: new Decimal(77.59),
    principalDue: new Decimal(122.41),
  },
  {
    dueDate: new Date('2020-12-02'),
    interestDue: new Decimal(56.08),
    principalDue: new Decimal(143.92),
  },
  {
    dueDate: new Date('2021-01-02'),
    interestDue: new Decimal(30.78),
    principalDue: new Decimal(49.22),
  },
  {
    dueDate: new Date('2021-02-02'),
    interestDue: new Decimal(22.13),
    principalDue: new Decimal(57.87),
  },
  {
    dueDate: new Date('2021-03-02'),
    interestDue: new Decimal(11.96),
    principalDue: new Decimal(68.04),
  },
];

export default { loanAccount, result, loanProduct };
