import { Injectable } from '@nestjs/common';
import { BalanceService, UserBalance, SubscriptionBalance } from './balance.service';

export interface BalanceReport {
  report_type: 'user_balance' | 'subscription_balance' | 'all_balances';
  generated_at: Date;
  as_of_date: Date;
  data: UserBalance | SubscriptionBalance | UserBalance[];
}

export interface PaymentHistoryReport {
  report_type: 'payment_history';
  generated_at: Date;
  user_id?: string;
  subscription_id?: string;
  start_date?: Date;
  end_date?: Date;
  payments: any[];
  total_amount: number;
  verified_amount: number;
  pending_amount: number;
}

export interface ChargeHistoryReport {
  report_type: 'charge_history';
  generated_at: Date;
  subscription_id?: string;
  start_date?: Date;
  end_date?: Date;
  charges: any[];
  total_amount: number;
}

@Injectable()
export class ReportService {
  constructor(private balanceService: BalanceService) {}

  /**
   * Generate a user balance report
   */
  async generateUserBalanceReport(
    userId: string,
    asOfDate?: Date,
  ): Promise<BalanceReport> {
    const effectiveDate = asOfDate || new Date();
    const balance = await this.balanceService.calculateUserBalance(
      userId,
      effectiveDate,
    );

    return {
      report_type: 'user_balance',
      generated_at: new Date(),
      as_of_date: effectiveDate,
      data: balance,
    };
  }

  /**
   * Generate a subscription balance report
   */
  async generateSubscriptionBalanceReport(
    subscriptionId: string,
    asOfDate?: Date,
  ): Promise<BalanceReport> {
    const effectiveDate = asOfDate || new Date();
    const balance = await this.balanceService.calculateSubscriptionBalance(
      subscriptionId,
      effectiveDate,
    );

    return {
      report_type: 'subscription_balance',
      generated_at: new Date(),
      as_of_date: effectiveDate,
      data: balance,
    };
  }

  /**
   * Generate an all balances report
   */
  async generateAllBalancesReport(asOfDate?: Date): Promise<BalanceReport> {
    const effectiveDate = asOfDate || new Date();
    const balances = await this.balanceService.calculateAllBalances(
      effectiveDate,
    );

    return {
      report_type: 'all_balances',
      generated_at: new Date(),
      as_of_date: effectiveDate,
      data: balances,
    };
  }
}

