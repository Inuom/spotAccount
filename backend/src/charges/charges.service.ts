import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateChargeDto } from './dto/create-charge.dto';
import { Charge, ChargeStatus, Prisma, ShareType } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class ChargesService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async create(createChargeDto: CreateChargeDto): Promise<Charge> {
    const { subscription_id, period_start, period_end, amount_total, status } = createChargeDto;

    // Check if subscription exists
    const subscription = await this.prisma.subscription.findUnique({
      where: { id: subscription_id },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    // Check for overlapping charges
    const overlappingCharge = await this.prisma.charge.findFirst({
      where: {
        subscription_id,
        OR: [
          {
            AND: [
              { period_start: { lte: new Date(period_start) } },
              { period_end: { gte: new Date(period_start) } },
            ],
          },
          {
            AND: [
              { period_start: { lte: new Date(period_end) } },
              { period_end: { gte: new Date(period_end) } },
            ],
          },
          {
            AND: [
              { period_start: { gte: new Date(period_start) } },
              { period_end: { lte: new Date(period_end) } },
            ],
          },
        ],
      },
    });

    if (overlappingCharge) {
      throw new BadRequestException('Charge period overlaps with existing charge');
    }

    // Create charge in a transaction
    return this.prisma.$transaction(async (tx) => {
      // Create the charge
      const charge = await tx.charge.create({
        data: {
          subscription_id,
          period_start: new Date(period_start),
          period_end: new Date(period_end),
          amount_total: new Decimal(amount_total),
          status: status || ChargeStatus.PENDING,
        },
      });

      // Generate charge shares based on subscription participants
      await this.generateChargeShares(charge.id, subscription_id, new Decimal(amount_total), tx);

      return charge;
    });
  }

  async generateChargeShares(
    chargeId: string,
    subscriptionId: string,
    totalAmount: Decimal,
    tx?: Prisma.TransactionClient,
  ): Promise<void> {
    const prisma = tx || this.prisma;

    // Get subscription participants
    const participants = await prisma.subscriptionParticipant.findMany({
      where: { 
        subscription_id: subscriptionId,
        is_active: true,
      },
    });

    if (participants.length === 0) {
      return;
    }

    // Calculate shares based on share type
    const shares: { user_id: string; amount: Decimal }[] = [];

    for (const participant of participants) {
      let amount: Decimal;

      if (participant.share_type === ShareType.EQUAL) {
        // Equal share: divide total by number of participants
        amount = new Decimal(totalAmount).div(participants.length);
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

    // Create charge shares
    for (const share of shares) {
      await prisma.chargeShare.create({
        data: {
          charge_id: chargeId,
          user_id: share.user_id,
          amount_due: share.amount,
          amount_paid: new Decimal(0),
          status: 'OPEN',
        },
      });
    }
  }

  async generateChargesForSubscription(
    subscriptionId: string,
    untilDate: Date,
  ): Promise<Charge[]> {
    const subscription = await this.prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: { participants: { where: { is_active: true } } },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    if (subscription.participants.length === 0) {
      throw new BadRequestException('Subscription has no active participants');
    }

    // Get the last charge to determine where to start generating from
    const lastCharge = await this.prisma.charge.findFirst({
      where: { subscription_id: subscriptionId },
      orderBy: { period_end: 'desc' },
    });

    const startDate = lastCharge
      ? new Date(lastCharge.period_end.getTime() + 24 * 60 * 60 * 1000) // Day after last period
      : subscription.start_date;

    // Generate charges month by month
    const charges: Charge[] = [];
    let currentDate = new Date(startDate);

    while (currentDate <= untilDate) {
      // Calculate period start and end for this month
      const periodStart = new Date(currentDate);
      periodStart.setDate(subscription.billing_day);
      
      const periodEnd = new Date(periodStart);
      periodEnd.setMonth(periodEnd.getMonth() + 1);
      periodEnd.setDate(0); // Last day of the month

      // Only generate if period end is before or equal to untilDate
      if (periodEnd <= untilDate) {
        try {
          const charge = await this.create({
            subscription_id: subscriptionId,
            period_start: periodStart.toISOString(),
            period_end: periodEnd.toISOString(),
            amount_total: subscription.total_amount.toNumber(),
            status: ChargeStatus.GENERATED,
          });
          charges.push(charge);
        } catch (error) {
          // Skip if charge already exists
          if (!error.message?.includes('overlaps')) {
            throw error;
          }
        }
      }

      // Move to next month
      currentDate = new Date(currentDate);
      currentDate.setMonth(currentDate.getMonth() + 1);
      currentDate.setDate(subscription.billing_day);
    }

    return charges;
  }

  async findAll(
    subscriptionId?: string,
    date?: string,
  ): Promise<Charge[]> {
    const where: Prisma.ChargeWhereInput = {};

    if (subscriptionId) {
      where.subscription_id = subscriptionId;
    }

    if (date) {
      const targetDate = new Date(date);
      where.AND = [
        { period_start: { lte: targetDate } },
        { period_end: { gte: targetDate } },
      ];
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
      orderBy: { created_at: 'desc' },
    });
  }

  async findOne(id: string): Promise<Charge | null> {
    return this.prisma.charge.findUnique({
      where: { id },
      include: {
        subscription: {
          include: {
            owner: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
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
    });
  }

  async getChargeShares(chargeId: string) {
    return this.prisma.chargeShare.findMany({
      where: { charge_id: chargeId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        charge: {
          select: {
            id: true,
            amount_total: true,
            period_start: true,
            period_end: true,
          },
        },
      },
      orderBy: { created_at: 'asc' },
    });
  }
}
