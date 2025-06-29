import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { AccountState, AccountSubState, Prisma } from '@prisma/client';
import omit from 'lodash/omit';
import { ClientsService } from '../clients/clients.service';
import { LoanManagementService } from '../loan-management/loan-management.service';
import { LoanProductsService } from '../loanProducts/loanProducts.service';
import { PrismaService } from 'nestjs-prisma';
import { CreateLoanAccountDto } from './dto/create-loan-account.dto';
import { UpdateLoanAccountDto } from './dto/update-loan-account.dto';
import { setCreateLoanAccountDtoDefaults, validateLoanAccountDto } from './loan-accounts.helper';
import { AccountStateActions } from './types/account-state-actions';
import { CaslAbilityFactory } from '../casl/casl-ability.factory';
import { accessibleBy } from '@casl/prisma';
import { Decimal } from '@prisma/client/runtime/library';
import { RescheduleWriteOffAmount } from './dto/reschedule-write-off-amounts.dto';
import { LoanAccountLifeCycleService } from './life-cycle.service';
import { LoanTransactionService } from '../loan-transaction/loan-transaction.service';
import { GateIdService } from '../gate-id/gate-id.service';
import { CreateSimpleLoanDto } from './dto/create-simple-loan.dto';
import { LoanCalculationService } from '../loan-management/loan-calculation/loan-calculation.service';

@Injectable()
export class LoanAccountsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly clientService: ClientsService,
    private readonly loanProductService: LoanProductsService,
    private readonly loanManagementService: LoanManagementService,
    private readonly caslAbilityFactory: CaslAbilityFactory,
    private readonly lifecycleService: LoanAccountLifeCycleService,
    private readonly loanTransactionService: LoanTransactionService,
    private readonly gateIdService: GateIdService,
    private readonly loanCalculationService: LoanCalculationService,
  ) {}

  async create(userId: number, createLoanAccountDto: CreateLoanAccountDto) {
    await this.clientService.validateClientIdAndLimit(createLoanAccountDto.clientId, createLoanAccountDto.loanAmount);

    const loanProduct = await this.loanProductService.validateLoanProductId(createLoanAccountDto.productId);
    await setCreateLoanAccountDtoDefaults(createLoanAccountDto, this.loanProductService, loanProduct);
    validateLoanAccountDto(createLoanAccountDto, loanProduct);

    const loanAccountDto = omit(createLoanAccountDto, ['clientId', 'productId', 'userId', 'guarantorId']);

    return await this.prismaService.loanAccount.create({
      data: {
        ...loanAccountDto,
        user: { connect: { id: userId } },
        client: { connect: { id: createLoanAccountDto.clientId } },
        guarantor: createLoanAccountDto.guarantorId ? { connect: { id: createLoanAccountDto.guarantorId } } : undefined,
        product: { connect: { id: createLoanAccountDto.productId } },
        disbursementDetails: {
          create: createLoanAccountDto.disbursementDetails,
        },
        periodicPayments: {
          createMany: { data: createLoanAccountDto.periodicPayments || [] },
        },
        paymentPlans: {
          createMany: { data: createLoanAccountDto.paymentPlans || [] },
        },
      },
      include: {
        client: true,
        disbursementDetails: true,
        product: { include: { predefinedFees: true } },
        paymentPlans: true,
        installments: true,
      },
    });
  }

  async findMany(user: any) {
    const ability = this.caslAbilityFactory.createForUser(user);
    return await this.prismaService.loanAccount.findMany({ where: accessibleBy(ability).LoanAccount });
  }

  async findUnique(id: number) {
    return await this.prismaService.loanAccount.findUnique({ where: { id } });
  }

  async validateLoanAccountId(id: number) {
    const loanAccount = await this.findUnique(id);
    if (!loanAccount) {
      throw new NotFoundException('Loan account not found');
    }
    return loanAccount;
  }

  async update(id: number, { clientId, guarantorId, ...updateLoanAccountDto }: UpdateLoanAccountDto) {
    await this.clientService.validateClientIdAndLimit(clientId, updateLoanAccountDto.loanAmount);
    const loanAccount = await this.validateLoanAccountId(id);

    const loanProduct = await this.loanProductService.validateLoanProductId(loanAccount.productId);
    validateLoanAccountDto(updateLoanAccountDto, loanProduct);
    return await this.prismaService.loanAccount.update({
      data: {
        ...updateLoanAccountDto,
        client: {
          connect: {
            id: clientId,
          },
        },
        guarantor: guarantorId ? { connect: { id: guarantorId } } : undefined,
        disbursementDetails: {
          update: updateLoanAccountDto.disbursementDetails,
        },
        periodicPayments: {
          updateMany: updateLoanAccountDto?.periodicPayments?.map(e => ({
            where: { id: e.id },
            data: e,
          })),
        },
        paymentPlans: {
          deleteMany: {},
          createMany: { data: updateLoanAccountDto.paymentPlans || [] },
        },
      },
      where: {
        id: id,
      },
    });
  }

  // TODO: Create an endpoint for each action?

  async changeState(id: number, action: AccountStateActions, args: any = {}) {
    const loanAccount = await this.validateLoanAccountId(id);

    const currentState = this.lifecycleService.stateMachine[loanAccount.accountState];
    if (!currentState) {
      throw new ConflictException(`Loan account state ${loanAccount.accountState} is not supported`);
    }

    if (action in currentState) {
      return await this.lifecycleService.stateMachine[loanAccount.accountState][action](loanAccount, args);
    } else {
      throw new BadRequestException(`Action ${action} not available for this state`);
    }
  }

  async reschedule(userId: number, id: number, rescheduleWriteOffAmounts: RescheduleWriteOffAmount) {
    // reset balances of old account

    const loanAccount = await this.prismaService.loanAccount.findUniqueOrThrow({
      where: { id },
      include: {
        disbursementDetails: true,
        product: { include: { predefinedFees: true } },
        periodicPayments: true,
        installments: {
          orderBy: { dueDate: 'desc' },
          where: { state: 'PAID' },
        },
      },
    });
    const interestAmount = this.loanManagementService.getInterestAmountOfElapsedDays(loanAccount, new Date());
    const { principalBalance, feesBalance, penaltyBalance } = loanAccount;
    const totalLoanAmount = +principalBalance
      .add(interestAmount)
      .add(feesBalance)
      .add(penaltyBalance)
      .sub(Decimal.sum(...Object.values(rescheduleWriteOffAmounts)))
      .toFixed(2);

    await this.loanTransactionService.create({
      data: {
        loanAccountId: loanAccount.id,
        amount: totalLoanAmount,
        type: 'PAYMENT_RESCHEDULE',
        entryDate: new Date(),
        userId,
        principalAmount: rescheduleWriteOffAmounts.principal,
        interestAmount: +interestAmount.sub(rescheduleWriteOffAmounts.interest).toFixed(2),
        penaltyAmount: +penaltyBalance.sub(rescheduleWriteOffAmounts.penalty).toFixed(2),
        feesAmount: +feesBalance.sub(rescheduleWriteOffAmounts.fee).toFixed(2),
      },
    });
    const newLoanAccount = await this.prismaService.loanAccount.create({
      data: {
        ...omit(loanAccount, [
          'id',
          'createdAt',
          'updatedAt',
          'disbursementDetails',
          'product',
          'periodicPayments',
          'installments',
        ]),
        loanAmount: totalLoanAmount,
        loanName: `RESCHEDULED ${loanAccount.loanName}`,
      },
    });
    await this.prismaService.loanAccount.update({
      where: {
        id: loanAccount.id,
      },
      data: {
        accountState: AccountState.CLOSED,
        accountSubState: AccountSubState.RESCHEDULED,
        closedAt: new Date(),
        principalBalance: 0,
        interestBalance: 0,
        penaltyBalance: 0,
        feesBalance: 0,
        installments: {
          updateMany: {
            data: {
              state: 'PAID',
            },
            where: {
              loanAccountId: loanAccount.id,
            },
          },
        },
      },
    });
    await this.loanManagementService.generateInstallments(newLoanAccount.id);
    return newLoanAccount;
  }

  async createContract(loanAccount: Prisma.LoanAccountGetPayload<{ include: { client: true; installments: true } }>) {
    return await this.gateIdService.createLoanContract(loanAccount).then(async res => {
      if (res && 'data' in res) {
        return await this.prismaService.loanAccount.update({
          where: { id: loanAccount.id },
          data: {
            contractId: res.data.id,
          },
        });
      }
    });
  }
  async getContract(loanAccountId: number) {
    const loanAccount = await this.prismaService.loanAccount.findUnique({
      where: { id: loanAccountId },
    });
    if (!loanAccount.contractId) {
      return 'NO_CONTRACT';
    }
    return this.gateIdService.getContract(loanAccount.contractId).then(res => res.data.overall_status);
  }

  async createSimpleLoan(userId: number, createLoanAccountDto: CreateSimpleLoanDto) {
    const [client, product] = await this.prismaService.$transaction([
      this.prismaService.client.findFirstOrThrow({
        where: { nationalId: createLoanAccountDto.nationalId },
      }),
      this.prismaService.loanProduct.findFirstOrThrow({ include: { interestRateSetting: true } }),
    ]);
    const loanAccount = await this.create(userId, {
      clientId: client.id,
      interestCalculationMethod: product.interestCalculationMethod,
      productId: product.id,
      interestRate: product.interestRateSetting.defaultInterestRate,
      loanAmount: createLoanAccountDto.loanAmount,
      loanName: `${client.firstName} ${client.lastName} - ${product.name}`,
      numInstallments: product.defaultNumInstallments,
      penaltyRate: product.defaultPenaltyRate,
    });

    loanAccount.installments = this.loanCalculationService.generateInstallments({
      ...loanAccount,
      disbursementDetails: {
        ...loanAccount.disbursementDetails,
        disbursementAt: new Date(),
      },
    } as any).installments;

    return await this.createContract(loanAccount);
  }
}
