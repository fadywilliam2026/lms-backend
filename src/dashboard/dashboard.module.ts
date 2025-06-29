import { Module } from '@nestjs/common';
import { InstallmentModule } from '../loan-management/installment/installment.module';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { ReportService } from '../report/report.service';

@Module({
  controllers: [DashboardController],
  providers: [DashboardService, ReportService],
  imports: [InstallmentModule],
})
export class DashboardModule {}
