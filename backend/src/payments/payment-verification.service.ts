import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class PaymentVerificationService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Process payment verification and update related charge shares
   */
  async processPaymentVerification(
    paymentId: string,
    verifierId: string,
    verificationReference?: string,
  ): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      // Get the payment with its related data
      const payment = await tx.payment.findUnique({
        where: { id: paymentId },
        include: {
          charge: {
            include: {
              shares: true,
            },
          },
          user: true,
        },
      });

      if (!payment) {
        throw new Error('Payment not found');
      }

      if (payment.status !== 'PENDING') {
        throw new Error('Only pending payments can be verified');
      }

      // Update the payment status
      await tx.payment.update({
        where: { id: paymentId },
        data: {
          status: 'VERIFIED',
          verification_reference: verificationReference,
          verified_at: new Date(),
          verified_by: verifierId,
        },
      });

      // Update charge shares if payment is linked to a charge
      if (payment.charge_id) {
        await this.updateChargeShareSettlement(
          payment.charge_id,
          payment.user_id,
          payment.amount,
          tx,
        );
      }
    });
  }

  /**
   * Revert payment verification and update related charge shares
   */
  async revertPaymentVerification(paymentId: string): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const payment = await tx.payment.findUnique({
        where: { id: paymentId },
        include: {
          charge: {
            include: {
              shares: true,
            },
          },
        },
      });

      if (!payment) {
        throw new Error('Payment not found');
      }

      if (payment.status !== 'VERIFIED') {
        throw new Error('Only verified payments can be reverted');
      }

      // Revert the payment status to pending
      await tx.payment.update({
        where: { id: paymentId },
        data: {
          status: 'PENDING',
          verification_reference: null,
          verified_at: null,
          verified_by: null,
        },
      });

      // Revert charge share balances if payment was linked to a charge
      if (payment.charge_id && payment.verified_at) {
        await this.revertChargeShareSettlement(
          payment.charge_id,
          payment.user_id,
          payment.amount,
          tx,
        );
      }
    });
  }

  private async updateChargeShareSettlement(
    chargeId: string,
    userId: string,
    paymentAmount: Decimal,
    tx: any,
  ): Promise<void> {
    const chargeShare = await tx.chargeShare.findFirst({
      where: {
        charge_id: chargeId,
        user_id: userId,
      },
    });

    if (chargeShare) {
      const newAmountPaid = chargeShare.amount_paid.add(paymentAmount);
      const newStatus = newAmountPaid.gte(chargeShare.amount_due) ? 'SETTLED' : 'OPEN';

      await tx.chargeShare.update({
        where: { id: chargeShare.id },
        data: {
          amount_paid: newAmountPaid,
          status: newStatus,
        },
      });
    }
  }

  private async revertChargeShareSettlement(
    chargeId: string,
    userId: string,
    paymentAmount: Decimal,
    tx: any,
  ): Promise<void> {
    const chargeShare = await tx.chargeShare.findFirst({
      where: {
        charge_id: chargeId,
        user_id: userId,
      },
    });

    if (chargeShare) {
      const newAmountPaid = chargeShare.amount_paid.sub(paymentAmount);
      const newStatus = newAmountPaid.gte(chargeShare.amount_due) ? 'SETTLED' : 'OPEN';

      await tx.chargeShare.update({
        where: { id: chargeShare.id },
        data: {
          amount_paid: newAmountPaid.gte(0) ? newAmountPaid : new Decimal(0),
          status: newAmountPaid.gte(0) ? newStatus : 'OPEN',
        },
      });
    }
  }

  /**
   * Calculate user balance based on charge shares and verified payments
   */
  async calculateUserBalance(userId: string, asOfDate?: Date): Promise<{
    totalDue: Decimal;
    totalPaid: Decimal;
    balance: Decimal;
  }> {
    const whereCondition: any = {
      user_id: userId,
    };

    if (asOfDate) {
      whereCondition.charge = {
        period_end: { lte: asOfDate },
      };
    }

    const chargeShares = await this.prisma.chargeShare.findMany({
      where: whereCondition,
      include: {
        charge: {
          select: {
            period_end: true,
          },
        },
      },
    });

    const totalDue = chargeShares.reduce(
      (sum, share) => sum.add(share.amount_due),
      new Decimal(0),
    );

    const totalPaid = chargeShares.reduce(
      (sum, share) => sum.add(share.amount_paid),
      new Decimal(0),
    );

    return {
      totalDue,
      totalPaid,
      balance: totalDue.sub(totalPaid),
    };
  }
}
