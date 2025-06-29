import { Installment, Prisma } from '@prisma/client';
import { CreateLoanProductDto } from '../../../loanProducts/dto/LoanProduct.dto';
import { Decimal } from '@prisma/client/runtime/library';
const loanProductInput: CreateLoanProductDto = {
  name: 'product',
  amortizationMethod: 'STANDARD_PAYMENTS',
  maxLoanAmount: 10000,
  maxNumInstallments: 120,
  daysInYear: 'ACTUAL_360',
};
const loanAccountInput: Prisma.LoanAccountCreateInput = {
  interestCalculationMethod: 'DECLINING_BALANCE_DISCOUNTED',
  loanAmount: 1000,
  loanName: 'loan',
  interestRate: 10,
  installmentPeriodUnit: 'MONTHS',
  numInstallments: 6,
  disbursementDetails: {
    create: {
      disbursementAt: new Date('2017-01-21'),
    },
  },
  accountArrearsSettings: {
    create: {},
  },
  prepaymentRecalculationMethod: 'REDUCE_NUMBER_OF_INSTALLMENTS',

  client: {
    connect: {
      email: 'mail@mail.com',
    },
  },
  user: {
    connect: {
      email: 'agent@test.com',
    },
  },
};

const installments: Partial<Installment>[] = [
  {
    principalPaid: new Decimal(0),
    interestPaid: new Decimal(0),
    principalDue: new Decimal(163.23),
    interestDue: new Decimal(8.33),
    dueDate: new Date('2017-02-21'),
    state: 'PENDING',
  },
  {
    principalPaid: new Decimal(0),
    interestPaid: new Decimal(0),
    principalDue: new Decimal(164.59),
    interestDue: new Decimal(6.97),
    dueDate: new Date('2017-03-21'),
    state: 'PENDING',
  },
  {
    principalPaid: new Decimal(0),
    interestPaid: new Decimal(0),
    principalDue: new Decimal(165.96),
    interestDue: new Decimal(5.6),
    dueDate: new Date('2017-04-21'),
    state: 'PENDING',
  },
  {
    principalPaid: new Decimal(0),
    interestPaid: new Decimal(0),
    principalDue: new Decimal(167.34),
    interestDue: new Decimal(4.22),
    dueDate: new Date('2017-05-21'),
    state: 'PENDING',
  },
  {
    principalPaid: new Decimal(0),
    interestPaid: new Decimal(0),
    principalDue: new Decimal(168.74),
    interestDue: new Decimal(2.82),
    dueDate: new Date('2017-06-21'),
    state: 'PENDING',
  },
  {
    principalPaid: new Decimal(0),
    interestPaid: new Decimal(0),
    principalDue: new Decimal(170.14),
    interestDue: new Decimal(1.42),
    dueDate: new Date('2017-07-21'),
    state: 'PENDING',
  },
];

const installmentsAfter: Partial<Installment>[] = [
  {
    dueDate: new Date('2017-02-21'),
    interestDue: new Decimal(8.33),
    interestPaid: new Decimal(8.33),
    principalDue: new Decimal(163.23),
    principalPaid: new Decimal(163.23),
    state: 'PAID',
  },
  {
    dueDate: new Date('2017-03-21'),
    interestDue: new Decimal(6.97),
    interestPaid: new Decimal(6.97),
    principalDue: new Decimal(164.59),
    principalPaid: new Decimal(421.47),
    state: 'PAID',
  },
  {
    dueDate: new Date('2017-04-21'),
    interestDue: new Decimal(3.46),
    interestPaid: new Decimal(0),
    principalDue: new Decimal(168.1),
    principalPaid: new Decimal(0),
    state: 'PENDING',
  },
  {
    dueDate: new Date('2017-05-21'),
    interestDue: new Decimal(2.06),
    interestPaid: new Decimal(0),
    principalDue: new Decimal(169.5),
    principalPaid: new Decimal(0),
    state: 'PENDING',
  },
  {
    dueDate: new Date('2017-06-21'),
    interestDue: new Decimal(0.65),
    interestPaid: new Decimal(0),
    principalDue: new Decimal(77.7),
    principalPaid: new Decimal(0),
    state: 'PENDING',
  },
  {
    dueDate: new Date('2017-07-21'),
    interestDue: new Decimal(0),
    interestPaid: new Decimal(0),
    principalDue: new Decimal(0),
    principalPaid: new Decimal(0),
    state: 'PAID',
  },
];

export { loanAccountInput, installments, installmentsAfter, loanProductInput };
