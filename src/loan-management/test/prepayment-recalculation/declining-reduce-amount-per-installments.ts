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
  interestCalculationMethod: 'DECLINING_BALANCE',
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
  prepaymentRecalculationMethod: 'REDUCE_AMOUNT_PER_INSTALLMENT',

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
    principalDue: new Decimal(166.67),
    interestDue: new Decimal(8.33),
    dueDate: new Date('2017-02-21'),
    state: 'PENDING',
  },
  {
    principalPaid: new Decimal(0),
    interestPaid: new Decimal(0),
    principalDue: new Decimal(166.67),
    interestDue: new Decimal(6.94),
    dueDate: new Date('2017-03-21'),
    state: 'PENDING',
  },
  {
    principalPaid: new Decimal(0),
    interestPaid: new Decimal(0),
    principalDue: new Decimal(166.67),
    interestDue: new Decimal(5.56),
    dueDate: new Date('2017-04-21'),
    state: 'PENDING',
  },
  {
    principalPaid: new Decimal(0),
    interestPaid: new Decimal(0),
    principalDue: new Decimal(166.67),
    interestDue: new Decimal(4.17),
    dueDate: new Date('2017-05-21'),
    state: 'PENDING',
  },
  {
    principalPaid: new Decimal(0),
    interestPaid: new Decimal(0),
    principalDue: new Decimal(166.66),
    interestDue: new Decimal(2.78),
    dueDate: new Date('2017-06-21'),
    state: 'PENDING',
  },
  {
    principalPaid: new Decimal(0),
    interestPaid: new Decimal(0),
    principalDue: new Decimal(166.66),
    interestDue: new Decimal(1.39),
    dueDate: new Date('2017-07-21'),
    state: 'PENDING',
  },
];
const installmentsAfter: Partial<Installment>[] = [
  {
    dueDate: new Date('2017-02-21'),
    interestDue: new Decimal(8.33),
    interestPaid: new Decimal(8.33),
    principalDue: new Decimal(166.67),
    principalPaid: new Decimal(166.67),
    state: 'PAID',
  },
  {
    dueDate: new Date('2017-03-21'),
    interestDue: new Decimal(6.94),
    interestPaid: new Decimal(6.94),
    principalDue: new Decimal(166.67),
    principalPaid: new Decimal(166.67),
    state: 'PAID',
  },
  {
    dueDate: new Date('2017-04-21'),
    interestDue: new Decimal(3.46),
    interestPaid: new Decimal(0),
    principalDue: new Decimal(166.67),
    principalPaid: new Decimal(251.39),
    state: 'PARTIALLY_PAID',
  },
  {
    dueDate: new Date('2017-05-21'),
    interestDue: new Decimal(3.46),
    interestPaid: new Decimal(0),
    principalDue: new Decimal(138.43),
    principalPaid: new Decimal(0),
    state: 'PENDING',
  },

  {
    dueDate: new Date('2017-06-21'),
    interestDue: new Decimal(2.31),
    interestPaid: new Decimal(0),
    principalDue: new Decimal(138.42),
    principalPaid: new Decimal(0),
    state: 'PENDING',
  },
  {
    dueDate: new Date('2017-07-21'),
    interestDue: new Decimal(1.15),
    interestPaid: new Decimal(0),
    principalDue: new Decimal(138.42),
    principalPaid: new Decimal(0),
    state: 'PENDING',
  },
];
export { loanAccountInput, installments, installmentsAfter, loanProductInput };
