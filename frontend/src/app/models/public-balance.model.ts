export interface PublicParticipantBalance {
  user_name: string;
  total_charges: number;
  total_verified_payments: number;
  total_pending_payments: number;
  balance_due: number;
}

export interface PublicSubscriptionBalance {
  subscription_id: string;
  subscription_title: string;
  total_amount: number;
  billing_day: number;
  snapshot_date: string;
  user_balances: PublicParticipantBalance[];
  total_charges: number;
  total_verified_payments: number;
  total_pending_payments: number;
  overall_balance_due: number;
}
