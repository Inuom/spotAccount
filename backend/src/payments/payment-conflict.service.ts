import {
  Injectable,
  BadRequestException,
} from '@nestjs/common';
import { Payment } from '@prisma/client';
import { UpdateUserPaymentDto } from './dto/user-payment.dto';
import { UserPaymentsRepository } from './user-payments.repository';
import { PaymentValidationService } from './payment-validation.service';

@Injectable()
export class PaymentConflictService {
  constructor(
    private readonly userPaymentsRepository: UserPaymentsRepository,
    private readonly paymentValidationService: PaymentValidationService,
  ) {}

  async checkUpdateConflicts(
    payment: Payment,
    updateDto: UpdateUserPaymentDto,
  ): Promise<void> {
    // Check for scheduling conflicts if date is being updated
    if (updateDto.scheduled_date !== undefined) {
      const scheduledDate = new Date(updateDto.scheduled_date);
      
      await this.paymentValidationService.validateScheduledDateConflict(
        payment.user_id,
        scheduledDate,
        payment.id,
      );
    }
  }

  async checkCreationConflicts(
    userId: string,
    scheduledDate: Date,
  ): Promise<void> {
    await this.paymentValidationService.validateScheduledDateConflict(
      userId,
      scheduledDate,
    );
  }

  async resolveDateConflicts(
    userId: string,
    proposedDate: Date,
    excludePaymentId?: string,
  ): Promise<Date> {
    // If there's a conflict, try to find the next available date
    const hasConflict = await this.userPaymentsRepository.checkUserPaymentConflict(
      userId,
      proposedDate,
      excludePaymentId,
    );

    if (!hasConflict) {
      return proposedDate;
    }

    // Increment by days until we find a free date
    let nextAvailableDate = new Date(proposedDate);
    const maxAttempts = 30; // Don't search more than 30 days ahead
    let attempts = 0;

    while (attempts < maxAttempts) {
      nextAvailableDate.setDate(nextAvailableDate.getDate() + 1);
      attempts++;

      const stillHasConflict = await this.userPaymentsRepository.checkUserPaymentConflict(
        userId,
        nextAvailableDate,
        excludePaymentId,
      );

      if (!stillHasConflict) {
        return nextAvailableDate;
      }
    }

    throw new BadRequestException(
      'Unable to find an available date within 30 days. Please choose a different date.',
    );
  }
}
