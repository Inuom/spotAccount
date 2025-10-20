import { Module } from '@nestjs/common';
import { UserPaymentsController } from './user-payments.controller';
import { UserPaymentService } from './user-payment.service';
import { UserPaymentsRepository } from './user-payments.repository';
import { PaymentOwnershipGuard } from './payment-ownership.guard';
import { PaymentModificationService } from './payment-modification.service';
import { PaymentValidationService } from './payment-validation.service';
import { PaymentConflictService } from './payment-conflict.service';
import { PaymentSchedulingService } from './payment-scheduling.service';
import { PaymentsModule } from './payments.module';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [PaymentsModule, DatabaseModule],
  controllers: [UserPaymentsController],
  providers: [
    UserPaymentService,
    UserPaymentsRepository,
    PaymentOwnershipGuard,
    PaymentModificationService,
    PaymentValidationService,
    PaymentConflictService,
    PaymentSchedulingService,
  ],
  exports: [
    UserPaymentService,
    UserPaymentsRepository,
    PaymentOwnershipGuard,
    PaymentModificationService,
    PaymentValidationService,
    PaymentConflictService,
    PaymentSchedulingService,
  ],
})
export class UserPaymentsModule {}
