import { Body, Controller, ForbiddenException, HttpCode, HttpStatus, Post, Req } from '@nestjs/common';
import { defaultHandler, RaPayload } from 'ra-data-simple-prisma';
import { PrismaService } from 'nestjs-prisma';
import { GLJournalEntryType, Prisma } from '@prisma/client';
import { Roles } from '../common/types/role';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('admin')
@Controller('admin')
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly prisma: PrismaService) {}

  @Post('/:model')
  @HttpCode(HttpStatus.OK)
  getHandler(
    @Body()
    req: RaPayload,
    @Req() { user }: { user: Prisma.UserGetPayload<{ include: { role: true } }> },
  ) {
    const { model, method, params } = req;

    if (user.role.name !== Roles.admin && !['LoanAccount', 'Client'].includes(model) && !method.includes('get')) {
      throw new ForbiddenException('Forbidden');
    }
    const loanAccountWhereHandler = () => {
      if (model === 'loanAccount') {
        const { organizationId, createdAt, clientIndustry, organizationIndustry } = params?.filter || {};
        let whereClause = { client: {}, createdAt };

        if (organizationId) {
          whereClause = { ...whereClause, client: { organizationId } };
          delete params.filter.organizationId;
        }

        if (clientIndustry) {
          whereClause.client = {
            ...whereClause.client,
            customFields: {
              path: ['industry'],
              equals: clientIndustry,
            },
          };
          delete params.filter.clientIndustry;
        }

        if (organizationIndustry) {
          whereClause.client = {
            ...whereClause.client,
            organization: {
              customFields: { path: ['industry'], equals: organizationIndustry },
            },
          };
          delete params.filter.organizationIndustry;
        }

        if (createdAt) {
          whereClause.createdAt = {
            ...(createdAt.gte && { gte: new Date(createdAt.gte) }),
            ...(createdAt.lte && { lte: new Date(createdAt.lte) }),
          };
          delete params.filter.createdAt;
        }

        return whereClause as Prisma.LoanAccountWhereInput;
      }
      return undefined;
    };
    const clientWhereHandler = () => {
      if (model === 'client') {
        const { canGuarantee } = params?.filter || {};
        delete params?.filter?.canGuarantee;
        return {
          state: {
            not: 'ARCHIVED',
          },
          loanAccountsGuaranted: canGuarantee
            ? {
                none: {
                  accountState: {
                    notIn: ['CLOSED'],
                  },
                },
              }
            : undefined,
        } as Prisma.ClientWhereInput;
      }
      return undefined;
    };
    const glJournalEntriesWhereHandler = () => {
      if (model === 'gLJournalEntry') {
        const { type, bookingDate } = params.filter || {};
        const whereClause: Prisma.GLJournalEntryWhereInput = {};

        if (type) {
          whereClause.type = GLJournalEntryType[type];
          delete params.filter.type;
        }

        if (bookingDate) {
          whereClause.bookingDate = {
            ...(bookingDate.gte && { gte: new Date(bookingDate.gte) }),
            ...(bookingDate.lte && { lte: new Date(bookingDate.lte) }),
          };
          delete params.filter.bookingDate;
        }

        return whereClause;
      }

      return undefined;
    };
    return defaultHandler(req, this.prisma, {
      update: { allowJsonUpdate: { customFields: true } },
      getList: {
        filterMode: 'insensitive',
        where: clientWhereHandler() || loanAccountWhereHandler() || glJournalEntriesWhereHandler(),
      },
      getOne:
        model === 'loanAccount'
          ? {
              include: { paymentPlans: true },
            }
          : undefined,
    });
  }
}
