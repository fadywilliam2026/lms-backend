import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { argon2id, hash, Options, verify } from 'argon2';
// import { hash, compare } from 'bcrypt';

@Injectable()
export class PasswordService {
  get getArginOptions(): Options & { raw?: false } {
    const secret = this.configService.get<string>('ARGON2_SECRET');

    return {
      type: argon2id,
      memoryCost: 2 ** 16,
      hashLength: 50,
      secret: Buffer.from(secret),
    };
  }

  constructor(private configService: ConfigService) {}

  validatePassword(password: string, hashedPassword: string): Promise<boolean> {
    return verify(hashedPassword, password, this.getArginOptions);
  }

  hashPassword(password: string): Promise<string> {
    return hash(password, this.getArginOptions);
  }
}
