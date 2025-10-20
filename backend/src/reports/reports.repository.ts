import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class ReportsRepository {
  constructor(private prisma: PrismaService) {}

  /**
   * Get all charge shares for a user up to a specific date
   */
  async getChargeSharesForUser(userId: string, asOfDate: Date) {
    return this.prisma.chargeShare.findMany({
      where: {
        user_id: userId,
        charge: {
          period_start: {
            lte: asOfDate,
          },
        },
      },
      include: {
        charge: {
          include: {
            subscription: true,
          },
        },
      },
      orderBy: {
        charge: {
          period_start: 'desc',
        },
      },
    });
  }

  /**
   * Get all verified payments for a user up to a specific date
   */
  async getVerifiedPaymentsForUser(userId: string, asOfDate: Date) {
    return this.prisma.payment.findMany({
      where: {
        user_id: userId,
        status: 'VERIFIED',
        scheduled_date: {
          lte: asOfDate,
        },
      },
      include: {
        charge: {
          include: {
            subscription: true,
          },
        },
      },
      orderBy: {
        scheduled_date: 'desc',
      },
    });
  }

  /**
   * Get all pending payments for a user up to a specific date
   */
  async getPendingPaymentsForUser(userId: string, asOfDate: Date) {
    return this.prisma.payment.findMany({
      where: {
        user_id: userId,
        status: 'PENDING',
        scheduled_date: {
          lte: asOfDate,
        },
      },
      include: {
        charge: {
          include: {
            subscription: true,
          },
        },
      },
      orderBy: {
        scheduled_date: 'desc',
      },
    });
  }

  /**
   * Get all charges for a subscription up to a specific date
   */
  async getChargesForSubscription(subscriptionId: string, asOfDate: Date) {
    return this.prisma.charge.findMany({
      where: {
        subscription_id: subscriptionId,
        period_start: {
          lte: asOfDate,
        },
      },
      include: {
        shares: {
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        period_start: 'desc',
      },
    });
  }

  /**
   * Get all payments for a subscription up to a specific date
   */
  async getPaymentsForSubscription(subscriptionId: string, asOfDate: Date) {
    return this.prisma.payment.findMany({
      where: {
        charge: {
          subscription_id: subscriptionId,
        },
        scheduled_date: {
          lte: asOfDate,
        },
      },
      include: {
        user: true,
        charge: {
          include: {
            subscription: true,
          },
        },
      },
      orderBy: {
        scheduled_date: 'desc',
      },
    });
  }

  /**
   * Get subscription participants
   */
  async getSubscriptionParticipants(subscriptionId: string) {
    return this.prisma.subscriptionParticipant.findMany({
      where: {
        subscription_id: subscriptionId,
        is_active: true,
      },
      include: {
        user: true,
      },
    });
  }
}

