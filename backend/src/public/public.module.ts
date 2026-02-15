import { Module } from '@nestjs/common';
import { PublicController } from './public.controller';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';
import { ReportsModule } from '../reports/reports.module';

@Module({
  imports: [SubscriptionsModule, ReportsModule],
  controllers: [PublicController],
})
export class PublicModule {}
