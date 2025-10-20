import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { HealthModule } from './health/health.module';
import { UsersModule } from './users/users.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { ChargesModule } from './charges/charges.module';
import { PaymentsModule } from './payments/payments.module';
import { UserPaymentsModule } from './payments/user-payments.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    AuthModule,
    HealthModule,
    UsersModule,
    SubscriptionsModule,
    ChargesModule,
    PaymentsModule,
    UserPaymentsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

