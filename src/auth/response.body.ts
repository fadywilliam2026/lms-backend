import { HttpStatus } from '@nestjs/common';
import { ApiResponseOptions } from '@nestjs/swagger';

const Auth = {
  login: {
    loginSchema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'success' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 2 },
            createdAt: { type: 'date', example: '2023-06-01T00:00:00.000Z' },
            updatedAt: { type: 'date', example: '2023-06-01T00:00:00.000Z' },
            email: { type: 'string', example: 'admin@test.com' },
            firstName: { type: 'string', example: 'Admin' },
            lastName: { type: 'string', example: 'f' },
            customFields: {
              type: 'object',
              properties: {
                industry: { type: 'string', example: 'PHARMACY' },
                commercialRecord: { type: 'string', example: '1234' },
                establishmentDate: { type: 'date', example: '2024-11-10T13:56:42.546Z' },
              },
            },
            roleId: { type: 'integer', example: 1 },
            permissions: { type: 'array' },
            phone: { type: 'string', example: '01000000000' },
            webhookUrl: { type: 'string', example: 'https://example.com/webhook' },
            controlOfCashFlow: {
              type: 'object',
              example: 'partner',
              enum: ['partner', 'client'],
            },
            carrierOfPaymentRisk: {
              type: 'object',
              example: 'partner',
              enum: ['partner', 'client'],
            },
            methodOfLoanRepayment: {
              type: 'object',
              example: 'partner',
              enum: ['partner', 'client', 'directDebit'],
            },
            organizationId: { type: 'integer', example: 1 },
            accessToken: { type: 'string', example: 'JWT_TOKEN' },
            refreshToken: { type: 'string', example: 'REFRESH_TOKEN' },
          },
        },
      },
    },
    errorSchema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Invalid email or password' },
        error: { type: 'string', example: 'Not Found' },
        statusCode: { type: 'integer', example: HttpStatus.NOT_FOUND },
      },
    },
  },
  refreshToken: {
    refreshTokenSchema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'success' },
        data: {
          type: 'object',
          properties: {
            accessToken: { type: 'string', example: 'token' },
            refreshToken: { type: 'string', example: 'refresh' },
          },
        },
      },
    },
    errorSchema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Invalid refresh token' },
        error: { type: 'string', example: 'Unauthorized' },
        statusCode: { type: 'integer', example: HttpStatus.UNAUTHORIZED },
      },
    },
  },
};

type AuthResponse = {
  success: {
    login: ApiResponseOptions;
    refreshToken: ApiResponseOptions;
  };
  error: {
    login: {
      404: ApiResponseOptions;
    };
    refreshToken: {
      401: ApiResponseOptions;
    };
  };
};

export const authResponse: AuthResponse = {
  success: {
    login: {
      status: 200,
      description: 'Successful login',
      schema: Auth.login.loginSchema,
    },
    refreshToken: {
      status: 200,
      description: 'Successful refresh token',
      schema: Auth.refreshToken.refreshTokenSchema,
    },
  },
  error: {
    login: {
      404: {
        status: 404,
        description: 'Invalid email or password',
        schema: Auth.login.errorSchema,
      },
    },
    refreshToken: {
      401: {
        status: 401,
        description: 'Unauthorized',
        schema: Auth.refreshToken.errorSchema,
      },
    },
  },
};
