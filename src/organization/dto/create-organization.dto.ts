import { IsJSON, IsOptional, IsString } from 'class-validator';

export class CreateOrganizationDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsJSON()
  products?: any;

  @IsOptional()
  @IsJSON()
  customFields?: any;
}
