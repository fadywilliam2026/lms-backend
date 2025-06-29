import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { AccountState } from '@prisma/client';

@Injectable()
export class OrganizationService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createOrganizationDto: CreateOrganizationDto) {
    if (await this.isDuplicateName(createOrganizationDto.name)) {
      throw new ConflictException(`Organization with the same name already exists.`);
    }

    return this.prismaService.organization.create({
      data: {
        ...createOrganizationDto,
      },
    });
  }

  findMany() {
    return this.prismaService.organization.findMany();
  }

  findUnique(id: number) {
    return this.prismaService.organization.findUnique({
      where: {
        id,
      },
    });
  }

  async isDuplicateName(name: string) {
    const organization = await this.prismaService.organization.findUnique({
      where: {
        name,
      },
    });
    return organization ? true : false;
  }

  async validateOrganizationId(id: number) {
    const organization = await this.findUnique(id);

    if (!organization) throw new NotFoundException('Organization not found');

    return organization;
  }

  update(id: number, updateOrganizationDto: UpdateOrganizationDto) {
    return this.prismaService.organization.update({
      where: {
        id,
      },
      data: {
        ...updateOrganizationDto,
      },
    });
  }

  remove(id: number) {
    return this.prismaService.organization.delete({
      where: {
        id,
      },
    });
  }

  async getTotalLoansAmount(organizationId: number) {
    const total = await this.prismaService.loanAccount.aggregate({
      _sum: {
        loanAmount: true,
        principalBalance: true,
      },
      where: {
        accountState: {
          in: [AccountState.ACTIVE, AccountState.ACTIVE_IN_ARREARS],
        },
        client: {
          organizationId,
        },
      },
    });
    return total._sum;
  }

  async getOrganizationsUniqueIndustries() {
    return await this.prismaService.$queryRaw`
    select distinct organizations.custom_fields ->> 'industry' as industry , array_agg(clients.id) as ids
    from organizations
    left join clients on organizations.id = clients.organizatation_id
    group by organizations.custom_fields ->> 'industry'
   `;
  }

  async getOrganizationsUniqueSubIndustries() {
    return await this.prismaService.$queryRaw`
  select distinct organizations.custom_fields ->> 'subIndustry' as industry , array_agg(clients.id) as ids
    from organizations
    left join clients on organizations.id = clients.organizatation_id
    group by organizations.custom_fields ->> 'subIndustry'   `;
  }
}
