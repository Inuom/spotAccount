import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { SubscriptionParticipant, ShareType } from '@prisma/client';
import { AddParticipantDto } from './dto/add-participant.dto';

@Injectable()
export class ParticipantValidationService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Validates that a user is not already a participant in the subscription
   */
  async validateUserNotAlreadyParticipant(
    subscriptionId: string,
    userId: string,
  ): Promise<void> {
    const existingParticipant = await this.prisma.subscriptionParticipant.findUnique({
      where: {
        subscription_id_user_id: {
          subscription_id: subscriptionId,
          user_id: userId,
        },
      },
    });

    if (existingParticipant) {
      throw new BadRequestException(
        'User is already a participant in this subscription',
      );
    }
  }

  /**
   * Validates that the user exists in the system
   */
  async validateUserExists(userId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.is_active) {
      throw new BadRequestException('User account is inactive');
    }
  }

  /**
   * Validates that the subscription exists and is active
   */
  async validateSubscriptionExists(subscriptionId: string): Promise<void> {
    const subscription = await this.prisma.subscription.findUnique({
      where: { id: subscriptionId },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    if (!subscription.is_active) {
      throw new BadRequestException('Subscription is inactive');
    }
  }

  /**
   * Validates the add participant DTO
   */
  async validateAddParticipantDto(
    subscriptionId: string,
    addParticipantDto: AddParticipantDto,
  ): Promise<void> {
    const { user_id, share_type, share_value } = addParticipantDto;

    // Validate user exists
    await this.validateUserExists(user_id);

    // Validate subscription exists
    await this.validateSubscriptionExists(subscriptionId);

    // Validate user is not already a participant
    await this.validateUserNotAlreadyParticipant(subscriptionId, user_id);

    // Validate share type and value
    if (share_type === ShareType.CUSTOM) {
      if (!share_value || share_value <= 0) {
        throw new BadRequestException(
          'Custom share type requires a positive share_value',
        );
      }

      // Get subscription total amount to validate custom share doesn't exceed total
      const subscription = await this.prisma.subscription.findUnique({
        where: { id: subscriptionId },
        select: { total_amount: true },
      });

      if (subscription && share_value > subscription.total_amount.toNumber()) {
        throw new BadRequestException(
          'Custom share value cannot exceed subscription total amount',
        );
      }
    }
  }

  /**
   * Checks if adding this participant would create share sum issues
   */
  async validateShareBalance(
    subscriptionId: string,
    addParticipantDto: AddParticipantDto,
  ): Promise<void> {
    const { share_type, share_value } = addParticipantDto;

    if (share_type === ShareType.CUSTOM && share_value) {
      // Get current subscription and participants
      const subscription = await this.prisma.subscription.findUnique({
        where: { id: subscriptionId },
        include: {
          participants: {
            where: { is_active: true },
          },
        },
      });

      if (!subscription) {
        return; // Already validated in validateAddParticipantDto
      }

      // Calculate current custom shares total
      const currentCustomShares = subscription.participants
        .filter(p => p.share_type === ShareType.CUSTOM && p.share_value)
        .reduce((sum, p) => sum + p.share_value!.toNumber(), 0);

      const newCustomTotal = currentCustomShares + share_value;

      // Check if new custom total would exceed subscription total
      if (newCustomTotal > subscription.total_amount.toNumber()) {
        const remainingForEqual = subscription.total_amount.toNumber() - currentCustomShares;
        throw new BadRequestException(
          `Custom share value of ${share_value} would exceed available amount. ` +
          `Maximum allowed for new participant: ${remainingForEqual.toFixed(2)}`,
        );
      }
    }
  }
}
