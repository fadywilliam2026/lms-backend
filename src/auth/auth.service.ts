import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Client, Prisma, User } from '@prisma/client';
import * as crypto from 'crypto';
import { omit } from 'lodash';
import { Roles } from '../common/types/role';
import { OrganizationService } from '../organization/organization.service';
import { PrismaService } from 'nestjs-prisma';
import { CreateUserDto } from './dto/auth.dto';
import { PasswordService } from './password.service';
import { DocumentService } from '../document/document.service';
import { MulterFile } from '@webundsoehne/nest-fastify-file-upload';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly passwordService: PasswordService,
    private readonly configService: ConfigService,
    private readonly organizationService: OrganizationService,
    private readonly documentService: DocumentService,
  ) {}

  async changePassword(userId: number, password: string) {
    const hashedPassword = await this.passwordService.hashPassword(password);
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
      },
    });
  }

  async createUser(user: User, payload: CreateUserDto, files?: MulterFile[]) {
    if (payload.roleId) {
      const role = await this.prisma.role.findUniqueOrThrow({ where: { id: +payload.roleId } });
      payload.role = role.name;
    }
    if (user) {
      const role = await this.prisma.role.findUnique({ where: { id: user.roleId } });
      if (role.name !== Roles.admin) {
        if (payload.role == Roles.admin) {
          throw new UnprocessableEntityException('Not allowed to create admin user');
        }
        payload.organizationId = user.organizationId;
      }
    }

    const hashedPassword = payload.password ? await this.passwordService.hashPassword(payload.password) : null;

    if (payload.organizationId) {
      await this.organizationService.validateOrganizationId(+payload.organizationId);
    }

    try {
      const attachments = payload.attachments;
      const filtered = omit(payload, ['organizationId', 'role', 'roleId', 'attachments']);

      const user = await this.prisma.user.create({
        data: {
          ...filtered,
          ...(payload.password && { password: hashedPassword }),
          role: { connect: { name: payload.role } },
          ...(payload.organizationId && { organization: { connect: { id: +payload.organizationId } } }),
        },
      });

      if (files?.length) {
        const allFilesInfo: Array<{ title: string; type: string }> = [];
        attachments.forEach(attachment => {
          attachment.files.forEach(file => {
            allFilesInfo.push({
              ...file,
              type: attachment.type,
            });
          });
        });
        await Promise.all(
          files.map(file => {
            return this.documentService.create(
              'USER',
              user.id,
              {
                type: allFilesInfo.find(f => f.title === file.originalname).type,
              },
              file,
            );
          }),
        );
      }

      const tokens = await this.generateTokens({ userId: user.id, organizationId: user.organizationId });
      return { ...user, ...tokens };
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        throw new ConflictException(`User with the same email or phone already exists.`);
      } else {
        throw new Error(e);
      }
    }
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new NotFoundException(`No user found for email: ${email}`);
    }

    const passwordValid = await this.passwordService.validatePassword(password, user.password);

    if (!passwordValid) {
      throw new BadRequestException('Invalid password');
    }
    const tokens = await this.generateTokens({ userId: user.id, organizationId: user.organizationId });
    return { ...user, ...tokens };
  }

  async validateUser(userId: number): Promise<User> {
    try {
      return await this.prisma.user.findUniqueOrThrow({ where: { id: userId }, include: { role: true } });
    } catch (e) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async validateClient(clientId: number): Promise<Client> {
    try {
      return await this.prisma.client.findUniqueOrThrow({ where: { id: clientId } });
    } catch (e) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async generateTokens(
    payload: { userId: number; organizationId: number } | { clientId: number; organizationId: number },
    jti: string = crypto.randomUUID(),
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const accessToken = this.generateAccessToken({
      ...payload,
      jti,
      ts: Math.random(),
    });
    const refreshToken = this.generateRefreshToken({ ...omit(payload, ['organizationId']), jti, ts: Math.random() });

    if ('userId' in payload) {
      await this.prisma.refreshToken.upsert({
        where: { jti },
        create: { token: refreshToken, jti, userId: payload.userId },
        update: { token: refreshToken },
      });
    } else {
      await this.prisma.clientRefreshToken.upsert({
        where: { jti },
        create: { token: refreshToken, jti, clientId: payload.clientId },
        update: { token: refreshToken },
      });
    }

    return { accessToken, refreshToken };
  }

  private generateAccessToken(
    payload: Partial<{
      userId: number;
      clientId: number;
      jti: string;
      ts: number;
      organizationId: number;
    }>,
  ): string {
    return this.jwtService.sign(payload);
  }

  private generateRefreshToken(
    payload: Partial<{ userId: number; clientId: number; jti: string; ts: number }>,
  ): string {
    const refreshIn = this.configService.get<string>('auth.refressTokenEpiration');
    return this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: refreshIn,
    });
  }

  async refreshToken(token: string) {
    const dbToken = await this.prisma.refreshToken.findFirst({
      where: { token },
      include: { user: true },
    });
    if (!dbToken) {
      try {
        const { jti } = this.jwtService.verify(token, {
          secret: this.configService.get('JWT_REFRESH_SECRET'),
        });
        await this.prisma.refreshToken.deleteMany({ where: { jti } });
      } catch (e) {
        throw new UnauthorizedException('Invalid refresh token');
      }
      throw new UnauthorizedException('Refresh token not found');
    } else {
      return await this.generateTokens(
        { userId: dbToken.user.id, organizationId: dbToken.user.organizationId },
        dbToken.jti,
      );
    }
  }

  async updateUser(
    userId: number,
    updateUserDto: Prisma.UserUpdateInput & { documents: Array<{ id: number; type: string }> },
  ) {
    const { documents } = updateUserDto;
    delete updateUserDto.documents;
    await this.documentService.updateDocumentsIfNeeded(documents);
    await this.documentService.deleteDocumentsIfNeeded('USER', userId, documents);
    return this.prisma.user.update({
      where: { id: userId },
      data: updateUserDto,
    });
  }

  async clientTokens(nationalId: string) {
    let client;

    try {
      client = await this.prisma.client.findFirstOrThrow({ where: { nationalId } });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025')
        throw new BadRequestException('No Client Found With his National ID');
    }

    const token = await this.generateTokens({
      clientId: client.id,
      organizationId: client.organizationId,
    });

    return token;
  }
}
