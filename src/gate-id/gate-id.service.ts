import { HttpService } from '@nestjs/axios';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cache } from 'cache-manager';
import { CreateContractBody } from './gateid-types';
import { Client, Prisma } from '@prisma/client';
import { PdfService } from './pdf.service';
import { ValidateAnswersDto } from '../clients/dto/validate-answers.dto';

const GATEID_ACCESS_TOKEN = 'GATEID_ACCESS_TOKEN';

@Injectable()
export class GateIdService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly pdfService: PdfService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  private async login() {
    const accessToken = await this.cacheManager.get<string>(GATEID_ACCESS_TOKEN);
    if (accessToken) {
      return accessToken;
    }
    return this.httpService.axiosRef
      .post(`${this.configService.get('GATEID_HOST')}/auth/company-login`, {
        username: this.configService.get('GATEID_USERNAME'),
        password: this.configService.get('GATEID_PASSWORD'),
      })
      .then(async res => {
        await this.cacheManager.set(GATEID_ACCESS_TOKEN, res.data.accessToken, 60 * 60 * 1000);
        return res.data.accessToken;
      });
  }
  async createClientContract(client: Client, answers: ValidateAnswersDto) {
    const { file, terms } = await this.pdfService.prepareClientContract(client, answers);
    return await this.createContract(
      {
        title: 'عقد خدمات',
        nationalIds: [
          {
            nationalId: client.nationalId,
            signaturePositions: {
              page: 1,
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
              fontsize: 10,
            },
          },
        ],
        signaturePositions: {
          page: 16,
          top: 450,
          bottom: 270,
          left: 260,
          right: 460,
          fontsize: 10,
        },
        terms,
      },
      file,
    );
  }
  async createLoanContract(
    loanAccount: Prisma.LoanAccountGetPayload<{ include: { client: true; installments: true } }>,
  ) {
    const { file, terms } = await this.pdfService.prepareLoanContract(loanAccount);
    return await this.createContract(
      {
        title: 'عقد تمويل',
        nationalIds: [
          {
            nationalId: loanAccount.client.nationalId,
            signaturePositions: {
              page: 1,
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
              fontsize: 10,
            },
          },
        ],
        signaturePositions: {
          page: 7,
          top: 400,
          bottom: 280,
          left: 270,
          right: 480,
          fontsize: 10,
        },
        terms,
      },

      file,
    );
  }

  async createContract(body: CreateContractBody, file: Blob) {
    const formData = new FormData();
    formData.append('contractFile', file);
    formData.append('details', JSON.stringify(body));
    return await this.login()
      .then(token => {
        return this.httpService.axiosRef.post(`${this.configService.get('GATEID_HOST')}/contract`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      })
      .catch(err => {
        throw new BadRequestException(err.response?.data?.message);
      });
  }

  async getContract(contractId: number) {
    return await this.login().then(token => {
      return this.httpService.axiosRef.get(`${this.configService.get('GATEID_HOST')}/contract/${contractId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    });
  }
}
