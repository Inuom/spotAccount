export interface Charge {
  id: string;
  subscription_id: string;
  period_start: string;
  period_end: string;
  amount_total: number;
  status: 'PENDING' | 'GENERATED' | 'CANCELLED';
  created_at: string;
  updated_at: string;
  subscription?: {
    id: string;
    title: string;
  };
  shares?: ChargeShare[];
}

export interface ChargeShare {
  id: string;
  charge_id: string;
  user_id: string;
  amount_due: number;
  amount_paid: number;
  status: 'OPEN' | 'SETTLED';
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  charge?: {
    id: string;
    amount_total: number;
    period_start: string;
    period_end: string;
  };
}

export interface CreateChargeDto {
  subscription_id: string;
  period_start: string;
  period_end: string;
  amount_total: number;
  status?: 'PENDING' | 'GENERATED' | 'CANCELLED';
}

