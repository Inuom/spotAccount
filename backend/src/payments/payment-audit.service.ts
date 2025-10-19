import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class PaymentAuditService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Log payment actions for audit trail
   */
  async logPaymentAction(params: {
    paymentId: string;
    action: string;
    userId: string;
    details?: any;
  }): Promise<void> {
    const { paymentId, action, userId, details } = params;

    // In a production system, this would write to a dedicated audit table
    // For now, we'll use console logging as a placeholder
    console.log(`PAYMENT_AUDIT: ${action}`, {
      paymentId,
      userId,
      timestamp: new Date().toISOString(),
      details,
    });

    // You could also store this in a dedicated audit table:
    // await this.prisma.paymentAudit.create({
    //   data: {
    //     payment_id: paymentId,
    //     action,
    //     user_id: userId,
    //     details: details ? JSON.stringify(details) : null,
    //     created_at: new Date(),
    //   },
    // });
  }

  /**
   * Get payment audit trail
   */
  async getPaymentAuditTrail(paymentId: string): Promise<{
    paymentId: string;
    actions: Array<{
      action: string;
      userId: string;
      timestamp: Date;
      details?: any;
    }>;
  }> {
    // In a production system, this would query the audit table
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      select: {
        id: true,
        created_at: true,
        updated_at: true,
        verified_at: true,
        created_by: true,
        verified_by: true,
        verification_reference: true,
        status: true,
      },
    });

    if (!payment) {
      throw new Error('Payment not found');
    }

    const actions = [];

    // Add creation action
    actions.push({
      action: 'CREATED',
      userId: payment.created_by,
      timestamp: payment.created_at,
      details: { status: payment.status },
    });

    // Add verification action if verified
    if (payment.verified_at && payment.verified_by) {
      actions.push({
        action: 'VERIFIED',
        userId: payment.verified_by,
        timestamp: payment.verified_at,
        details: {
          verificationReference: payment.verification_reference,
        },
      });
    }

    // Add update action if updated after creation
    if (payment.updated_at && payment.updated_at.getTime() !== payment.created_at.getTime()) {
      actions.push({
        action: 'UPDATED',
        userId: payment.verified_by || payment.created_by, // Best guess
        timestamp: payment.updated_at,
        details: { status: payment.status },
      });
    }

    return {
      paymentId: payment.id,
      actions: actions.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime()),
    };
  }

  /**
   * Get user payment audit summary
   */
  async getUserPaymentAuditSummary(userId: string): Promise<{
    totalPayments: number;
    pendingPayments: number;
    verifiedPayments: number;
    cancelledPayments: number;
    totalAmount: number;
    verifiedAmount: number;
  }> {
    const payments = await this.prisma.payment.findMany({
      where: { user_id: userId },
      select: {
        status: true,
        amount: true,
      },
    });

    const summary = {
      totalPayments: payments.length,
      pendingPayments: payments.filter(p => p.status === 'PENDING').length,
      verifiedPayments: payments.filter(p => p.status === 'VERIFIED').length,
      cancelledPayments: payments.filter(p => p.status === 'CANCELLED').length,
      totalAmount: 0,
      verifiedAmount: 0,
    };

    payments.forEach(payment => {
      const amount = Number(payment.amount);
      summary.totalAmount += amount;
      
      if (payment.status === 'VERIFIED') {
        summary.verifiedAmount += amount;
      }
    });

    return summary;
  }
}
