import { BadRequestException } from '@nestjs/common';

export const sleep = ms => new Promise(r => setTimeout(r, ms));

export const validateRange = (value: number, min: number, max: number, error: string) => {
  if (value < min || value > max) {
    throw new BadRequestException(error);
  }
};
