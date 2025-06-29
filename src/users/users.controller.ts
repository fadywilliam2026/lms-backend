import { accessibleBy } from '@casl/prisma';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  Request,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { omit } from 'lodash';
import { AuthService } from '../auth/auth.service';
import { CreateUserDto } from '../auth/dto/auth.dto';
import { Permission } from '../auth/jwt-auth.guard';
import { CaslAbilityFactory } from '../casl/casl-ability.factory';
import { Action } from '../common/types/action';
import { PrismaService } from 'nestjs-prisma';
import { changePasswordDto } from '../auth/dto/change-password.input.dto';
import { AnyFilesInterceptor, MulterFile } from '@webundsoehne/nest-fastify-file-upload';
import { ApiBearerAuth, ApiOkResponse, ApiTags, ApiUnprocessableEntityResponse } from '@nestjs/swagger';
import { WebhookDto } from './webhook.dto';
import { UsersService } from './users.service';
import { userResponse } from './response.body';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly caslAbilityFactory: CaslAbilityFactory,
    private readonly auth: AuthService,
    private readonly userService: UsersService,
  ) {}

  @Get('/current')
  getProfile(@Request() req) {
    return omit(req.user, ['password']);
  }

  @Post()
  @UseInterceptors(AnyFilesInterceptor())
  @Permission([Action.Create, 'User'])
  async create(@Req() { user }, @Body() createUserDto: CreateUserDto, @UploadedFiles() files: MulterFile[]) {
    const createdUser = await this.auth.createUser(user, createUserDto, files);
    return omit(createdUser, ['password']);
  }

  @Permission([Action.Update, 'User'])
  @Patch(':id/updatePassword')
  async updatePassword(@Param('id') id: string, @Body() { password }: changePasswordDto) {
    console.log(+id);
    await this.auth.changePassword(+id, password);
    return { success: true };
  }

  @Get()
  findAll(@Req() { user }) {
    const ability = this.caslAbilityFactory.createForUser(user);
    return this.prisma.user.findMany({ where: accessibleBy(ability).User });
  }

  @Permission([Action.Read, 'User'])
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.prisma.user.findUnique({ where: { id: +id } });
  }

  @Permission([Action.Update, 'User'])
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body()
    updateUserDto: Prisma.UserUpdateInput & {
      documents: Array<{
        id: number;
        type: string;
      }>;
    },
  ) {
    return this.auth.updateUser(+id, updateUserDto);
  }

  // TODO: Remove delete
  @Permission([Action.Delete, 'User'])
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.prisma.user.delete({ where: { id: +id } });
  }

  @Permission([Action.Update, 'User'])
  @Post('/webhook')
  @ApiOkResponse(userResponse.success.webhook)
  @ApiUnprocessableEntityResponse(userResponse.error.webhook[422])
  async webhook(@Request() { user }, @Body() webhook: WebhookDto) {
    return this.userService.addUserWebHook(user, webhook);
  }
}
