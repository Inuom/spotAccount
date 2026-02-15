import {
  Controller,
  Get,
  Param,
  NotFoundException,
  Logger,
  Req,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Request } from 'express';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { BalanceService } from '../reports/balance.service';
import {
  PublicSubscriptionBalanceResponse,
  PublicParticipantBalance,
} from './public-balance.response';

@Controller('public')
export class PublicController {
  private readonly logger = new Logger(PublicController.name);

  constructor(
    private readonly subscriptionsService: SubscriptionsService,
    private readonly balanceService: BalanceService,
  ) {}

  /**
   * Get subscription balance by share token (no auth required).
   * Rate limited to 10 requests/minute per IP to prevent enumeration.
   */
  @Get('subscription-balance/:shareToken')
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 requests/minute per IP (design)
  async getSubscriptionBalance(
    @Param('shareToken') shareToken: string,
    @Req() req: Request,
  ): Promise<PublicSubscriptionBalanceResponse> {
    const ip = req.ip || req.socket?.remoteAddress || 'unknown';
    const userAgent = req.get('user-agent') || 'unknown';

    const subscription =
      await this.subscriptionsService.findByShareToken(shareToken);

    if (!subscription) {
      this.logger.warn({
        event: 'public_balance_access_failed',
        reason: 'not_found',
        shareTokenAttempt: shareToken,
        ip,
        userAgent,
      });
      throw new NotFoundException('Link not found or expired');
    }

    try {
      const balance = await this.balanceService.calculateSubscriptionBalance(
        subscription.id,
      );

      // Strip sensitive data - design: no email, user_id, verification refs
      const publicUserBalances: PublicParticipantBalance[] =
        balance.user_balances.map((ub) => ({
          user_name: ub.user_name,
          total_charges: ub.total_charges,
          total_verified_payments: ub.total_verified_payments,
          total_pending_payments: ub.total_pending_payments,
          balance_due: ub.balance_due,
        }));

      this.logger.log({
        event: 'public_balance_access_success',
        subscriptionId: subscription.id,
        shareToken: shareToken,
        ip,
        userAgent,
      });

      return {
        subscription_id: balance.subscription_id,
        subscription_title: balance.subscription_title,
        total_amount: balance.total_amount,
        billing_day: subscription.billing_day,
        snapshot_date: new Date().toISOString().split('T')[0],
        user_balances: publicUserBalances,
        total_charges: balance.total_charges,
        total_verified_payments: balance.total_verified_payments,
        total_pending_payments: balance.total_pending_payments,
        overall_balance_due: balance.overall_balance_due,
      };
    } catch (err) {
      this.logger.warn({
        event: 'public_balance_access_failed',
        reason: 'calculation_error',
        subscriptionId: subscription.id,
        ip,
        userAgent,
        error: err instanceof Error ? err.message : 'unknown',
      });
      throw err;
    }
  }
}
