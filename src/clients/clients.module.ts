import { Module } from '@nestjs/common';
import { ClientsController } from './clients.controller';
import { ClientsService } from './clients.service';
import { HttpModule } from '@nestjs/axios';
import { CaslModule } from '../casl/casl.module';
import { DocumentModule } from '../document/document.module';
import { AuthModule } from '../auth/auth.module';
import { CreditEngineModule } from '../credit-engine/credit-engine.module';

@Module({
  imports: [HttpModule, CaslModule, DocumentModule, AuthModule, CreditEngineModule],
  controllers: [ClientsController],
  providers: [ClientsService],
  exports: [ClientsService],
})
export class ClientsModule {}
