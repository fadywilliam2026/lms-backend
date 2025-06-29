import { Body, Controller, HttpCode, HttpStatus, Logger, NotFoundException, Post } from '@nestjs/common';
import { omit } from 'lodash';
import { PrismaService } from 'nestjs-prisma';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/auth.dto';
import { PhoneDTO, VerifyOTPDto } from './dto/otp.input.dto';
import { RefreshTokenDto } from './dto/refresh-token.input.dto';
import { OTPService } from './otp.service';
import { ApiBadRequestResponse, ApiBearerAuth, ApiOkResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { authResponse } from './response.body';
import { Public } from './decorators';
@Public()
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly otpService: OTPService,
    private readonly prisma: PrismaService,
  ) {}

  private readonly logger = new Logger(AuthController.name);
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse(authResponse.success.login)
  @ApiBadRequestResponse(authResponse.error.login[404])
  async login(@Body() { email, password }: LoginDto) {
    const user = await this.auth.login(email.toLowerCase(), password);
    return omit(user, ['password']);
  }

  @Post('refreshToken')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse(authResponse.success.refreshToken)
  @ApiUnauthorizedResponse(authResponse.error.refreshToken[401])
  @ApiBearerAuth()
  refreshToken(@Body() { refreshToken }: RefreshTokenDto) {
    return this.auth.refreshToken(refreshToken);
  }

  @Post('sendOTP')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  async sendOTP(@Body() { phone }: PhoneDTO) {
    const user = await this.prisma.user.findUnique({ where: { phone: phone } });
    if (user) {
      const smsSent = await this.otpService.sendOTP(user);
      if (smsSent.data.code === '4901') {
        return 'OTP message sent!';
      } else {
        throw new NotFoundException('OTP message not sent!');
      }
    } else {
      throw new NotFoundException(`No user found for mobile number: ${phone}`);
    }
  }

  @Post('verifyOTP')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  async verifyOTP(@Body() { phone, otp }: VerifyOTPDto) {
    return this.otpService.verifyOTP(phone, otp);
  }
}
