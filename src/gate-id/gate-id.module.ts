import { HttpModule } from '@nestjs/axios';
import { GateIdService } from './gate-id.service';
import { Global, Module } from '@nestjs/common';
import { PdfService } from './pdf.service';

@Global()
@Module({
  imports: [HttpModule],
  exports: [GateIdService],
  providers: [GateIdService, PdfService],
})
export class GateIdModule {}
