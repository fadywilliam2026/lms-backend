import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

@Injectable()
export class ParseAndValidateJsonPipe implements PipeTransform<string, Record<string, any>> {
  private readonly dto: any;
  constructor(dto: any) {
    this.dto = dto;
  }
  async transform(value: string) {
    // const propertyName = metadata.data;
    try {
      const parsedJson = JSON.parse(value);
      console.log('parse', parsedJson);
      await this.toValidate(parsedJson);
      return parsedJson;
    } catch (e) {
      throw new BadRequestException(JSON.stringify(e));
    }
  }
  async toValidate(value: any) {
    const object = plainToInstance(this.dto, value);
    const errors = await validate(object);

    if (errors.length > 0) {
      throw errors[0].constraints;
    }
    return value;
  }
}
