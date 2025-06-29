import { Test, TestingModule } from '@nestjs/testing';
import { RetainedEarningsJobService } from './retained-earnings-job.service';
import { PrismaService } from 'nestjs-prisma';
import { Decimal } from '@prisma/client/runtime/library';
import { GLAccount } from '@prisma/client';

describe('RetainedEarningsJobService', () => {
  let service: RetainedEarningsJobService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RetainedEarningsJobService,
        {
          provide: PrismaService,
          useValue: {
            gLJournalEntry: {
              aggregate: jest.fn(),
              createMany: jest.fn(),
            },
            gLAccount: {
              findUnique: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<RetainedEarningsJobService>(RetainedEarningsJobService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should update and calculate net profit', async () => {
    const mockRetainedEarnings = {
      id: 1,
      name: 'RETAINED_EARNINGS',
      type: 'EQUITY',
    } as GLAccount;
    const mockNetProfit = { id: 2, name: 'NET_PROFIT', type: 'INCOME_EXPENSE' } as GLAccount;

    (prisma.gLJournalEntry.aggregate as jest.Mock).mockResolvedValueOnce({
      _sum: { amount: new Decimal(1000) },
    });

    (prisma.gLJournalEntry.aggregate as jest.Mock).mockResolvedValueOnce({
      _sum: { amount: new Decimal(400) },
    });

    (prisma.gLAccount.findUnique as jest.Mock).mockResolvedValueOnce({
      id: mockRetainedEarnings.id,
    });
    (prisma.gLAccount.findUnique as jest.Mock).mockResolvedValueOnce({ id: mockNetProfit.id });

    (prisma.gLJournalEntry.createMany as jest.Mock).mockResolvedValueOnce({});

    await service.updateNetProfit();

    const netProfit = new Decimal(1000).sub(new Decimal(400));

    expect(prisma.gLJournalEntry.aggregate).toHaveBeenCalledTimes(2);
    expect(prisma.gLJournalEntry.aggregate).toHaveBeenCalledWith({
      where: {
        glAccount: {
          type: 'INCOME',
        },
      },
      _sum: { amount: true },
    });
    expect(prisma.gLJournalEntry.aggregate).toHaveBeenCalledWith({
      where: {
        glAccount: {
          type: 'EXPENSE',
        },
      },
      _sum: { amount: true },
    });
    expect(prisma.gLAccount.findUnique).toHaveBeenCalledTimes(2);
    expect(prisma.gLAccount.findUnique).toHaveBeenCalledWith({
      where: { name: 'RETAINED_EARNINGS', type: 'EQUITY' },
    });
    expect(prisma.gLAccount.findUnique).toHaveBeenCalledWith({
      where: { name: 'NET_PROFIT', type: 'INCOME_EXPENSE' },
    });
    expect(prisma.gLJournalEntry.createMany).toHaveBeenCalledWith({
      data: [
        {
          amount: netProfit,
          bookingDate: expect.any(Date),
          type: 'DEBIT',
          glAccountId: mockRetainedEarnings.id,
        },
        {
          amount: netProfit,
          bookingDate: expect.any(Date),
          type: 'CREDIT',
          glAccountId: mockRetainedEarnings.id,
        },
      ],
    });
  });
});
