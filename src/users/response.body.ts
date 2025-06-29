import { HttpStatus } from '@nestjs/common';
import { ApiResponseOptions } from '@nestjs/swagger';

const User = {
  webhook: {
    webhookSchema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'success' },
        data: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'Webhook successfully set!' },
          },
        },
      },
    },
    errorSchema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Could not reach webhook URL' },
        error: { type: 'string', example: 'Unprocessable Entity' },
        statusCode: { type: 'integer', example: HttpStatus.UNPROCESSABLE_ENTITY },
      },
    },
  },
};

type UserResponse = {
  success: {
    webhook: ApiResponseOptions;
  };
  error: {
    webhook: {
      422: ApiResponseOptions;
    };
  };
};

export const userResponse: UserResponse = {
  success: {
    webhook: {
      status: 200,
      description: 'Webhook successfully set!',
      schema: User.webhook.webhookSchema,
    },
  },
  error: {
    webhook: {
      422: {
        status: 422,
        description: 'Could not reach webhook URL',
        schema: User.webhook.errorSchema,
      },
    },
  },
};
