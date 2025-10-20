export interface Payment {
  id: string;
  user_id: string;
  charge_id?: string;
  amount: number;
  currency: string;
  scheduled_date: string;
  created_by: string;
  status: 'PENDING' | 'VERIFIED' | 'CANCELLED';
  verification_reference?: string;
  verified_at?: string;
  verified_by?: string;
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  charge?: {
    id: string;
    subscription_id: string;
    amount_total: number;
    period_start: string;
    period_end: string;
    subscription?: {
      id: string;
      title: string;
    };
  };
  creator?: {
    id: string;
    name: string;
    email: string;
  };
  verifier?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface CreatePaymentDto {
  user_id: string;
  charge_id?: string;
  amount: number;
  currency?: string;
  scheduled_date: string;
}

export interface UpdatePaymentDto {
  amount?: number;
  scheduled_date?: string;
}

export interface VerifyPaymentDto {
  verification_reference?: string;
}

export interface CreateUserPaymentDto {
  charge_id?: string;
  amount: number;
  currency?: string;
  scheduled_date: string;
}

export interface UpdateUserPaymentDto {
  amount?: number;
  scheduled_date?: string;
}

export interface UserPaymentStats {
  totalPayments: number;
  pendingPayments: number;
  verifiedPayments: number;
  cancelledPayments: number;
  totalAmount: number;
}

export interface PaymentSchedule {
  upcomingPayments: number;
  nextPaymentDate?: Date;
  recentPayments: number;
}

export interface SuggestedSchedule {
  suggestedDate: Date;
  alternativeDates: Date[];
  reason: string;
}