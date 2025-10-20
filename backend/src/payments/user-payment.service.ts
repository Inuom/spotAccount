import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { UserPaymentsRepository } from './user-payments.repository';
import { PaymentValidationService } from './payment-validation.service';
import { PaymentConflictService } from './payment-conflict.service';
import { PaymentSchedulingService } from './payment-scheduling.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentStatus } from '@prisma/client';

@Injectable()
export class UserPaymentService {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly userPaymentsRepository: UserPaymentsRepository,
    private readonly paymentValidationService: PaymentValidationService,
    private readonly paymentConflictService: PaymentConflictService,
    private readonly paymentSchedulingService: PaymentSchedulingService,
  ) {}

  async createUserPayment(createPaymentDto: CreatePaymentDto, userId: string) {
    const scheduledDate = new Date(createPaymentDto.scheduled_date);
    
    // Validate scheduling constraints
    await this.paymentSchedulingService.validateScheduleConstraints(userId, scheduledDate);
    
    // Check for conflicts
    await this.paymentConflictService.checkCreationConflicts(userId, scheduledDate);
    
    // Validate amount
    this.paymentValidationService.validatePaymentAmount(createPaymentDto.amount);

    // Create the payment using the main service
    return this.paymentsService.create(createPaymentDto, userId);
  }

  async getUserPayments(userId: string, status?: string) {
    // Convert string status to PaymentStatus enum if it's a valid value
    let paymentStatus: PaymentStatus | undefined;
    if (status && status !== 'all') {
      if (Object.values(PaymentStatus).includes(status as PaymentStatus)) {
        paymentStatus = status as PaymentStatus;
      }
    }
    return this.userPaymentsRepository.getUserPayments(userId, { status: paymentStatus });
  }

  async getPendingPayments(userId: string) {
    return this.userPaymentsRepository.getPendingUserPayments(userId);
  }

  async getPaymentHistory(userId: string) {
    return this.userPaymentsRepository.getUserPaymentHistory(userId);
  }

  async getUserPaymentStats(userId: string) {
    return this.userPaymentsRepository.getUserPaymentStats(userId);
  }

  async getSuggestedSchedule(userId: string, amount: number) {
    return this.paymentSchedulingService.getSuggestedSchedule(userId, amount);
  }

  async getNextAvailableDate(userId: string, preferredDate?: Date) {
    return this.paymentSchedulingService.getNextAvailableDate(userId, preferredDate);
  }
}
