import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsRepository } from './payments.repository';
import { UpdateUserPaymentDto } from './dto/user-payment.dto';
import { PaymentValidationService } from './payment-validation.service';
import { PaymentConflictService } from './payment-conflict.service';
import { PaymentStatus } from '@prisma/client';

@Injectable()
export class PaymentModificationService {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly paymentsRepository: PaymentsRepository,
    private readonly paymentValidationService: PaymentValidationService,
    private readonly paymentConflictService: PaymentConflictService,
  ) {}

  async updateUserPayment(
    paymentId: string,
    updateDto: UpdateUserPaymentDto,
    userId: string,
  ) {
    const payment = await this.paymentsRepository.findById(paymentId);

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    // Verify payment ownership
    if (payment.user_id !== userId) {
      throw new ForbiddenException('Cannot modify payments belonging to other users');
    }

    // Only allow modification of pending payments
    if (payment.status !== PaymentStatus.PENDING) {
      throw new BadRequestException('Can only modify pending payments');
    }

    // Validate the update
    await this.paymentValidationService.validatePaymentUpdate(payment, updateDto);

    // Check for conflicts
    await this.paymentConflictService.checkUpdateConflicts(payment, updateDto);

    // Build update data
    const updateData: any = {};
    
    if (updateDto.amount !== undefined) {
      updateData.amount = updateDto.amount;
    }

    if (updateDto.scheduled_date !== undefined) {
      updateData.scheduled_date = new Date(updateDto.scheduled_date);
    }

    return this.paymentsRepository.update(paymentId, updateData);
  }

  async deleteUserPayment(paymentId: string, userId: string) {
    const payment = await this.paymentsRepository.findById(paymentId);

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    // Verify payment ownership
    if (payment.user_id !== userId) {
      throw new ForbiddenException('Cannot delete payments belonging to other users');
    }

    // Only allow deletion of pending payments
    if (payment.status !== PaymentStatus.PENDING) {
      throw new BadRequestException('Can only delete pending payments');
    }

    return this.paymentsRepository.delete(paymentId);
  }

  async cancelUserPayment(paymentId: string, userId: string) {
    return this.paymentsService.cancelPayment(paymentId, userId, 'USER');
  }
}
