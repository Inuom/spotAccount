import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { Subscription, Prisma } from '@prisma/client';

@Injectable()
export class SubscriptionsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.SubscriptionCreateInput): Promise<Subscription> {
    return this.prisma.subscription.create({ data });
  }

  async findMany(where?: Prisma.SubscriptionWhereInput): Promise<Subscription[]> {
    return this.prisma.subscription.findMany({ where });
  }

  async findUnique(where: Prisma.SubscriptionWhereUniqueInput): Promise<Subscription | null> {
    return this.prisma.subscription.findUnique({ where });
  }

  async findFirst(where: Prisma.SubscriptionWhereInput): Promise<Subscription | null> {
    return this.prisma.subscription.findFirst({ where });
  }

  async update(params: {
    where: Prisma.SubscriptionWhereUniqueInput;
    data: Prisma.SubscriptionUpdateInput;
  }): Promise<Subscription> {
    const { where, data } = params;
    return this.prisma.subscription.update({ where, data });
  }

  async delete(where: Prisma.SubscriptionWhereUniqueInput): Promise<Subscription> {
    return this.prisma.subscription.delete({ where });
  }

  async count(where?: Prisma.SubscriptionWhereInput): Promise<number> {
    return this.prisma.subscription.count({ where });
  }

  async findManyWithPagination(params: {
    skip?: number;
    take?: number;
    where?: Prisma.SubscriptionWhereInput;
    orderBy?: Prisma.SubscriptionOrderByWithRelationInput;
  }): Promise<{ subscriptions: Subscription[]; total: number }> {
    const { skip, take, where, orderBy } = params;

    const [subscriptions, total] = await Promise.all([
      this.prisma.subscription.findMany({
        skip,
        take,
        where,
        orderBy,
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
      }),
      this.prisma.subscription.count({ where }),
    ]);

    return { subscriptions, total };
  }

  async findSubscriptionsByOwner(ownerId: string): Promise<Subscription[]> {
    return this.prisma.subscription.findMany({
      where: { owner_id: ownerId },
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

  async findSubscriptionsByParticipant(userId: string): Promise<Subscription[]> {
    return this.prisma.subscription.findMany({
      where: {
        participants: {
          some: {
            user_id: userId,
            is_active: true,
          },
        },
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
