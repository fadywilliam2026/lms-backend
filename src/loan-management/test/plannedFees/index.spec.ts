/*whaaaaaaaaaaaaaat !!!!!!!!!!!!!!!!! */

// import effectiveInterestRate from './effectiveInterestRateFee';
// import sumOfYearDigits from './sumOfYearDigits';
// import straightLine from './straightLine';
import { LoanCalculationService } from '../../loan-calculation/loan-calculation.service';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../../app.module';
// import { PrismaService } from 'nestjs-prisma';
// import { LoanAccountsService } from '../../../loan-accounts/loan-accounts.service';
// import { LoanProductsService } from '../../../loanProducts/loanProducts.service';
// import merge from 'lodash/merge';
// import map from 'lodash/map';
// import { CreateLoanAccountDto } from '../../../loan-accounts/dto/create-loan-account.dto';
// import { InstallmentService } from '../../installment/installment.service';
// import { InstallmentHelperService } from '../../installment/installment.helper.service';

xdescribe('FeeCalculation', () => {
  let service: LoanCalculationService;
  // let prisma: PrismaService;
  // let loanAccountsService: LoanAccountsService;
  // let loanProductsService: LoanProductsService;
  // let installmentService: InstallmentService;
  // let installmentHelperService: InstallmentHelperService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    service = module.get<LoanCalculationService>(LoanCalculationService);
    // prisma = module.get<PrismaService>(PrismaService);
    // loanAccountsService = module.get<LoanAccountsService>(LoanAccountsService);
    // loanProductsService = module.get<LoanProductsService>(LoanProductsService);
    // installmentService = module.get<InstallmentService>(InstallmentService);
    // installmentHelperService = module.get<InstallmentHelperService>(InstallmentHelperService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  // it('effectiveInterestRate', async () => {
  //   const { loanAccount, result, loanProduct, installments } = effectiveInterestRate;
  //   const client = await prisma.client.findUnique({
  //     where: {
  //       email: 'mail@mail.com',
  //     },
  //     include: {
  //       user: true,
  //     },
  //   });
  //   const createdLoanProduct = await loanProductsService.create(loanProduct);
  //   const createdLoanAccount = await loanAccountsService.create(
  //     client.userId,
  //     merge(new CreateLoanAccountDto(), {
  //       ...loanAccount,
  //       productId: createdLoanProduct.id,
  //       clientId: client.id,
  //     }),
  //   );

  //   await installmentService.createInstallments(createdLoanAccount.id, {
  //     ...createdLoanAccount,
  //     installments: installments.map(installment => installmentHelperService.makeInstallment(installment)),
  //   });
  //   const foundLoanAccount = await prisma.loanAccount.findUnique({
  //     where: { id: createdLoanAccount.id },
  //     include: {
  //       disbursementDetails: true,
  //       product: { include: { predefinedFees: true } },
  //       periodicPayments: true,
  //       installments: true,
  //     },
  //   });
  //   expect(service.calculatePaymentDueFees(foundLoanAccount)).toStrictEqual(result);
  // });
  // it('sumOfYearDigits', async () => {
  //   const { loanAccount, result, loanProduct, installments } = sumOfYearDigits;
  //   const client = await prisma.client.findUnique({
  //     where: {
  //       email: 'mail@mail.com',
  //     },
  //     include: {
  //       user: true,
  //     },
  //   });
  //   const createdLoanProduct = await loanProductsService.create(loanProduct);
  //   const createdLoanAccount = await loanAccountsService.create(
  //     client.userId,
  //     merge(new CreateLoanAccountDto(), {
  //       ...loanAccount,
  //       productId: createdLoanProduct.id,
  //       clientId: client.id,
  //     }),
  //   );
  //   await installmentService.createInstallments(createdLoanAccount.id, {
  //     ...createdLoanAccount,
  //     installments: installments.map(installment => installmentHelperService.makeInstallment(installment)),
  //   });
  //   const foundLoanAccount = await prisma.loanAccount.findUnique({
  //     where: { id: createdLoanAccount.id },
  //     include: {
  //       disbursementDetails: true,
  //       product: { include: { predefinedFees: true } },
  //       periodicPayments: true,
  //       installments: true,
  //     },
  //   });
  //   expect(service.calculatePaymentDueFees(foundLoanAccount)).toStrictEqual(result);
  // });
  // it('straightLine', async () => {
  //   const { loanAccount, result, loanProduct, installments } = straightLine;
  //   const client = await prisma.client.findUnique({
  //     where: {
  //       email: 'mail@mail.com',
  //     },
  //     include: {
  //       user: true,
  //     },
  //   });
  //   const createdLoanProduct = await loanProductsService.create(loanProduct);
  //   const createdLoanAccount = await loanAccountsService.create(
  //     client.userId,
  //     merge(new CreateLoanAccountDto(), {
  //       ...loanAccount,
  //       productId: createdLoanProduct.id,
  //       clientId: client.id,
  //     }),
  //   );
  //   await installmentService.createInstallments(createdLoanAccount.id, {
  //     ...createdLoanAccount,
  //     installments: installments.map(installment => installmentHelperService.makeInstallment(installment)),
  //   });
  //   const foundLoanAccount = await prisma.loanAccount.findUnique({
  //     where: { id: createdLoanAccount.id },
  //     include: {
  //       disbursementDetails: true,
  //       product: { include: { predefinedFees: true } },
  //       periodicPayments: true,
  //       installments: true,
  //     },
  //   });
  //   expect(service.calculatePaymentDueFees(foundLoanAccount)).toStrictEqual(result);
  // });
});
