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
  balloonPeriodicPayment: 250,
  interestRate: 0.4167,
};
const result = [
  {
    dueDate: new Date('2020-02-29'),
    principalDue: new Decimal(208.33),
    interestDue: new Decimal(41.67),
  },
  {
    dueDate: new Date('2020-03-31'),
    principalDue: new Decimal(209.2),
    interestDue: new Decimal(40.8),
  },
  {
    dueDate: new Date('2020-04-30'),
    principalDue: new Decimal(210.07),
    interestDue: new Decimal(39.93),
  },
  {
    dueDate: new Date('2020-05-31'),
    principalDue: new Decimal(210.95),
    interestDue: new Decimal(39.05),
  },
  {
    dueDate: new Date('2020-06-30'),
    principalDue: new Decimal(211.82),
    interestDue: new Decimal(38.18),
  },
  {
    dueDate: new Date('2020-07-31'),
    principalDue: new Decimal(212.71),
    interestDue: new Decimal(37.29),
  },
  {
    dueDate: new Date('2020-08-31'),
    principalDue: new Decimal(213.59),
    interestDue: new Decimal(36.41),
  },
  {
    dueDate: new Date('2020-09-30'),
    principalDue: new Decimal(214.48),
    interestDue: new Decimal(35.52),
  },
  {
    dueDate: new Date('2020-10-31'),
    principalDue: new Decimal(215.38),
    interestDue: new Decimal(34.62),
  },
  {
    dueDate: new Date('2020-11-30'),
    principalDue: new Decimal(216.27),
    interestDue: new Decimal(33.73),
  },
  {
    dueDate: new Date('2020-12-31'),
    principalDue: new Decimal(217.18),
    interestDue: new Decimal(32.82),
  },
  {
    dueDate: new Date('2021-01-31'),
    principalDue: new Decimal(218.08),
    interestDue: new Decimal(31.92),
  },
  {
    dueDate: new Date('2021-02-28'),
    principalDue: new Decimal(218.99),
    interestDue: new Decimal(31.01),
  },
  {
    dueDate: new Date('2021-03-31'),
    principalDue: new Decimal(219.9),
    interestDue: new Decimal(30.1),
  },
  {
    dueDate: new Date('2021-04-30'),
    principalDue: new Decimal(220.82),
    interestDue: new Decimal(29.18),
  },
  {
    dueDate: new Date('2021-05-31'),
    principalDue: new Decimal(221.74),
    interestDue: new Decimal(28.26),
  },
  {
    dueDate: new Date('2021-06-30'),
    principalDue: new Decimal(222.66),
    interestDue: new Decimal(27.34),
  },
  {
    dueDate: new Date('2021-07-31'),
    principalDue: new Decimal(223.59),
    interestDue: new Decimal(26.41),
  },
  {
    dueDate: new Date('2021-08-31'),
    principalDue: new Decimal(224.52),
    interestDue: new Decimal(25.48),
  },
  {
    dueDate: new Date('2021-09-30'),
    principalDue: new Decimal(225.46),
    interestDue: new Decimal(24.54),
  },
  {
    dueDate: new Date('2021-10-31'),
    principalDue: new Decimal(226.4),
    interestDue: new Decimal(23.6),
  },
  {
    dueDate: new Date('2021-11-30'),
    principalDue: new Decimal(227.34),
    interestDue: new Decimal(22.66),
  },
  {
    dueDate: new Date('2021-12-31'),
    principalDue: new Decimal(228.29),
    interestDue: new Decimal(21.71),
  },
  {
    dueDate: new Date('2022-01-31'),
    principalDue: new Decimal(4982.24),
    interestDue: new Decimal(20.76),
  },
];

export default { loanAccount, result, loanProduct };
