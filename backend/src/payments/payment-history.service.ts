import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { PaymentStatus } from '@prisma/client';

@Injectable()
export class PaymentHistoryService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get payment history for a user with filtering and pagination
   */
  async getUserPaymentHistory(params: {
    userId: string;
    status?: PaymentStatus;
    fromDate?: Date;
    toDate?: Date;
    limit?: number;
    offset?: number;
  }) {
    const { userId, status, fromDate, toDate, limit = 20, offset = 0 } = params;

    const whereClause: any = {
      user_id: userId,
    };

    if (status) {
      whereClause.status = status;
    }

    if (fromDate || toDate) {
      whereClause.scheduled_date = {};
      if (fromDate) {
        whereClause.scheduled_date.gte = fromDate;
      }
      if (toDate) {
        whereClause.scheduled_date.lte = toDate;
      }
    }

    const [payments, total] = await Promise.all([
      this.prisma.payment.findMany({
        where: whereClause,
        include: {
          charge: {
            include: {
              subscription: {
                select: {
                  id: true,
                  title: true,
                },
              },
            },
          },
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          verifier: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { created_at: 'desc' },
        take: limit,
        skip: offset,
      }),
      this.prisma.payment.count({ where: whereClause }),
    ]);

    return {
      payments,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    };
  }

  /**
   * Get payment statistics for a user
   */
  async getUserPaymentStats(userId: string, fromDate?: Date, toDate?: Date) {
    const whereClause: any = {
      user_id: userId,
    };

    if (fromDate || toDate) {
      whereClause.scheduled_date = {};
      if (fromDate) {
        whereClause.scheduled_date.gte = fromDate;
      }
      if (toDate) {
        whereClause.scheduled_date.lte = toDate;
      }
    }

    const payments = await this.prisma.payment.findMany({
      where: whereClause,
      select: {
        status: true,
        amount: true,
        scheduled_date: true,
      },
    });

    const stats = {
      total: payments.length,
      pending: 0,
      verified: 0,
      cancelled: 0,
      totalAmount: 0,
      verifiedAmount: 0,
      pendingAmount: 0,
      cancelledAmount: 0,
    };

    payments.forEach(payment => {
      const amount = Number(payment.amount);
      stats.totalAmount += amount;

      switch (payment.status) {
        case PaymentStatus.PENDING:
          stats.pending++;
          stats.pendingAmount += amount;
          break;
        case PaymentStatus.VERIFIED:
          stats.verified++;
          stats.verifiedAmount += amount;
          break;
        case PaymentStatus.CANCELLED:
          stats.cancelled++;
          stats.cancelledAmount += amount;
          break;
      }
    });

    return stats;
  }

  /**
   * Get payment history for a specific charge
   */
  async getChargePaymentHistory(chargeId: string) {
    const payments = await this.prisma.payment.findMany({
      where: { charge_id: chargeId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        verifier: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    return payments;
  }

  /**
   * Get payment trends over time for analytics
   */
  async getPaymentTrends(params: {
    userId?: string;
    fromDate: Date;
    toDate: Date;
    groupBy: 'day' | 'week' | 'month';
  }) {
    const { userId, fromDate, toDate, groupBy } = params;

    const whereClause: any = {
      scheduled_date: {
        gte: fromDate,
        lte: toDate,
      },
    };

    if (userId) {
      whereClause.user_id = userId;
    }

    const payments = await this.prisma.payment.findMany({
      where: whereClause,
      select: {
        status: true,
        amount: true,
        scheduled_date: true,
      },
      orderBy: { scheduled_date: 'asc' },
    });

    // Group payments by time period
    const trends: { [key: string]: { total: number; verified: number; pending: number; cancelled: number } } = {};

    payments.forEach(payment => {
      const date = new Date(payment.scheduled_date);
      let key: string;

      switch (groupBy) {
        case 'day':
          key = date.toISOString().split('T')[0];
          break;
        case 'week':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = weekStart.toISOString().split('T')[0];
          break;
        case 'month':
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
        default:
          key = date.toISOString().split('T')[0];
      }

      if (!trends[key]) {
        trends[key] = { total: 0, verified: 0, pending: 0, cancelled: 0 };
      }

      trends[key].total++;
      
      switch (payment.status) {
        case PaymentStatus.PENDING:
          trends[key].pending++;
          break;
        case PaymentStatus.VERIFIED:
          trends[key].verified++;
          break;
        case PaymentStatus.CANCELLED:
          trends[key].cancelled++;
          break;
      }
    });

    return Object.entries(trends).map(([period, data]) => ({
      period,
      ...data,
    }));
  }
}
