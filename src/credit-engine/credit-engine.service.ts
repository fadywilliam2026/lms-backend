import { HttpService } from '@nestjs/axios';
import { HttpException, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MulterFile } from '@webundsoehne/nest-fastify-file-upload';
import { PrismaService } from 'nestjs-prisma';
import { AuthService } from '../auth/auth.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { CreateClientForCreditEngineDto } from '../clients/dto/create-client-form-partner.dto';

@Injectable()
export class CreditEngineService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
    private readonly authService: AuthService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  private CACHED_EXP_TIME = 2 * 60 * 60 * 1000;
  private CREDIT_BACKEND = this.configService.get<string>('CREDIT_BACKEND');

  async getCreditLimit(userId: number, clientId: number) {
    const userAccessToken = await this.getCachedUserAccessToken(userId);
    try {
      const res = await this.httpService.axiosRef.get(`${this.CREDIT_BACKEND}/clients/${clientId}/credit-limit`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userAccessToken}`,
        },
      });
      return res.data;
    } catch (error) {
      console.log(error);
      throw new HttpException(error.response.data.message, error.response.status);
    }
  }

  async postClientCreditData(userId: number, creditData: CreateClientForCreditEngineDto) {
    try {
      // Send it to the credit engine backend
      const userAccessToken = await this.getCachedUserAccessToken(userId);
      const res = await this.httpService.axiosRef.post(`${this.CREDIT_BACKEND}/client`, creditData, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userAccessToken}`,
        },
      });
      return res.data;
    } catch (error) {
      console.log('postClientCreditData', error);
      throw new HttpException(error.response.data.message, error.response.status);
    }
  }

  async updateClientCreditData(userId: number, creditData) {
    try {
      // Send it to the credit engine backend
      const userAccessToken = await this.getCachedUserAccessToken(userId);
      const res = await this.httpService.axiosRef.put(
        `${this.CREDIT_BACKEND}/client/${creditData.clientId}/credit-data`,
        creditData,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${userAccessToken}`,
          },
        },
      );
      return res.data;
    } catch (error) {
      console.log(error);
      throw new HttpException(error.response.data.message, error.response.status);
    }
  }

  async uploadClientBankStatements(userId: number, file: MulterFile, clientId: number) {
    try {
      const userAccessToken = await this.getCachedUserAccessToken(userId);
      const formData = new FormData();
      const blob = new Blob([file.buffer], {
        type: file.mimetype,
      });
      formData.append('bank_statement', blob);

      const res = await this.httpService.axiosRef.postForm(
        `${this.CREDIT_BACKEND}/clients/${clientId}/upload-bank-statement`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${userAccessToken}`,
          },
        },
      );
      return res.data;
    } catch (error) {
      console.log(error);
      throw new HttpException(error.response.data.message, error.response.status);
    }
  }

  async getRiskScore(userId: number, clientId: number) {
    try {
      const userAccessToken = await this.getCachedUserAccessToken(userId);
      const res = await this.httpService.axiosRef.get(`${this.CREDIT_BACKEND}/client/${clientId}/risk-score`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userAccessToken}`,
        },
      });
      return res.data;
    } catch (error) {
      console.log(error);
      throw new HttpException(error.response.data.message, error.response.status);
    }
  }

  private async getUserAccessToken(userId: number) {
    const user = await this.prismaService.user.findFirstOrThrow({
      where: {
        id: userId,
      },
    });
    const token = await this.authService.generateTokens({
      userId: user.id,
      organizationId: user.organizationId,
    });

    return token.accessToken;
  }

  private async getCachedUserAccessToken(userId: number) {
    const CACHED_KEY = `${userId}_access_token`;

    let userToken = await this.cacheManager.get<string>(CACHED_KEY);
    if (!userToken) {
      userToken = await this.getUserAccessToken(userId);
      await this.cacheManager.set(CACHED_KEY, userToken, this.CACHED_EXP_TIME);
    }

    return userToken;
  }
}
