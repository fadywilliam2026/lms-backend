import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { AnyFilesInterceptor, FileInterceptor } from '@webundsoehne/nest-fastify-file-upload';
import { Permission } from '../auth/jwt-auth.guard';
import { Action } from '../common/types/action';
import { ClientsService } from './clients.service';
import { CreateClientsDto } from './dto/create-clients.dto';
import { UpdateClientsDto } from './dto/update-clients.dto';
import { MulterFile } from '@webundsoehne/nest-fastify-file-upload/dist/interfaces/multer-options.interface';
import { CreateClientFromPartnerDto } from './dto/create-client-form-partner.dto';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreditEngineService } from '../credit-engine/credit-engine.service';
import { ValidateAnswersDto } from './dto/validate-answers.dto';
import { clientResponse } from './response.body';

@ApiTags('clients')
@ApiBearerAuth()
@Controller('clients')
export class ClientsController {
  constructor(
    private readonly clientService: ClientsService,
    private readonly creditEngineService: CreditEngineService,
  ) {}

  @Permission([Action.Create, 'Client'])
  @Post()
  @UseInterceptors(AnyFilesInterceptor())
  async create(@Req() { user }, @Body() createClientDto: CreateClientsDto, @UploadedFiles() files: MulterFile[]) {
    return this.clientService.create(user, createClientDto, files);
  }

  @Permission([Action.Read, 'Client'])
  @Get()

  // getClientByUserId
  findManyByUserId(@Req() { user: { id } }) {
    return this.clientService.findManyByUserId(id);
  }

  @Permission([Action.Read, 'Client'])
  @Get(':id')
  findUnique(@Param('id') id: string) {
    return this.clientService.findUnique(+id);
  }

  @Permission([Action.Update, 'Client'])
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateClientDto: UpdateClientsDto) {
    return this.clientService.update(+id, updateClientDto);
  }

  @Post(':id/bank-statement')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    required: true,
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async uploadBankStatement(
    @Req() { user: { id } },
    @UploadedFile() bank_statement: MulterFile,
    @Param('id') clientId: string,
  ) {
    return this.creditEngineService.uploadClientBankStatements(id, bank_statement, +clientId);
  }

  @Get(':id/totalLoansAmount')
  getTotalLoanAmount(@Param('id') id: string) {
    return this.clientService.getTotalLoansAmount(+id);
  }

  @Get('industry')
  getClientsIndustries() {
    return this.clientService.getClientsIndustries();
  }

  @Get('sub-industry')
  getClientsSubIndustries() {
    return this.clientService.getClientsSubIndustries();
  }

  // @Post('/:id/contract')
  // createContract(@Param('id', ParseIntPipe) id: number, @Body('userKyc') userKyc: UserKyc) {
  //   return this.clientService.createContract(id, userKyc);
  // }

  @Get('/:id/contract-status')
  getContract(@Param('id', ParseIntPipe) id: number) {
    return this.clientService.getContract(id);
  }

  @Permission([Action.Create, 'Client'])
  @Post('/createClientFromPartner')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse(clientResponse.success.clientFromPartner)
  @ApiInternalServerErrorResponse(clientResponse.error.clientFromPartner[500])
  async createClientFromPartner(@Req() { user }, @Body() createClientDto: CreateClientFromPartnerDto) {
    return await this.clientService.createClientFromPartner(user, createClientDto);
  }

  @Post('/validate-answers')
  async validateQuestions(@Body() updateClientFromPartnerDto: ValidateAnswersDto) {
    return await this.clientService.validateAnswers(updateClientFromPartnerDto);
  }

  @Get(':id/credit-limit')
  async getCreditLimit(@Req() { user }, @Param('id') id: string) {
    return await this.clientService.getCreditLimit(user.id, +id);
  }

  @Get(':id/risk-score')
  async getRiskScore(@Req() { user }, @Param('id') id: string) {
    return await this.clientService.getRiskScore(user.id, +id);
  }

  @Permission([Action.Read, 'Client'])
  @Get('nationalId/:nationalId')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse(clientResponse.success.nationalId)
  @ApiBadRequestResponse(clientResponse.error.nationalId[400])
  @ApiNotFoundResponse(clientResponse.error.nationalId[404])
  async getByNationalId(@Param('nationalId') nationalId: string) {
    return await this.clientService.getByNationalId(nationalId);
  }
}
