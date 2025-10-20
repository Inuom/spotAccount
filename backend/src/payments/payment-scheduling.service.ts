import { Injectable } from '@nestjs/common';
import { PaymentStatus } from '@prisma/client';
import { UserPaymentsRepository } from './user-payments.repository';
import { PaymentConflictService } from './payment-conflict.service';
import { CreateUserPaymentDto } from './dto/user-payment.dto';

@Injectable()
export class PaymentSchedulingService {
  constructor(
    private readonly userPaymentsRepository: UserPaymentsRepository,
    private readonly paymentConflictService: PaymentConflictService,
  ) {}

  async getNextAvailableDate(
    userId: string,
    preferredDate?: Date,
  ): Promise<Date> {
    if (!preferredDate) {
      // Default to tomorrow if no preference
      preferredDate = new Date();
      preferredDate.setDate(preferredDate.getDate() + 1);
    }

    try {
      return await this.paymentConflictService.resolveDateConflicts(
        userId,
        preferredDate,
      );
    } catch (error) {
      // If we can't find a date within 30 days, return the original preferred date
      // and let the validation service handle the conflict
      return preferredDate;
    }
  }

  async validateScheduleConstraints(userId: string, scheduledDate: Date): Promise<void> {
    const now = new Date();
    
    // Check if date is in the past
    if (scheduledDate < now) {
      throw new Error('Scheduled date cannot be in the past');
    }

    // Check if date is more than 1 year in the future
    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(now.getFullYear() + 1);
    
    if (scheduledDate > oneYearFromNow) {
      throw new Error('Scheduled date cannot be more than 1 year in the future');
    }

    // Check for conflicts with existing pending payments
    await this.paymentConflictService.checkCreationConflicts(userId, scheduledDate);
  }

  async getUserPaymentSchedule(userId: string): Promise<{
    upcomingPayments: number;
    nextPaymentDate?: Date;
    recentPayments: number;
  }> {
    const now = new Date();
    const nextMonth = new Date();
    nextMonth.setMonth(now.getMonth() + 1);

    const upcomingPayments = await this.userPaymentsRepository.getUserPayments(userId, {
      status: PaymentStatus.PENDING,
      orderBy: { scheduled_date: 'asc' },
      take: 10,
    });

    const recentPayments = await this.userPaymentsRepository.getUserPayments(userId, {
      orderBy: { updated_at: 'desc' },
      take: 5,
    });

    return {
      upcomingPayments: upcomingPayments.filter(p => p.scheduled_date > now).length,
      nextPaymentDate: upcomingPayments.find(p => p.scheduled_date > now)?.scheduled_date,
      recentPayments: recentPayments.length,
    };
  }

  async getSuggestedSchedule(userId: string, amount: number): Promise<{
    suggestedDate: Date;
    alternativeDates: Date[];
    reason: string;
  }> {
    const now = new Date();
    const suggestedDate = new Date();
    
    // Default suggestion: next business day (skip weekends)
    suggestedDate.setDate(now.getDate() + 1);
    
    // If tomorrow is weekend, move to Monday
    if (suggestedDate.getDay() === 0) { // Sunday
      suggestedDate.setDate(suggestedDate.getDate() + 1);
    } else if (suggestedDate.getDay() === 6) { // Saturday
      suggestedDate.setDate(suggestedDate.getDate() + 2);
    }

    // Try to find a conflict-free date
    const finalSuggestedDate = await this.paymentConflictService.resolveDateConflicts(
      userId,
      suggestedDate,
    );

    // Generate alternative dates (next 3 business days)
    const alternatives: Date[] = [];
    let currentDate = new Date(finalSuggestedDate);
    
    for (let i = 0; i < 5 && alternatives.length < 3; i++) {
      currentDate.setDate(currentDate.getDate() + 1);
      
      // Skip weekends
      if (currentDate.getDay() === 0 || currentDate.getDay() === 6) {
        continue;
      }

      try {
        await this.paymentConflictService.checkCreationConflicts(userId, currentDate);
        alternatives.push(new Date(currentDate));
      } catch {
        // Date has conflict, continue
      }
    }

    return {
      suggestedDate: finalSuggestedDate,
      alternativeDates: alternatives,
      reason: 'Next available business day with no conflicts',
    };
  }
}
