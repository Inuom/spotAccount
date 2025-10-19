import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { AddParticipantDto } from './dto/add-participant.dto';
import { Subscription, Prisma, ShareType } from '@prisma/client';
import { SubscriptionParticipantsService } from './subscription-participants.service';
import { ShareCalculationService } from './share-calculation.service';
import { ParticipantValidationService } from './participant-validation.service';
import { SubscriptionAuditService } from './subscription-audit.service';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class SubscriptionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly participantsService: SubscriptionParticipantsService,
    private readonly shareCalculationService: ShareCalculationService,
    private readonly participantValidationService: ParticipantValidationService,
    private readonly subscriptionAuditService: SubscriptionAuditService,
  ) {}

  async create(createSubscriptionDto: CreateSubscriptionDto, ownerId: string): Promise<Subscription> {
    const { title, total_amount, billing_day, frequency, start_date, end_date, participants } = createSubscriptionDto;

    // Validate participants
    if (!participants || participants.length === 0) {
      throw new BadRequestException('Subscription must have at least one participant');
    }

    // Validate share values sum to total amount for custom shares
    const customParticipants = participants.filter(p => p.share_type === 'CUSTOM');
    if (customParticipants.length > 0) {
      const customTotal = customParticipants.reduce((sum, p) => sum + (p.share_value || 0), 0);
      if (Math.abs(customTotal - total_amount) > 0.01) {
        throw new BadRequestException('Custom share values must sum to total amount');
      }
    }

    // Create subscription and participants in a transaction
    return this.prisma.$transaction(async (tx) => {
      // Create subscription
      const subscription = await tx.subscription.create({
        data: {
          title,
          total_amount: new Decimal(total_amount),
          billing_day,
          frequency: frequency || 'monthly',
          owner_id: ownerId,
          start_date: start_date ? new Date(start_date) : new Date(),
          end_date: end_date ? new Date(end_date) : null,
          is_active: true,
        },
      });

      // Create participants
      for (const participantDto of participants) {
        await tx.subscriptionParticipant.create({
          data: {
            subscription_id: subscription.id,
            user_id: participantDto.user_id,
            share_type: participantDto.share_type,
            share_value: participantDto.share_value ? new Decimal(participantDto.share_value) : null,
            is_active: true,
          },
        });
      }

      return subscription;
    });
  }

  async findAll(): Promise<Subscription[]> {
    return this.prisma.subscription.findMany({
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async findOne(id: string): Promise<Subscription | null> {
    return this.prisma.subscription.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        charges: {
          include: {
            shares: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
          orderBy: { created_at: 'desc' },
        },
      },
    });
  }

  async update(id: string, updateSubscriptionDto: UpdateSubscriptionDto, userId: string): Promise<Subscription> {
    const subscription = await this.findOne(id);
    
    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    // Only owner can update subscription
    if (subscription.owner_id !== userId) {
      throw new ForbiddenException('You can only update subscriptions you own');
    }

    return this.prisma.subscription.update({
      where: { id },
      data: {
        ...updateSubscriptionDto,
        total_amount: updateSubscriptionDto.total_amount ? new Decimal(updateSubscriptionDto.total_amount) : undefined,
      },
    });
  }

  async remove(id: string, userId: string): Promise<void> {
    const subscription = await this.findOne(id);
    
    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    // Only owner can delete subscription
    if (subscription.owner_id !== userId) {
      throw new ForbiddenException('You can only delete subscriptions you own');
    }

    await this.prisma.subscription.delete({
      where: { id },
    });
  }

  async findUserSubscriptions(userId: string): Promise<Subscription[]> {
    return this.prisma.subscription.findMany({
      where: {
        OR: [
          { owner_id: userId },
          {
            participants: {
              some: {
                user_id: userId,
                is_active: true,
              },
            },
          },
        ],
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async addParticipant(
    subscriptionId: string,
    addParticipantDto: AddParticipantDto,
    adminUserId: string,
  ): Promise<Subscription> {
    // Validate the subscription exists and user has permission (already handled by controller guards)
    const subscription = await this.findOne(subscriptionId);
    
    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    // Only subscription owner can add participants (admin check is in controller)
    if (subscription.owner_id !== adminUserId) {
      throw new ForbiddenException('You can only add participants to subscriptions you own');
    }

    // Validate the add participant request
    await this.participantValidationService.validateAddParticipantDto(
      subscriptionId,
      addParticipantDto,
    );

    // Validate share balance if custom share
    await this.participantValidationService.validateShareBalance(
      subscriptionId,
      addParticipantDto,
    );

    // Add participant in a transaction with increased timeout
    return this.prisma.$transaction(async (tx) => {
      // Create the new participant
      const newParticipant = await tx.subscriptionParticipant.create({
        data: {
          subscription_id: subscriptionId,
          user_id: addParticipantDto.user_id,
          share_type: addParticipantDto.share_type,
          share_value: addParticipantDto.share_value ? new Decimal(addParticipantDto.share_value) : null,
          is_active: true,
        },
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

      // Get existing participants to check if we need to recalculate shares
      const existingParticipants = await tx.subscriptionParticipant.findMany({
        where: {
          subscription_id: subscriptionId,
          is_active: true,
        },
      });

      const hasEqualShareParticipants = existingParticipants.some(
        p => p.share_type === 'EQUAL' || addParticipantDto.share_type === 'EQUAL',
      );

      // Recalculate equal shares directly in the transaction if needed
      if (hasEqualShareParticipants) {
        const allActiveParticipants = await tx.subscriptionParticipant.findMany({
          where: {
            subscription_id: subscriptionId,
            is_active: true,
          },
        });

        // Get subscription total amount
        const subscription = await tx.subscription.findUnique({
          where: { id: subscriptionId },
        });

        if (subscription && allActiveParticipants.length > 0) {
          const equalShareAmount = subscription.total_amount.div(allActiveParticipants.length);

          // Update all participants with EQUAL share type
          await tx.subscriptionParticipant.updateMany({
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
      }

      return newParticipant;
    }, {
      timeout: 10000, // Increase timeout to 10 seconds
    }).then(async (newParticipant) => {
      // Perform audit logging outside the transaction
      await this.subscriptionAuditService.logParticipantAddition(
        subscriptionId,
        newParticipant.id,
        adminUserId,
        addParticipantDto,
      );

      // Log share recalculation if it occurred
      const existingParticipants = await this.prisma.subscriptionParticipant.findMany({
        where: {
          subscription_id: subscriptionId,
          is_active: true,
        },
      });

      const hasEqualShareParticipants = existingParticipants.some(
        p => p.share_type === 'EQUAL' || addParticipantDto.share_type === 'EQUAL',
      );

      if (hasEqualShareParticipants) {
        await this.subscriptionAuditService.logShareRecalculation(
          subscriptionId,
          adminUserId,
          'New participant added with equal share type',
        );
      }

      // Return the updated subscription with all participants
      const updatedSubscription = await this.findOne(subscriptionId);
      if (!updatedSubscription) {
        throw new NotFoundException('Subscription not found after participant addition');
      }
      return updatedSubscription;
    });
  }
}
