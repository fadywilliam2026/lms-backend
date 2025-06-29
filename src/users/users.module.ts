import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { CaslModule } from '../casl/casl.module';
import { UsersController } from './users.controller';
import { HttpModule } from '@nestjs/axios';
import { UsersService } from './users.service';

@Module({
  controllers: [UsersController],
  imports: [CaslModule, AuthModule, HttpModule],
  providers: [UsersService],
})
export class UsersModule {}
