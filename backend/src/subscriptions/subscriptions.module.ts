import { Module } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionsController } from './subscriptions.controller';
import { SubscriptionsRepository } from './subscriptions.repository';
import { SubscriptionParticipantsService } from './subscription-participants.service';

@Module({
  controllers: [SubscriptionsController],
  providers: [SubscriptionsService, SubscriptionsRepository, SubscriptionParticipantsService],
  exports: [SubscriptionsService, SubscriptionsRepository, SubscriptionParticipantsService],
})
export class SubscriptionsModule {}
