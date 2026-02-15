import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { HealthModule } from './health/health.module';
import { UsersModule } from './users/users.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { ChargesModule } from './charges/charges.module';
import { PaymentsModule } from './payments/payments.module';
import { UserPaymentsModule } from './payments/user-payments.module';
import { ReportsModule } from './reports/reports.module';
import { PublicModule } from './public/public.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([
      { name: 'default', ttl: 60000, limit: 100 },
      { name: 'public', ttl: 60000, limit: 10 },
    ]),
    DatabaseModule,
    AuthModule,
    HealthModule,
    UsersModule,
    SubscriptionsModule,
    ChargesModule,
    PaymentsModule,
    UserPaymentsModule,
    ReportsModule,
    PublicModule,
  ],
  controllers: [],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}

