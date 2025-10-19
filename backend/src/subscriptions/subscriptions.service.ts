import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { Subscription, Prisma } from '@prisma/client';
import { SubscriptionParticipantsService } from './subscription-participants.service';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class SubscriptionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly participantsService: SubscriptionParticipantsService,
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
}
