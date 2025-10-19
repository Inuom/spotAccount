import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { PaymentVerificationService } from './payment-verification.service';
import { PaymentStatus } from '@prisma/client';

@Injectable()
export class PaymentWorkflowService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly paymentVerificationService: PaymentVerificationService,
  ) {}

  /**
   * Process the complete payment verification workflow
   */
  async processPaymentWorkflow(
    paymentId: string,
    verifierId: string,
    verificationReference?: string,
  ): Promise<void> {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        charge: {
          include: {
            subscription: {
              select: { id: true, title: true },
            },
          },
        },
      },
    });

    if (!payment) {
      throw new Error('Payment not found');
    }

    if (payment.status !== PaymentStatus.PENDING) {
      throw new Error('Only pending payments can be processed');
    }

    // Step 1: Verify the payment
    await this.paymentVerificationService.processPaymentVerification(
      paymentId,
      verifierId,
      verificationReference,
    );

    // Step 2: Log the workflow action
    await this.logWorkflowAction(paymentId, 'VERIFIED', verifierId, {
      verificationReference,
      paymentAmount: payment.amount.toString(),
      userEmail: payment.user.email,
      chargeId: payment.charge_id,
    });

    // Step 3: Check if charge is fully settled (optional notification trigger)
    if (payment.charge_id) {
      await this.checkChargeSettlementStatus(payment.charge_id);
    }
  }

  /**
   * Cancel payment workflow
   */
  async cancelPaymentWorkflow(paymentId: string, cancellerId: string, reason?: string): Promise<void> {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new Error('Payment not found');
    }

    if (payment.status !== PaymentStatus.PENDING) {
      throw new Error('Only pending payments can be cancelled');
    }

    // Update payment status to cancelled
    await this.prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: PaymentStatus.CANCELLED,
        verification_reference: reason || 'Cancelled by user',
      },
    });

    // Log the workflow action
    await this.logWorkflowAction(paymentId, 'CANCELLED', cancellerId, {
      reason,
    });
  }

  private async logWorkflowAction(
    paymentId: string,
    action: string,
    userId: string,
    metadata?: any,
  ): Promise<void> {
    // This would ideally use a proper audit/logging service
    // For now, we'll just ensure the payment has proper timestamps
    console.log(`Payment ${paymentId} ${action} by user ${userId}`, metadata);
  }

  private async checkChargeSettlementStatus(chargeId: string): Promise<void> {
    const chargeShares = await this.prisma.chargeShare.findMany({
      where: { charge_id: chargeId },
    });

    const allSettled = chargeShares.every(
      share => share.status === 'SETTLED' || share.amount_paid.gte(share.amount_due),
    );

    if (allSettled) {
      console.log(`Charge ${chargeId} is fully settled`);
      // Here you could trigger notifications or other business logic
    }
  }

  /**
   * Get payment workflow history (simplified version)
   */
  async getPaymentWorkflowHistory(paymentId: string): Promise<{
    status: PaymentStatus;
    createdAt: Date;
    verifiedAt?: Date;
    updatedAt: Date;
    verificationReference?: string;
  }> {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      select: {
        status: true,
        created_at: true,
        verified_at: true,
        updated_at: true,
        verification_reference: true,
      },
    });

    if (!payment) {
      throw new Error('Payment not found');
    }

    return {
      status: payment.status,
      createdAt: payment.created_at,
      verifiedAt: payment.verified_at || undefined,
      updatedAt: payment.updated_at,
      verificationReference: payment.verification_reference || undefined,
    };
  }
}
