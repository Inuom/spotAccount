import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { PaymentsRepository } from './payments.repository';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { VerifyPaymentDto } from './dto/verify-payment.dto';
import { Payment, PaymentStatus, Prisma } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly paymentsRepository: PaymentsRepository,
  ) {}

  async create(createPaymentDto: CreatePaymentDto, creatorId: string): Promise<Payment> {
    const { user_id, charge_id, amount, currency, scheduled_date } = createPaymentDto;

    // Verify user exists
    const user = await this.prisma.user.findUnique({
      where: { id: user_id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify charge exists if provided
    if (charge_id) {
      const charge = await this.prisma.charge.findUnique({
        where: { id: charge_id },
      });

      if (!charge) {
        throw new NotFoundException('Charge not found');
      }
    }

    // Validate amount is positive
    if (amount <= 0) {
      throw new BadRequestException('Payment amount must be positive');
    }

    return this.paymentsRepository.create({
      user: { connect: { id: user_id } },
      charge: charge_id ? { connect: { id: charge_id } } : undefined,
      amount: new Decimal(amount),
      currency: currency || 'EUR',
      scheduled_date: new Date(scheduled_date),
      created_by: creatorId,
      status: PaymentStatus.PENDING,
    });
  }

  async findAll(params?: {
    status?: PaymentStatus;
    user_id?: string;
    charge_id?: string;
  }): Promise<Payment[]> {
    return this.paymentsRepository.findMany(params);
  }

  async findOne(id: string): Promise<Payment> {
    const payment = await this.paymentsRepository.findById(id);

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return payment;
  }

  async update(id: string, updatePaymentDto: UpdatePaymentDto, userId: string, userRole: string): Promise<Payment> {
    const payment = await this.findOne(id);

    // Only allow updates to pending payments
    if (payment.status !== PaymentStatus.PENDING) {
      throw new BadRequestException('Cannot modify verified or cancelled payments');
    }

    // Only allow users to modify their own payments unless they're admin
    if (payment.user_id !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException('Cannot modify payments belonging to other users');
    }

    const updateData: Prisma.PaymentUpdateInput = {};

    if (updatePaymentDto.amount !== undefined) {
      if (updatePaymentDto.amount <= 0) {
        throw new BadRequestException('Payment amount must be positive');
      }
      updateData.amount = new Decimal(updatePaymentDto.amount);
    }

    if (updatePaymentDto.scheduled_date !== undefined) {
      updateData.scheduled_date = new Date(updatePaymentDto.scheduled_date);
    }

    return this.paymentsRepository.update(id, updateData);
  }

  async remove(id: string, userId: string, userRole: string): Promise<Payment> {
    const payment = await this.findOne(id);

    // Only allow deletion of pending payments
    if (payment.status !== PaymentStatus.PENDING) {
      throw new BadRequestException('Cannot delete verified or cancelled payments');
    }

    // Only allow users to delete their own payments unless they're admin
    if (payment.user_id !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException('Cannot delete payments belonging to other users');
    }

    return this.paymentsRepository.delete(id);
  }

  async verifyPayment(id: string, verifyPaymentDto: VerifyPaymentDto, verifierId: string): Promise<Payment> {
    const payment = await this.findOne(id);

    if (payment.status !== PaymentStatus.PENDING) {
      throw new BadRequestException('Can only verify pending payments');
    }

    // Verify the verifier is not the payment owner (self-verification not allowed)
    if (payment.user_id === verifierId) {
      throw new BadRequestException('Cannot verify your own payments');
    }

    return this.prisma.$transaction(async (tx) => {
      // Update payment status to verified
      const verifiedPayment = await tx.payment.update({
        where: { id },
        data: {
          status: PaymentStatus.VERIFIED,
          verification_reference: verifyPaymentDto.verification_reference,
          verified_at: new Date(),
          verified_by: verifierId,
        },
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

      // Update related charge shares if payment is linked to a charge
      if (payment.charge_id) {
        await this.updateChargeShareBalances(payment.charge_id, payment.user_id, payment.amount, tx);
      }

      return verifiedPayment;
    });
  }

  private async updateChargeShareBalances(
    chargeId: string,
    userId: string,
    paymentAmount: Decimal,
    tx: Prisma.TransactionClient,
  ): Promise<void> {
    // Find the user's share for this charge
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

  async cancelPayment(id: string, userId: string, userRole: string): Promise<Payment> {
    const payment = await this.findOne(id);

    if (payment.status !== PaymentStatus.PENDING) {
      throw new BadRequestException('Can only cancel pending payments');
    }

    // Only allow users to cancel their own payments unless they're admin
    if (payment.user_id !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException('Cannot cancel payments belonging to other users');
    }

    return this.paymentsRepository.update(id, {
      status: PaymentStatus.CANCELLED,
    });
  }

  async getPaymentsByUser(userId: string, status?: PaymentStatus): Promise<Payment[]> {
    return this.paymentsRepository.findMany({
      user_id: userId,
      status,
    });
  }

  async getPendingPaymentsForVerification(): Promise<Payment[]> {
    return this.paymentsRepository.findMany({
      status: PaymentStatus.PENDING,
      orderBy: { created_at: 'asc' },
    });
  }
}
