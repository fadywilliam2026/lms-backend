import { PartialType } from '@nestjs/swagger';
import { CreateClientsDto } from './create-clients.dto';
import { IsArray, IsNumber, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateClientsDto extends PartialType(CreateClientsDto) {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Document)
  documents: Document[];
}

class Document {
  @IsNumber()
  id: number;

  @IsString()
  type: string;
}
