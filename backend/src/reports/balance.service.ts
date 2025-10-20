import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';

export interface UserBalance {
  user_id: string;
  user_name: string;
  user_email: string;
  total_charges: number;
  total_verified_payments: number;
  total_pending_payments: number;
  balance_due: number;
  balance_with_pending: number;
}

export interface SubscriptionBalance {
  subscription_id: string;
  subscription_title: string;
  total_amount: number;
  user_balances: UserBalance[];
  total_charges: number;
  total_verified_payments: number;
  total_pending_payments: number;
  overall_balance_due: number;
}

@Injectable()
export class BalanceService {
  constructor(private prisma: PrismaService) {}

  /**
   * Calculate user balance as of a specific date
   * Includes all charges and verified payments up to the specified date
   */
  async calculateUserBalance(
    userId: string,
    asOfDate?: Date,
  ): Promise<UserBalance> {
    const effectiveDate = asOfDate || new Date();

    // Get user details
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true },
    });

    if (!user) {
      throw new Error(`User not found: ${userId}`);
    }

    // Calculate total charges for this user up to the date
    const chargeShares = await this.prisma.chargeShare.findMany({
      where: {
        user_id: userId,
        charge: {
          period_start: {
            lte: effectiveDate,
          },
        },
      },
      include: {
        charge: true,
      },
    });

    const totalCharges = chargeShares.reduce((sum, share) => {
      return sum + (share.amount_due?.toNumber() || 0);
    }, 0);

    // Calculate total verified payments up to the date
    const verifiedPayments = await this.prisma.payment.findMany({
      where: {
        user_id: userId,
        status: 'VERIFIED',
        scheduled_date: {
          lte: effectiveDate,
        },
      },
    });

    const totalVerifiedPayments = verifiedPayments.reduce((sum, payment) => {
      return sum + (payment.amount?.toNumber() || 0);
    }, 0);

    // Calculate total pending payments
    const pendingPayments = await this.prisma.payment.findMany({
      where: {
        user_id: userId,
        status: 'PENDING',
        scheduled_date: {
          lte: effectiveDate,
        },
      },
    });

    const totalPendingPayments = pendingPayments.reduce((sum, payment) => {
      return sum + (payment.amount?.toNumber() || 0);
    }, 0);

    const balanceDue = totalCharges - totalVerifiedPayments;
    const balanceWithPending = balanceDue - totalPendingPayments;

    return {
      user_id: user.id,
      user_name: user.name,
      user_email: user.email,
      total_charges: totalCharges,
      total_verified_payments: totalVerifiedPayments,
      total_pending_payments: totalPendingPayments,
      balance_due: balanceDue,
      balance_with_pending: balanceWithPending,
    };
  }

  /**
   * Calculate balances for all users in a subscription as of a specific date
   */
  async calculateSubscriptionBalance(
    subscriptionId: string,
    asOfDate?: Date,
  ): Promise<SubscriptionBalance> {
    const effectiveDate = asOfDate || new Date();

    // Get subscription details
    const subscription = await this.prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: {
        participants: {
          where: { is_active: true },
          include: {
            user: true,
          },
        },
      },
    });

    if (!subscription) {
      throw new Error(`Subscription not found: ${subscriptionId}`);
    }

    // Calculate balance for each participant
    const userBalances: UserBalance[] = [];
    let totalCharges = 0;
    let totalVerifiedPayments = 0;
    let totalPendingPayments = 0;

    for (const participant of subscription.participants) {
      const balance = await this.calculateUserBalanceForSubscription(
        participant.user_id,
        subscriptionId,
        effectiveDate,
      );
      userBalances.push(balance);
      totalCharges += balance.total_charges;
      totalVerifiedPayments += balance.total_verified_payments;
      totalPendingPayments += balance.total_pending_payments;
    }

    return {
      subscription_id: subscription.id,
      subscription_title: subscription.title,
      total_amount: subscription.total_amount.toNumber(),
      user_balances: userBalances,
      total_charges: totalCharges,
      total_verified_payments: totalVerifiedPayments,
      total_pending_payments: totalPendingPayments,
      overall_balance_due: totalCharges - totalVerifiedPayments,
    };
  }

  /**
   * Calculate user balance for a specific subscription
   */
  private async calculateUserBalanceForSubscription(
    userId: string,
    subscriptionId: string,
    asOfDate: Date,
  ): Promise<UserBalance> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true },
    });

    if (!user) {
      throw new Error(`User not found: ${userId}`);
    }

    // Get charges for this subscription up to the date
    const chargeShares = await this.prisma.chargeShare.findMany({
      where: {
        user_id: userId,
        charge: {
          subscription_id: subscriptionId,
          period_start: {
            lte: asOfDate,
          },
        },
      },
    });

    const totalCharges = chargeShares.reduce((sum, share) => {
      return sum + (share.amount_due?.toNumber() || 0);
    }, 0);

    // Get verified payments for this subscription
    const verifiedPayments = await this.prisma.payment.findMany({
      where: {
        user_id: userId,
        charge: {
          subscription_id: subscriptionId,
        },
        status: 'VERIFIED',
        scheduled_date: {
          lte: asOfDate,
        },
      },
    });

    const totalVerifiedPayments = verifiedPayments.reduce((sum, payment) => {
      return sum + (payment.amount?.toNumber() || 0);
    }, 0);

    // Get pending payments for this subscription
    const pendingPayments = await this.prisma.payment.findMany({
      where: {
        user_id: userId,
        charge: {
          subscription_id: subscriptionId,
        },
        status: 'PENDING',
        scheduled_date: {
          lte: asOfDate,
        },
      },
    });

    const totalPendingPayments = pendingPayments.reduce((sum, payment) => {
      return sum + (payment.amount?.toNumber() || 0);
    }, 0);

    const balanceDue = totalCharges - totalVerifiedPayments;
    const balanceWithPending = balanceDue - totalPendingPayments;

    return {
      user_id: user.id,
      user_name: user.name,
      user_email: user.email,
      total_charges: totalCharges,
      total_verified_payments: totalVerifiedPayments,
      total_pending_payments: totalPendingPayments,
      balance_due: balanceDue,
      balance_with_pending: balanceWithPending,
    };
  }

  /**
   * Get all balances for all users across all subscriptions
   */
  async calculateAllBalances(asOfDate?: Date): Promise<UserBalance[]> {
    const effectiveDate = asOfDate || new Date();

    const users = await this.prisma.user.findMany({
      where: { is_active: true },
    });

    const balances: UserBalance[] = [];

    for (const user of users) {
      const balance = await this.calculateUserBalance(user.id, effectiveDate);
      balances.push(balance);
    }

    return balances;
  }
}

