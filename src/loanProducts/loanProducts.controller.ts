import { Body, Controller, Get, Param, ParseArrayPipe, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { Permission } from '../auth/jwt-auth.guard';
import { Action } from '../common/types/action';
import { UpdateAccountingRuleDto } from '../gl/dto/update-accounting-rule.dto';
import { CreateLoanProductDto, UpdateLoanProductDto } from './dto/LoanProduct.dto';
import { LoanProductsService } from './loanProducts.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('loan products')
@ApiBearerAuth()
@Controller('loanproducts')
export class LoanProductsController {
  constructor(
    private readonly loanProductService: LoanProductsService,
    private readonly prisma: PrismaService,
  ) {}

  @Permission([Action.Create, 'LoanProduct'])
  @Post()
  async create(@Body() loanProduct: CreateLoanProductDto) {
    return await this.loanProductService.create(loanProduct);
  }

  @Permission([Action.Read, 'LoanProduct'])
  @Get()
  findAll() {
    return this.loanProductService.getAllLoanProducts();
  }

  @Permission([Action.Read, 'LoanProduct'])
  @Get('/:id')
  findOne(@Param('id') id: string) {
    return this.loanProductService.getLoanProduct(+id);
  }

  @Permission([Action.Update, 'LoanProduct'])
  @Patch('/:id')
  update(@Param('id') id: string, @Body() loanProduct: UpdateLoanProductDto) {
    return this.loanProductService.update(id, loanProduct);
  }

  @Patch('/:id/accounting-rule')
  async updateAccountingRule(
    @Body(
      new ParseArrayPipe({
        items: UpdateAccountingRuleDto,
      }),
    )
    data: UpdateAccountingRuleDto[],
    @Param('id', ParseIntPipe) id: number,
  ) {
    return await this.prisma.$transaction(
      data.map(({ financialResource, glAccountId }) =>
        this.prisma.gLAccountingRule.update({
          data: { glAccountId },
          where: {
            loanProductId_financialResource: {
              loanProductId: id,
              financialResource,
            },
          },
        }),
      ),
    );
  }
}
