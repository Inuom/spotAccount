import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { SubscriptionParticipant, ShareType, Prisma } from '@prisma/client';
import { CreateSubscriptionParticipantDto } from './dto/create-subscription.dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class SubscriptionParticipantsService {
  constructor(private readonly prisma: PrismaService) {}

  async createSubscriptionParticipant(
    subscriptionId: string,
    participantDto: CreateSubscriptionParticipantDto,
  ): Promise<SubscriptionParticipant> {
    const { user_id, share_type, share_value } = participantDto;

    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id: user_id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if subscription exists
    const subscription = await this.prisma.subscription.findUnique({
      where: { id: subscriptionId },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    // Check if participant already exists
    const existingParticipant = await this.prisma.subscriptionParticipant.findUnique({
      where: {
        subscription_id_user_id: {
          subscription_id: subscriptionId,
          user_id: user_id,
        },
      },
    });

    if (existingParticipant) {
      throw new BadRequestException('User is already a participant in this subscription');
    }

    // Validate share value for custom shares
    if (share_type === ShareType.CUSTOM && (!share_value || share_value <= 0)) {
      throw new BadRequestException('Custom share type requires a positive share_value');
    }

    return this.prisma.subscriptionParticipant.create({
      data: {
        subscription_id: subscriptionId,
        user_id,
        share_type,
        share_value: share_value ? new Decimal(share_value) : null,
        is_active: true,
      },
    });
  }

  async findParticipantsBySubscription(subscriptionId: string): Promise<SubscriptionParticipant[]> {
    return this.prisma.subscriptionParticipant.findMany({
      where: { subscription_id: subscriptionId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async updateParticipant(
    id: string,
    updateData: Partial<Prisma.SubscriptionParticipantUpdateInput>,
  ): Promise<SubscriptionParticipant> {
    return this.prisma.subscriptionParticipant.update({
      where: { id },
      data: updateData,
    });
  }

  async removeParticipant(id: string): Promise<void> {
    await this.prisma.subscriptionParticipant.delete({
      where: { id },
    });
  }

  async calculateShares(
    subscriptionId: string,
    totalAmount: Decimal,
  ): Promise<{ user_id: string; amount: Decimal }[]> {
    const participants = await this.findParticipantsBySubscription(subscriptionId);
    const activeParticipants = participants.filter(p => p.is_active);

    if (activeParticipants.length === 0) {
      return [];
    }

    // Calculate shares based on share type
    const shares: { user_id: string; amount: Decimal }[] = [];

    for (const participant of activeParticipants) {
      let amount: Decimal;

      if (participant.share_type === ShareType.EQUAL) {
        // Equal share: divide total by number of participants
        amount = new Decimal(totalAmount).div(activeParticipants.length);
      } else {
        // Custom share: use the specified share_value
        if (!participant.share_value) {
          throw new BadRequestException(`Participant ${participant.user_id} has custom share type but no share_value`);
        }
        amount = participant.share_value;
      }

      shares.push({
        user_id: participant.user_id,
        amount,
      });
    }

    // Validate that shares sum to total amount (within a small tolerance)
    const totalCalculated = shares.reduce((sum, share) => sum.add(share.amount), new Decimal(0));
    const tolerance = new Decimal(0.01); // 1 cent tolerance

    if (totalCalculated.sub(totalAmount).abs().gt(tolerance)) {
      throw new BadRequestException(
        `Calculated shares (${totalCalculated.toString()}) do not sum to total amount (${totalAmount.toString()})`,
      );
    }

    return shares;
  }
}
