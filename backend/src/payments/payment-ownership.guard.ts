import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PaymentsRepository } from './payments.repository';
import { PaymentStatus } from '@prisma/client';

@Injectable()
export class PaymentOwnershipGuard implements CanActivate {
  constructor(private readonly paymentsRepository: PaymentsRepository) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const paymentId = request.params.id;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    if (!paymentId) {
      throw new ForbiddenException('Payment ID is required');
    }

    const payment = await this.paymentsRepository.findById(paymentId);

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    // Check if the payment belongs to the authenticated user
    if (payment.user_id !== user.id) {
      throw new ForbiddenException('You can only access your own payments');
    }

    // Add payment to request for use in controllers
    request.payment = payment;

    return true;
  }
}
