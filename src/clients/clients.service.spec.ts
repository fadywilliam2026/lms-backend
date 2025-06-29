import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../app.module';
import { ClientsService } from './clients.service';
import { CreditEngineService } from '../credit-engine/credit-engine.service';
import { CreateClientFromPartnerDto } from './dto/create-client-form-partner.dto';
import { PrismaService } from 'nestjs-prisma';
import { omit } from 'lodash';
import { ValidateAnswersDto } from './dto/validate-answers.dto';
// import { ConfigService } from '@nestjs/config';

describe('ClientService', () => {
  let service: ClientsService;
  let creditEngineService: CreditEngineService;
  let prisma: PrismaService;
  // let config: ConfigService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    service = module.get<ClientsService>(ClientsService);
    creditEngineService = module.get<CreditEngineService>(CreditEngineService);
    prisma = module.get<PrismaService>(PrismaService);
    // config = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('create new client from partner', async () => {
    const user = await prisma.user.findFirstOrThrow({
      where: { id: 1 },
    });

    const clientData: CreateClientFromPartnerDto = {
      firstName: 'test1',
      lastName: 'test',
      nationalId: '12345678987654',
      commercialName: 'test1 test',
      taxRecordId: '12345678',
      yearsOfOperations: 2,
      partnerHistoricalLoansCount: 1,
      userId: 1,
      email: 'createClientFromPartner@test.com',
      city: 'test',
      customFields: {
        commercialRecord: 'test',
        establishmentDate: 'test',
        industry: 'test',
      },
      phone: '011111111111',
      governorate: 'test',
      paymentFrequency: 'EVERY_15_DAYS',
      transactions: [
        {
          timestamp: 1704097631,
          amount: 95404,
        },
        {
          timestamp: 1706776031,
          amount: 133861,
        },
        {
          timestamp: 1709281631,
          amount: 190590,
        },
        {
          timestamp: 1711960031,
          amount: 240188,
        },
        {
          timestamp: 1714552031,
          amount: 280333,
        },
        {
          timestamp: 1717230431,
          amount: 339161,
        },
      ],
    };

    jest.spyOn(creditEngineService, 'postClientCreditData').mockResolvedValue({
      status: 'success',
      userId: user.id,
    });

    const result = await service.createClientFromPartner(user, clientData);

    const client = await prisma.client.findFirstOrThrow({
      where: { nationalId: clientData.nationalId },
    });

    expect(client).toMatchObject(omit(clientData, ['transactions']));

    expect(result).toBeDefined();
    expect(result.redirectLink).toEqual('https://gateid.flend.io/');
  });

  it('update existing client from partner', async () => {
    const user = await prisma.user.findFirstOrThrow({
      where: { id: 1 },
    });

    const clientData = {
      firstName: 'John',
      lastName: 'Doe',
      nationalId: '123456789',
      commercialName: 'New Commercial Name',
      taxRecordId: '123456789',
      yearsOfOperations: 2,
      partnerHistoricalLoansCount: 1,
      organizationId: 1,
    };

    jest.spyOn(creditEngineService, 'postClientCreditData').mockResolvedValue({
      status: 'success',
      userId: user.id,
    });

    const result = await service.createClientFromPartner(user, clientData as CreateClientFromPartnerDto);

    const updatedClient = await prisma.client.findFirstOrThrow({
      where: { nationalId: clientData.nationalId },
    });

    expect(result).toBeDefined();
    expect(updatedClient.commercialName).toEqual('New Commercial Name');
    expect(result.redirectLink).toEqual('https://gateid.flend.io/');
  });

  it('Validate client and calculate limit', async () => {
    const LIMIT = 100_000;

    const user = await prisma.user.findFirstOrThrow({
      where: { id: 1 },
    });

    const clientData: ValidateAnswersDto = {
      firstName: 'John',
      lastName: 'Doe',
      nationalId: '123456789',
      commercialName: 'New Commercial Name',
      taxRecordId: '123456789',
      address: 'test',
      city: 'test',
      customFields: null,
      email: 'createClientFromPartner@test.com',
      governorate: 'test',
      phone: '011111111111',
      extraFields: null,
    };

    jest.spyOn(creditEngineService, 'updateClientCreditData').mockResolvedValue({
      status: 'success',
      limit: LIMIT,
      userId: user.id,
    });

    jest.spyOn(service, 'createContract').mockResolvedValue();

    const result = await service.validateAnswers(clientData);
    expect(result.updatedClient.approvedLimit).toEqual(LIMIT);
    expect(result.updatedClient.currentLimit).toEqual(LIMIT);
  });
});
