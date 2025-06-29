import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { CaslModule } from '../casl/casl.module';
import { OrganizationModule } from '../organization/organization.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { JwtStrategy } from './jwt.strategy';
import { OTPService } from './otp.service';
import { PasswordService } from './password.service';
import { DocumentModule } from '../document/document.module';

@Module({
  imports: [
    CaslModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      useFactory: async (configService: ConfigService) => {
        const accessTokenEpiration = configService.get<string>('auth.accessTokenEpiration');
        return {
          secret: configService.get<string>('JWT_ACCESS_SECRET'),
          signOptions: {
            expiresIn: accessTokenEpiration,
          },
        };
      },
      inject: [ConfigService],
    }),
    HttpModule,
    OrganizationModule,
    DocumentModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, PasswordService, JwtAuthGuard, OTPService],
  exports: [JwtAuthGuard, AuthService],
})
export class AuthModule {}
