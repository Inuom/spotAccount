export interface UserBalance {
  user_id: string;
  user_name: string;
  user_email: string;
  total_charges: number;
  total_verified_payments: number;
  total_pending_payments: number;
  balance_due: number;
  balance_with_pending: number;
}

export interface SubscriptionBalance {
  subscription_id: string;
  subscription_title: string;
  total_amount: number;
  user_balances: UserBalance[];
  total_charges: number;
  total_verified_payments: number;
  total_pending_payments: number;
  overall_balance_due: number;
}

export interface BalanceReport {
  report_type: 'user_balance' | 'subscription_balance' | 'all_balances';
  generated_at: Date;
  as_of_date: Date;
  data: UserBalance | SubscriptionBalance | UserBalance[];
}

