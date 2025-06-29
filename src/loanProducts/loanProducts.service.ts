import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { GlService } from '../gl/gl.service';
import { CreateLoanProductDto, UpdateLoanProductDto } from './dto/LoanProduct.dto';

@Injectable()
export class LoanProductsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly glService: GlService,
  ) {}

  async create(loanProduct: CreateLoanProductDto) {
    return await this.prismaService.loanProduct.create({
      data: {
        ...loanProduct,
        arrearsSettings: {
          create: loanProduct.arrearsSettings,
        },
        interestRateSetting: {
          create: loanProduct.interestRateSetting,
        },
        principalPaymentSettings: {
          create: loanProduct?.principalPaymentSettings,
        },
        predefinedFees: {
          createMany: { data: loanProduct?.predefinedFees || [] },
        },
        gLAccountingRule: {
          createMany: { data: await this.glService.createDefaultGLRulesBody() },
        },
      },
    });
  }

  async update(id: string, loanProduct: UpdateLoanProductDto) {
    return this.prismaService.$transaction([
      this.prismaService.predefinedFee.deleteMany({ where: { loanProductId: +id } }),
      this.prismaService.loanProduct.update({
        data: {
          ...loanProduct,
          arrearsSettings: {
            update: loanProduct.arrearsSettings,
          },
          interestRateSetting: {
            update: loanProduct.interestRateSetting,
          },
          principalPaymentSettings: {
            update: loanProduct.principalPaymentSettings,
          },
          predefinedFees: {
            createMany: { data: loanProduct?.predefinedFees?.map(({ ...rest }: any) => rest) },
          },
        },
        where: { id: +id },
      }),
    ]);
  }

  getAllLoanProducts() {
    return this.prismaService.loanProduct.findMany();
  }

  getLoanProduct(id: number) {
    return this.prismaService.loanProduct.findUnique({ where: { id } });
  }

  async validateLoanProductId(id: number) {
    const loanProduct = await this.getLoanProduct(id);
    if (!loanProduct) {
      throw new NotFoundException('Loan product not found');
    }
    return loanProduct;
  }

  async findProductArrearsSettings(id: number) {
    return id ? await this.prismaService.productArrearsSettings.findUnique({ where: { id } }) : null;
  }

  async findInterestProductSettings(id: number) {
    return id ? await this.prismaService.interestProductSettings.findUnique({ where: { id } }) : null;
  }
}
