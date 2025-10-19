import { Module } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionsController } from './subscriptions.controller';
import { SubscriptionsRepository } from './subscriptions.repository';
import { SubscriptionParticipantsService } from './subscription-participants.service';
import { ShareCalculationService } from './share-calculation.service';
import { ParticipantValidationService } from './participant-validation.service';
import { SubscriptionAuditService } from './subscription-audit.service';

@Module({
  controllers: [SubscriptionsController],
  providers: [
    SubscriptionsService,
    SubscriptionsRepository,
    SubscriptionParticipantsService,
    ShareCalculationService,
    ParticipantValidationService,
    SubscriptionAuditService,
  ],
  exports: [
    SubscriptionsService,
    SubscriptionsRepository,
    SubscriptionParticipantsService,
    ShareCalculationService,
    ParticipantValidationService,
    SubscriptionAuditService,
  ],
})
export class SubscriptionsModule {}
