export interface Subscription {
  id: string;
  title: string;
  total_amount: number;
  billing_day: number;
  frequency: string;
  owner_id: string;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  owner?: {
    id: string;
    name: string;
    email: string;
  };
  participants?: SubscriptionParticipant[];
}

export interface SubscriptionParticipant {
  id: string;
  subscription_id: string;
  user_id: string;
  share_type: 'EQUAL' | 'CUSTOM';
  share_value: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface CreateSubscriptionParticipantDto {
  user_id: string;
  share_type: 'EQUAL' | 'CUSTOM';
  share_value?: number;
}

export interface AddParticipantDto {
  user_id: string;
  share_type: 'EQUAL' | 'CUSTOM';
  share_value?: number;
}

export interface CreateSubscriptionDto {
  title: string;
  total_amount: number;
  billing_day: number;
  frequency?: string;
  start_date?: string;
  end_date?: string;
  participants: CreateSubscriptionParticipantDto[];
}

export interface UpdateSubscriptionDto {
  title?: string;
  total_amount?: number;
  billing_day?: number;
  is_active?: boolean;
}

