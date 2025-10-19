import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { PaymentsRepository } from './payments.repository';
import { PaymentVerificationService } from './payment-verification.service';
import { PaymentStatusGuard } from './payment-status.guard';
import { PaymentWorkflowService } from './payment-workflow.service';
import { PaymentAuditService } from './payment-audit.service';
import { PaymentNotificationService } from './payment-notification.service';
import { PaymentHistoryService } from './payment-history.service';

@Module({
  controllers: [PaymentsController],
  providers: [
    PaymentsService,
    PaymentsRepository,
    PaymentVerificationService,
    PaymentWorkflowService,
    PaymentAuditService,
    PaymentNotificationService,
    PaymentHistoryService,
    PaymentStatusGuard,
  ],
  exports: [
    PaymentsService,
    PaymentsRepository,
    PaymentVerificationService,
    PaymentWorkflowService,
    PaymentAuditService,
    PaymentNotificationService,
    PaymentHistoryService,
  ],
})
export class PaymentsModule {}
