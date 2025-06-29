import { HttpStatus } from '@nestjs/common';
import { ApiResponseOptions } from '@nestjs/swagger';

const client = {
  nationalId: {
    nationalIdSchema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'success' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'number', example: 6 },
            createdAt: { type: 'date', example: '2024-11-05T09:38:52.756Z' },
            updatedAt: { type: 'date', example: '2024-11-10T13:56:42.546Z' },
            firstName: { type: 'string', example: 'string' },
            lastName: { type: 'string', example: 'string' },
            email: { type: 'string', example: 'email@test.com' },
            phone: { type: 'string', example: '01000000000' },
            gender: { type: 'string', example: 'MALE' },
            birthDate: { type: 'date', example: '2024-11-10T13:56:42.546Z' },
            address: { type: 'string', example: 'string' },
            governorate: { type: 'string', example: 'string' },
            city: { type: 'string', example: 'string' },
            nationalId: { type: 'string', example: '27304098800051' },
            taxRecordId: { type: 'string', example: '123456' },
            customFields: {
              type: 'object',
              properties: {
                industry: { type: 'string', example: 'string' },
                commercialRecord: { type: 'string', example: '1234' },
                establishmentDate: { type: 'date', example: '2024-11-10T13:56:42.546Z' },
              },
            },
            preferredLanguage: { type: 'string', example: 'ARABIC' },
            loanCycle: { type: 'number', example: 0 },
            userId: { type: 'number', example: 2 },
            organizationId: { type: 'number', example: 1 },
            state: { type: 'enum', example: 'PENDING_APPROVAL' },
            initialLimit: { type: 'number', example: 0 },
            currentLimit: { type: 'number', example: 0 },
            approvedLimit: { type: 'number', example: 0 },
            commercialName: { type: 'string', example: 'string' },
            contractId: { type: 'number', example: 6 },
            authToken: { type: 'string', example: 'token' },
            firstContractFormAnswers: { type: 'object' },
            duePaymentHistory: { type: 'enum', example: 'NO' },
            historicalLoansCount: { type: 'number', example: 0 },
            partnerHistoricalLoansCount: { type: 'number', example: 0 },
            yearsOfOperations: { type: 'number', example: 0 },
            pastDuesCount: { type: 'number', example: 0 },
            isChequeSecurity: { type: 'boolean', example: false },
            paymentFrequency: {
              type: 'object',
              example: 'EVERY_7_DAYS',
              enum: ['EVERY_7_DAYS', 'EVERY_15_DAYS', 'EVERY_MONTH'],
            },
            loanAccounts: {
              type: 'array',
            },
          },
        },
      },
    },
    errorSchema: {
      400: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Bad Request' },
          error: { type: 'string', example: 'Bad Request' },
          statusCode: { type: 'number', example: HttpStatus.BAD_REQUEST },
        },
      },
      404: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'No Client Found' },
          error: { type: 'string', example: 'Not Found' },
          statusCode: { type: 'number', example: HttpStatus.NOT_FOUND },
        },
      },
    },
  },
  clientFromPartner: {
    clientFromPartnerSchema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'success' },
        data: { type: 'url', example: 'https://example.com' },
      },
    },
    errorSchema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Internal Server Error' },
        error: { type: 'string', example: 'Internal Server Error' },
        statusCode: { type: 'number', example: HttpStatus.INTERNAL_SERVER_ERROR },
      },
    },
  },
};
type ClientResponse = {
  success: {
    nationalId: ApiResponseOptions;
    clientFromPartner: ApiResponseOptions;
  };
  error: {
    nationalId: {
      400: ApiResponseOptions;
      404: ApiResponseOptions;
    };
    clientFromPartner: {
      500: ApiResponseOptions;
    };
  };
};

export const clientResponse: ClientResponse = {
  success: {
    nationalId: {
      status: 200,
      description: 'Create client successfully',
      schema: client.nationalId.nationalIdSchema,
    },
    clientFromPartner: {
      status: 200,
      description: 'Create client successfully',
      schema: client.clientFromPartner.clientFromPartnerSchema,
    },
  },
  error: {
    nationalId: {
      400: {
        status: 400,
        description: 'Bad Request',
        schema: client.nationalId.errorSchema[400],
      },
      404: {
        status: 404,
        description: 'No client Found',
        schema: client.nationalId.errorSchema[404],
      },
    },
    clientFromPartner: {
      500: {
        status: 500,
        description: 'Internal Server Error',
        schema: client.clientFromPartner.errorSchema,
      },
    },
  },
};
