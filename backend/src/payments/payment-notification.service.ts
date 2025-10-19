import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class PaymentNotificationService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Send notification when payment is created
   */
  async notifyPaymentCreated(paymentId: string): Promise<void> {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        user: { select: { id: true, name: true, email: true } },
        creator: { select: { id: true, name: true, email: true } },
        charge: {
          include: {
            subscription: { select: { id: true, title: true } },
          },
        },
      },
    });

    if (!payment) {
      throw new Error('Payment not found');
    }

    // In a production system, this would integrate with email/SMS services
    console.log(`NOTIFICATION: Payment created`, {
      paymentId,
      userEmail: payment.user.email,
      amount: payment.amount.toString(),
      scheduledDate: payment.scheduled_date,
      subscription: payment.charge?.subscription?.title,
    });

    // Example notification logic:
    // await this.emailService.sendPaymentCreated({
    //   to: payment.user.email,
    //   amount: payment.amount,
    //   scheduledDate: payment.scheduled_date,
    //   subscriptionName: payment.charge?.subscription?.title,
    // });
  }

  /**
   * Send notification when payment is verified
   */
  async notifyPaymentVerified(paymentId: string, verifierId: string): Promise<void> {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        user: { select: { id: true, name: true, email: true } },
        verifier: { select: { id: true, name: true, email: true } },
        charge: {
          include: {
            subscription: { select: { id: true, title: true } },
          },
        },
      },
    });

    if (!payment) {
      throw new Error('Payment not found');
    }

    console.log(`NOTIFICATION: Payment verified`, {
      paymentId,
      userEmail: payment.user.email,
      verifierEmail: payment.verifier?.email,
      amount: payment.amount.toString(),
      verificationReference: payment.verification_reference,
    });

    // Example notification logic:
    // await this.emailService.sendPaymentVerified({
    //   to: payment.user.email,
    //   amount: payment.amount,
    //   verifierName: payment.verifier?.name,
    //   verificationReference: payment.verification_reference,
    // });
  }

  /**
   * Send notification for pending payments that need verification
   */
  async notifyPendingPayments(): Promise<void> {
    const pendingPayments = await this.prisma.payment.findMany({
      where: { status: 'PENDING' },
      include: {
        user: { select: { id: true, name: true, email: true } },
        charge: {
          include: {
            subscription: { select: { id: true, title: true } },
          },
        },
      },
      orderBy: { created_at: 'asc' },
    });

    if (pendingPayments.length > 0) {
      console.log(`NOTIFICATION: ${pendingPayments.length} payments pending verification`);
      
      // Get admin users for notification
      const admins = await this.prisma.user.findMany({
        where: { role: 'ADMIN' },
        select: { id: true, name: true, email: true },
      });

      // In a production system, notify admins about pending payments
      admins.forEach(admin => {
        console.log(`Admin ${admin.email} notified about pending payments`);
      });
    }
  }

  /**
   * Send notification when payment is cancelled
   */
  async notifyPaymentCancelled(paymentId: string, reason?: string): Promise<void> {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        user: { select: { id: true, name: true, email: true } },
        charge: {
          include: {
            subscription: { select: { id: true, title: true } },
          },
        },
      },
    });

    if (!payment) {
      throw new Error('Payment not found');
    }

    console.log(`NOTIFICATION: Payment cancelled`, {
      paymentId,
      userEmail: payment.user.email,
      amount: payment.amount.toString(),
      reason,
    });
  }
}
