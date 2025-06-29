import { Decimal } from '@prisma/client/runtime/library';
import { CreateLoanAccountDto } from '../../../loan-accounts/dto/create-loan-account.dto';
import { CreateLoanProductDto } from '../../../loanProducts/dto/LoanProduct.dto';

const loanProduct: CreateLoanProductDto = {
  name: 'Loan Product',
  amortizationMethod: 'STANDARD_PAYMENTS',
  arrearsSettings: {},
  interestRateSetting: { maxInterestRate: 121 },
  maxLoanAmount: 9999999,
  maxNumInstallments: 12,
  daysInYear: 'ACTUAL_360',
};

const loanAccount: Partial<CreateLoanAccountDto> = {
  loanName: 'Hassan',
  disbursementDetails: {
    disbursementAt: new Date('2023-01-01'),
  },
  interestRate: 2.41,
  interestChargeFrequency: 'EVERY_QUARTER',
  interestCalculationMethod: 'DECLINING_BALANCE_DISCOUNTED',
  loanAmount: 9_000_000,
  numInstallments: 8,
  installmentPeriodUnit: 'QUARTERS',
  startingInterestOnlyPeriodCount: 2,
};
const result = [
  {
    dueDate: new Date('2023-04-01'),
    interestDue: new Decimal(216900),
    principalDue: new Decimal(0),
  },
  {
    dueDate: new Date('2023-07-01'),
    interestDue: new Decimal(216900),
    principalDue: new Decimal(0),
  },
  {
    dueDate: new Date('2023-10-01'),
    interestDue: new Decimal(216900),
    principalDue: new Decimal(1412135.03),
  },
  {
    dueDate: new Date('2024-01-01'),
    interestDue: new Decimal(182867.55),
    principalDue: new Decimal(1446167.48),
  },
  {
    dueDate: new Date('2024-04-01'),
    interestDue: new Decimal(148014.91),
    principalDue: new Decimal(1481020.12),
  },
  {
    dueDate: new Date('2024-07-01'),
    interestDue: new Decimal(112322.32),
    principalDue: new Decimal(1516712.71),
  },
  {
    dueDate: new Date('2024-10-01'),
    interestDue: new Decimal(75769.55),
    principalDue: new Decimal(1553265.48),
  },
  {
    dueDate: new Date('2025-01-01'),
    interestDue: new Decimal(38335.85),
    principalDue: new Decimal(1590699.18),
  },
];
export default { loanAccount, result, loanProduct };
