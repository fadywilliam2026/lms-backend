import { HttpModule } from '@nestjs/axios';
import { Global, Module } from '@nestjs/common';
import { CreditEngineService } from './credit-engine.service';
import { AuthModule } from '../auth/auth.module';
import { CacheModule } from '@nestjs/cache-manager';

@Global()
@Module({
  imports: [HttpModule, AuthModule, CacheModule.register()],
  exports: [CreditEngineService],
  providers: [CreditEngineService],
})
export class CreditEngineModule {}
