import { IsDefined, IsString, MinLength } from 'class-validator';

export class changePasswordDto {
  @IsDefined()
  @IsString()
  @MinLength(8)
  password: string;
}
