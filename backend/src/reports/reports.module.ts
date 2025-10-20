import { Module } from '@nestjs/common';
import { ReportsController } from './reports.controller';
import { ReportService } from './report.service';
import { BalanceService } from './balance.service';
import { ReportsRepository } from './reports.repository';
import { ReportCacheService } from './report-cache.service';
import { ReportExportService } from './report-export.service';
import { ReportSchedulerService } from './report-scheduler.service';
import { ReportAnalyticsService } from './report-analytics.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [ReportsController],
  providers: [
    ReportService,
    BalanceService,
    ReportsRepository,
    ReportCacheService,
    ReportExportService,
    ReportSchedulerService,
    ReportAnalyticsService,
  ],
  exports: [
    ReportService,
    BalanceService,
    ReportsRepository,
  ],
})
export class ReportsModule {}

