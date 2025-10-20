import {
  Injectable,
  BadRequestException,
} from '@nestjs/common';
import { Payment, PaymentStatus } from '@prisma/client';
import { UpdateUserPaymentDto } from './dto/user-payment.dto';
import { UserPaymentsRepository } from './user-payments.repository';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class PaymentValidationService {
  constructor(
    private readonly userPaymentsRepository: UserPaymentsRepository,
  ) {}

  async validatePaymentUpdate(
    payment: Payment,
    updateDto: UpdateUserPaymentDto,
  ): Promise<void> {
    // Validate amount if provided
    if (updateDto.amount !== undefined) {
      if (updateDto.amount <= 0) {
        throw new BadRequestException('Payment amount must be greater than 0');
      }

      // Check if amount is reasonable (not more than 10x the original or less than 0.01)
      if (updateDto.amount > Number(payment.amount) * 10) {
        throw new BadRequestException('Payment amount cannot be more than 10x the original amount');
      }

      if (updateDto.amount < 0.01) {
        throw new BadRequestException('Payment amount must be at least 0.01');
      }
    }

    // Validate scheduled date if provided
    if (updateDto.scheduled_date !== undefined) {
      const scheduledDate = new Date(updateDto.scheduled_date);
      const now = new Date();
      
      // Allow payments scheduled for up to 1 year in the future
      const oneYearFromNow = new Date();
      oneYearFromNow.setFullYear(now.getFullYear() + 1);

      if (scheduledDate < now) {
        throw new BadRequestException('Scheduled date cannot be in the past');
      }

      if (scheduledDate > oneYearFromNow) {
        throw new BadRequestException('Scheduled date cannot be more than 1 year in the future');
      }

      // Check for conflicts with other pending payments on the same date
      const hasConflict = await this.userPaymentsRepository.checkUserPaymentConflict(
        payment.user_id,
        scheduledDate,
        payment.id,
      );

      if (hasConflict) {
        throw new BadRequestException('You already have a pending payment scheduled for this date');
      }
    }
  }

  async validateScheduledDateConflict(
    userId: string,
    scheduledDate: Date,
    excludePaymentId?: string,
  ): Promise<void> {
    const hasConflict = await this.userPaymentsRepository.checkUserPaymentConflict(
      userId,
      scheduledDate,
      excludePaymentId,
    );

    if (hasConflict) {
      throw new BadRequestException('You already have a pending payment scheduled for this date');
    }
  }

  validatePaymentAmount(amount: number): void {
    if (amount <= 0) {
      throw new BadRequestException('Payment amount must be greater than 0');
    }

    if (amount < 0.01) {
      throw new BadRequestException('Payment amount must be at least 0.01');
    }
  }

  validatePaymentStatus(payment: Payment, allowedStatuses: PaymentStatus[]): void {
    if (!allowedStatuses.includes(payment.status)) {
      throw new BadRequestException(`Payment must be in one of these statuses: ${allowedStatuses.join(', ')}`);
    }
  }
}
