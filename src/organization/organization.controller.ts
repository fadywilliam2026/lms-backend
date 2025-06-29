import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { Permission } from '../auth/jwt-auth.guard';
import { Action } from '../common/types/action';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { OrganizationService } from './organization.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('organizations')
@ApiBearerAuth()
@Controller('organizations')
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Permission([Action.Create, 'Organization'])
  @Post()
  create(@Body() createOrganizationDto: CreateOrganizationDto) {
    return this.organizationService.create(createOrganizationDto);
  }

  @Permission([Action.Read, 'Organization'])
  @Get()
  findMany() {
    return this.organizationService.findMany();
  }

  @Permission([Action.Read, 'Organization'])
  @Get(':id')
  findUnique(@Param('id') id: string) {
    return this.organizationService.findUnique(+id);
  }

  @Permission([Action.Update, 'Organization'])
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOrganizationDto: UpdateOrganizationDto) {
    return this.organizationService.update(+id, updateOrganizationDto);
  }

  @Permission([Action.Delete, 'Organization'])
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.organizationService.remove(+id);
  }

  @Get('industry')
  getClientsIndustries() {
    return this.organizationService.getOrganizationsUniqueIndustries();
  }

  @Get('sub-industry')
  getClientsSubIndustries() {
    return this.organizationService.getOrganizationsUniqueSubIndustries();
  }

  @Get(':id/totalLoansAmount')
  getTotalLoanAmount(@Param('id') id: string) {
    return this.organizationService.getTotalLoansAmount(+id);
  }
}
