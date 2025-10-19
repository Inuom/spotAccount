import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { Charge, Prisma } from '@prisma/client';

@Injectable()
export class ChargesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.ChargeCreateInput): Promise<Charge> {
    return this.prisma.charge.create({ data });
  }

  async findMany(where?: Prisma.ChargeWhereInput): Promise<Charge[]> {
    return this.prisma.charge.findMany({ where });
  }

  async findUnique(where: Prisma.ChargeWhereUniqueInput): Promise<Charge | null> {
    return this.prisma.charge.findUnique({ where });
  }

  async findFirst(where: Prisma.ChargeWhereInput): Promise<Charge | null> {
    return this.prisma.charge.findFirst({ where });
  }

  async update(params: {
    where: Prisma.ChargeWhereUniqueInput;
    data: Prisma.ChargeUpdateInput;
  }): Promise<Charge> {
    const { where, data } = params;
    return this.prisma.charge.update({ where, data });
  }

  async delete(where: Prisma.ChargeWhereUniqueInput): Promise<Charge> {
    return this.prisma.charge.delete({ where });
  }

  async count(where?: Prisma.ChargeWhereInput): Promise<number> {
    return this.prisma.charge.count({ where });
  }

  async findManyWithPagination(params: {
    skip?: number;
    take?: number;
    where?: Prisma.ChargeWhereInput;
    orderBy?: Prisma.ChargeOrderByWithRelationInput;
  }): Promise<{ charges: Charge[]; total: number }> {
    const { skip, take, where, orderBy } = params;

    const [charges, total] = await Promise.all([
      this.prisma.charge.findMany({
        skip,
        take,
        where,
        orderBy,
        include: {
          subscription: {
            select: {
              id: true,
              title: true,
            },
          },
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
      }),
      this.prisma.charge.count({ where }),
    ]);

    return { charges, total };
  }

  async findChargesBySubscription(subscriptionId: string): Promise<Charge[]> {
    return this.prisma.charge.findMany({
      where: { subscription_id: subscriptionId },
      include: {
        subscription: {
          select: {
            id: true,
            title: true,
          },
        },
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
      orderBy: { period_start: 'desc' },
    });
  }

  async findChargesByPeriod(startDate: Date, endDate: Date, subscriptionId?: string): Promise<Charge[]> {
    const where: Prisma.ChargeWhereInput = {
      AND: [
        { period_start: { lte: endDate } },
        { period_end: { gte: startDate } },
      ],
    };

    if (subscriptionId) {
      where.subscription_id = subscriptionId;
    }

    return this.prisma.charge.findMany({
      where,
      include: {
        subscription: {
          select: {
            id: true,
            title: true,
          },
        },
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
      orderBy: { period_start: 'asc' },
    });
  }

  async findLastChargeBySubscription(subscriptionId: string): Promise<Charge | null> {
    return this.prisma.charge.findFirst({
      where: { subscription_id: subscriptionId },
      orderBy: { period_end: 'desc' },
    });
  }
}
