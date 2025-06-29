import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { AccountState, InstallmentState, Prisma, User } from '@prisma/client';
import { MulterFile } from '@webundsoehne/nest-fastify-file-upload/dist/interfaces/multer-options.interface';
import { PrismaService } from 'nestjs-prisma';
import { CreateClientsDto } from './dto/create-clients.dto';
import { UpdateClientsDto } from './dto/update-clients.dto';
import { DocumentService } from '../document/document.service';
import { GateIdService } from '../gate-id/gate-id.service';
import { CreateClientForCreditEngineDto, CreateClientFromPartnerDto } from './dto/create-client-form-partner.dto';
import { CreditEngineService } from '../credit-engine/credit-engine.service';
import moment from 'moment';
import { DuePaymentHistory } from './types';
import { ValidateAnswersDto } from './dto/validate-answers.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ClientsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly documentService: DocumentService,
    private readonly gateIdService: GateIdService,
    private readonly creditEngineService: CreditEngineService,
    private readonly configService: ConfigService,
  ) {}

  async create(user: User, createClientDto: CreateClientsDto, files?: MulterFile[]) {
    const approvedLimit = createClientDto.approvedLimit || createClientDto.initialLimit;
    const attachments = createClientDto.attachments;
    delete createClientDto.attachments;
    const newClient = await this.prismaService.client
      .create({
        data: {
          userId: user.id,
          organizationId: user.organizationId,
          ...createClientDto,
          currentLimit: approvedLimit,
          approvedLimit: approvedLimit,
        },
      })
      .catch(e => {
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
          throw new ConflictException(`Client with the same email or phone already exists.`);
        } else {
          throw new Error(e);
        }
      });
    if (files?.length) {
      const allFilesInfo: Array<{ title: string; type: string }> = [];
      attachments.forEach(attachment => {
        attachment.files.forEach(file => {
          allFilesInfo.push({
            ...file,
            type: attachment.type,
          });
        });
      });
      await Promise.all(
        files.map(file => {
          return this.documentService.create(
            'CLIENT',
            newClient.id,
            {
              type: allFilesInfo.find(f => f.title === file.originalname).type,
            },
            file,
          );
        }),
      );
    }
    return newClient;
  }

  async findManyByUserId(userId: number) {
    return await this.prismaService.client.findMany({ where: { userId } });
  }

  async findUnique(id: number) {
    return await this.prismaService.client.findUnique({ where: { id } });
  }

  async validateClientId(id: number) {
    const client = await this.findUnique(id);
    if (!client) {
      throw new NotFoundException('Client not found');
    }
    return client;
  }

  async validateClientIdAndLimit(id: number, loanAmount: number) {
    const client = await this.validateClientId(id);
    if (client.currentLimit < loanAmount) {
      throw new BadRequestException('Client does not have enough credit');
    }
    return client;
  }

  async update(id: number, updateClientDto: UpdateClientsDto) {
    await this.validateClientId(id);
    const client = await this.prismaService.client.findUnique({ where: { id } });
    if (client.approvedLimit != updateClientDto.approvedLimit) {
      updateClientDto.currentLimit = client.currentLimit + (updateClientDto.approvedLimit - client.approvedLimit);
    }

    const { documents } = updateClientDto;
    await this.documentService.updateDocumentsIfNeeded(documents);
    await this.documentService.deleteDocumentsIfNeeded('CLIENT', id, documents);
    delete updateClientDto.documents;

    return await this.prismaService.client.update({
      where: { id },
      data: {
        ...updateClientDto,
      },
    });
  }

  async getTotalLoansAmount(clientId: number) {
    const total = await this.prismaService.loanAccount.aggregate({
      _sum: {
        loanAmount: true,
        principalBalance: true,
      },
      where: {
        accountState: {
          in: [AccountState.ACTIVE, AccountState.ACTIVE_IN_ARREARS],
        },
        clientId,
      },
    });
    return total._sum;
  }

  async getClientsIndustries() {
    return await this.prismaService.$queryRaw`
    select distinct custom_fields ->> 'industry' as industry , array_agg(id) as ids from clients group by custom_fields ->> 'industry'
   `;
  }

  async getClientsSubIndustries() {
    return await this.prismaService.$queryRaw`
    select distinct custom_fields ->> 'subIndustry' as industry , array_agg(id) as ids from clients group by custom_fields ->> 'subIndustry'
   `;
  }

  async createContract(id: number, answers: ValidateAnswersDto) {
    const client = await this.prismaService.client.findUnique({ where: { id } });
    return this.gateIdService.createClientContract(client, answers).then(async res => {
      if (res && 'data' in res) {
        await this.prismaService.client.update({
          where: { id: client.id },
          data: {
            contractId: res.data.id,
          },
        });
      }
    });
  }

  async getContract(clientId: number) {
    const client = await this.prismaService.client.findUnique({
      where: { id: clientId },
    });
    if (!client.contractId) {
      return 'NO_CONTRACT';
    }
    return this.gateIdService.getContract(client.contractId).then(res => res.data.overall_status);
  }

  async createClientFromPartner(user: User, createClientFromPartnerDto: CreateClientFromPartnerDto) {
    const client = await this.findOrCreateClient(user, createClientFromPartnerDto);
    const { organizationId, carrierOfPaymentRisk, controlOfCashFlow, methodOfLoanRepayment } = user;

    const createClientForCreditEngine: CreateClientForCreditEngineDto = {
      ...createClientFromPartnerDto,
      clientId: client.id,
      organizationId,
      carrierOfPaymentRisk,
      controlOfCashFlow,
      methodOfLoanRepayment,
    };
    const data = await this.creditEngineService.postClientCreditData(user.id, createClientForCreditEngine);

    await this.prismaService.client.update({
      where: {
        id: client.id,
      },
      data: {
        initialLimit: data.limit,
      },
    });
    return { redirectLink: 'https://gateid.flend.io/' };
  }

  async validateAnswers(answers: ValidateAnswersDto) {
    const client = await this.prismaService.client.findFirstOrThrow({ where: { nationalId: answers.nationalId } });

    const answersToBeValidated = ['customFields', 'nationalId', 'commercialName', 'taxRecordId'];
    const differentFields = [];

    for (const key of answersToBeValidated) {
      const value = answers[key];
      if (key == 'customFields') {
        for (const k in value) {
          if (k === 'commercialRecord' && value[k] !== client.customFields[k]) {
            differentFields.push(k);
          }
        }
      } else if (value !== client[key]) {
        differentFields.push(key);
      }
    }

    if (differentFields.length > 0) return { status: 'error', differentFields };

    const updateCreditData = await this.creditEngineService.updateClientCreditData(client.userId, {
      ...answers,
      clientId: client.id,
    });

    const updatedClient = await this.prismaService.client.update({
      where: { id: client.id },
      data: {
        firstContractFormAnswers: JSON.stringify(answers),
        currentLimit: updateCreditData.limit,
        approvedLimit: updateCreditData.limit,
      },
    });

    await this.createContract(updatedClient.id, answers);

    return { status: 'success', differentFields, updatedClient };
  }

  private async findOrCreateClient(user: User, data: CreateClientFromPartnerDto) {
    const commonFields = {
      firstName: data.firstName,
      lastName: data.lastName || '',
      commercialName: data.commercialName,
      taxRecordId: data.taxRecordId,
      yearsOfOperations: data.yearsOfOperations,
      partnerHistoricalLoansCount: data.partnerHistoricalLoansCount,
      email: data.email,
      address: data.address,
      city: data.city,
      phone: data.phone,
      governorate: data.governorate,
      paymentFrequency: data.paymentFrequency,
      customFields: data.customFields || {},
    };
    return await this.prismaService.client.upsert({
      where: {
        nationalId: data.nationalId,
      },
      include: {
        user: true,
      },
      create: {
        ...commonFields,
        nationalId: data.nationalId,
        user: {
          connect: {
            id: user.id,
          },
        },
        organization: {
          connect: {
            id: user.organizationId,
          },
        },
      },
      update: {
        ...commonFields,
        organization: { connect: { id: user.organizationId } },
        duePaymentHistory: await this.historicalDuePayments(+this.prismaService.client.fields.id),
        historicalLoansCount: await this.prismaService.loanAccount.count({
          where: {
            clientId: +this.prismaService.client.fields.id,
          },
        }),
        pastDuesCount: await this.clientRepaymentBehavior(+this.prismaService.client.fields.id),
      },
    });
  }

  async getCreditLimit(userId: number, clientId: number) {
    await this.validateClientId(clientId);
    return await this.creditEngineService.getCreditLimit(userId, clientId);
  }

  async getRiskScore(userId: number, clientId: number) {
    await this.validateClientId(clientId);
    return await this.creditEngineService.getRiskScore(userId, clientId);
  }

  private async historicalDuePayments(clientId: number) {
    const loanAccounts = await this.prismaService.loanAccount.findMany({
      where: {
        clientId,
      },
      select: {
        installments: true,
      },
      take: 4,
      orderBy: {
        createdAt: 'desc',
      },
    });
    const installments = loanAccounts.flatMap(({ installments }) => installments);

    const latePaidInstallments = installments.filter(
      ({ lastPaidDate, dueDate, state }) => moment(lastPaidDate).isAfter(moment(dueDate)) && state === 'PAID',
    );

    const late_from_8_to_30 = latePaidInstallments.some(
      ({ lastPaidDate, dueDate }) =>
        moment(lastPaidDate).diff(dueDate, 'd') >= 8 || moment(lastPaidDate).diff(dueDate, 'd') <= 30,
    );

    if (late_from_8_to_30) return DuePaymentHistory.LATE_FROM_8_TO_30;

    const late_from_31_to_60 = latePaidInstallments.some(
      ({ lastPaidDate, dueDate }) =>
        moment(lastPaidDate).diff(dueDate, 'd') >= 31 || moment(lastPaidDate).diff(dueDate, 'd') <= 60,
    );
    if (late_from_31_to_60) return DuePaymentHistory.LATE_FROM_31_TO_60;

    const over_60 = latePaidInstallments.some(
      ({ lastPaidDate, dueDate }) => moment(lastPaidDate).diff(dueDate, 'd') > 60,
    );

    if (over_60) return DuePaymentHistory.OVER_60;

    const unsettled = installments.some(({ state }) => state === 'LATE');

    if (unsettled) return DuePaymentHistory.UNSETTLED;

    return DuePaymentHistory.NO;
  }

  private async clientRepaymentBehavior(clientId: number) {
    const latePaidInstallments = await this.prismaService.installment.aggregate({
      where: {
        loanAccount: {
          clientId,
        },
        OR: [
          {
            state: InstallmentState.LATE,
          },
          {
            state: InstallmentState.PAID,
            lastPaidDate: {
              gt: this.prismaService.installment.fields.dueDate,
            },
          },
        ],
      },
      _count: true,
    });

    return latePaidInstallments._count;
  }

  async getByNationalId(nationalId: string) {
    try {
      return await this.prismaService.client.findFirstOrThrow({
        where: { nationalId },
        include: {
          organization: true,
          user: true,
          loanAccounts: {
            include: {
              installments: true,
              disbursementDetails: true,
              loanTransactions: true,
            },
          },
        },
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025')
        throw new BadRequestException('No Client Found');
    }
  }
}
