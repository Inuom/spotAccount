import { Injectable, CanActivate, ExecutionContext, BadRequestException } from '@nestjs/common';
import { PaymentsRepository } from './payments.repository';
import { PaymentStatus } from '@prisma/client';

@Injectable()
export class PaymentStatusGuard implements CanActivate {
  constructor(private readonly paymentsRepository: PaymentsRepository) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const paymentId = request.params.id;

    if (!paymentId) {
      throw new BadRequestException('Payment ID is required');
    }

    const payment = await this.paymentsRepository.findById(paymentId);

    if (!payment) {
      throw new BadRequestException('Payment not found');
    }

    // Add payment to request for use in controller
    request.payment = payment;

    return true;
  }

  static forStatus(allowedStatuses: PaymentStatus[]) {
    return class StatusSpecificGuard extends PaymentStatusGuard {
      async canActivate(context: ExecutionContext): Promise<boolean> {
        const canActivate = await super.canActivate(context);
        
        if (!canActivate) {
          return false;
        }

        const request = context.switchToHttp().getRequest();
        const payment = request.payment;

        if (!allowedStatuses.includes(payment.status)) {
          const statusList = allowedStatuses.join(' or ');
          throw new BadRequestException(`Payment must be ${statusList} to perform this action`);
        }

        return true;
      }
    };
  }
}
