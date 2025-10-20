import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { Payment, PaymentStatus, Prisma } from '@prisma/client';

@Injectable()
export class UserPaymentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getUserPayments(
    userId: string,
    params?: {
      status?: PaymentStatus;
      skip?: number;
      take?: number;
      orderBy?: Prisma.PaymentOrderByWithRelationInput;
    },
  ): Promise<Payment[]> {
    const { status, skip, take, orderBy = { created_at: 'desc' } } = params || {};
    
    return this.prisma.payment.findMany({
      where: {
        user_id: userId,
        ...(status && { status }),
      },
      skip,
      take,
      orderBy,
      include: {
        user: true,
        charge: {
          include: {
            subscription: true,
          },
        },
        creator: true,
        verifier: true,
      },
    });
  }

  async getPendingUserPayments(userId: string): Promise<Payment[]> {
    return this.getUserPayments(userId, { status: PaymentStatus.PENDING });
  }

  async getUserPaymentHistory(
    userId: string,
    limit: number = 50,
  ): Promise<Payment[]> {
    return this.getUserPayments(userId, {
      take: limit,
      orderBy: { updated_at: 'desc' },
    });
  }

  async getUserPaymentStats(userId: string): Promise<{
    totalPayments: number;
    pendingPayments: number;
    verifiedPayments: number;
    cancelledPayments: number;
    totalAmount: number;
  }> {
    const [totalPayments, pendingPayments, verifiedPayments, cancelledPayments] = await Promise.all([
      this.prisma.payment.count({ where: { user_id: userId } }),
      this.prisma.payment.count({ where: { user_id: userId, status: PaymentStatus.PENDING } }),
      this.prisma.payment.count({ where: { user_id: userId, status: PaymentStatus.VERIFIED } }),
      this.prisma.payment.count({ where: { user_id: userId, status: PaymentStatus.CANCELLED } }),
    ]);

    const amountResult = await this.prisma.payment.aggregate({
      where: { user_id: userId },
      _sum: { amount: true },
    });

    return {
      totalPayments,
      pendingPayments,
      verifiedPayments,
      cancelledPayments,
      totalAmount: Number(amountResult._sum.amount || 0),
    };
  }

  async checkUserPaymentConflict(
    userId: string,
    scheduledDate: Date,
    excludePaymentId?: string,
  ): Promise<boolean> {
    const count = await this.prisma.payment.count({
      where: {
        user_id: userId,
        scheduled_date: scheduledDate,
        status: PaymentStatus.PENDING,
        ...(excludePaymentId && { id: { not: excludePaymentId } }),
      },
    });

    return count > 0;
  }
}
