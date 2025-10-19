import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { SubscriptionParticipant, ShareType } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class ShareCalculationService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Recalculates equal shares for all participants in a subscription
   * when a new participant is added or existing ones are modified
   */
  async recalculateEqualShares(subscriptionId: string): Promise<void> {
    // Get subscription info
    const subscription = await this.prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: {
        participants: {
          where: { is_active: true },
        },
      },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    const activeParticipants = subscription.participants.filter(p => p.is_active);
    
    if (activeParticipants.length === 0) {
      throw new BadRequestException('No active participants found in subscription');
    }

    // Calculate equal share amount
    const totalAmount = subscription.total_amount;
    const equalShareAmount = totalAmount.div(activeParticipants.length);

    // Update all participants with EQUAL share type to have the correct share_value
    await this.prisma.subscriptionParticipant.updateMany({
      where: {
        subscription_id: subscriptionId,
        share_type: ShareType.EQUAL,
        is_active: true,
      },
      data: {
        share_value: equalShareAmount,
      },
    });
  }

  /**
   * Gets the calculated share amount for a participant based on their share type
   */
  async getParticipantShareAmount(
    subscriptionId: string,
    participantId: string,
  ): Promise<Decimal> {
    const participant = await this.prisma.subscriptionParticipant.findFirst({
      where: {
        id: participantId,
        subscription_id: subscriptionId,
        is_active: true,
      },
    });

    if (!participant) {
      throw new NotFoundException('Participant not found');
    }

    if (participant.share_type === ShareType.EQUAL) {
      // For equal shares, calculate based on current active participant count
      const activeParticipantCount = await this.prisma.subscriptionParticipant.count({
        where: {
          subscription_id: subscriptionId,
          is_active: true,
        },
      });

      const subscription = await this.prisma.subscription.findUnique({
        where: { id: subscriptionId },
        select: { total_amount: true },
      });

      if (!subscription) {
        throw new NotFoundException('Subscription not found');
      }

      return subscription.total_amount.div(activeParticipantCount);
    } else if (participant.share_type === ShareType.CUSTOM) {
      if (!participant.share_value) {
        throw new BadRequestException(
          'Participant has custom share type but no share_value specified',
        );
      }
      return participant.share_value;
    }

    throw new BadRequestException('Invalid share type');
  }

  /**
   * Validates that all shares sum to the subscription total amount
   */
  async validateSharesSum(subscriptionId: string): Promise<boolean> {
    const subscription = await this.prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: {
        participants: {
          where: { is_active: true },
        },
      },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    const activeParticipants = subscription.participants.filter(p => p.is_active);
    let calculatedTotal = new Decimal(0);

    for (const participant of activeParticipants) {
      if (participant.share_type === ShareType.EQUAL) {
        const equalShare = subscription.total_amount.div(activeParticipants.length);
        calculatedTotal = calculatedTotal.add(equalShare);
      } else if (participant.share_type === ShareType.CUSTOM && participant.share_value) {
        calculatedTotal = calculatedTotal.add(participant.share_value);
      }
    }

    const tolerance = new Decimal(0.01); // 1 cent tolerance
    const difference = calculatedTotal.sub(subscription.total_amount).abs();
    
    return difference.lte(tolerance);
  }
}
