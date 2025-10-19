import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Subscription, CreateSubscriptionDto, UpdateSubscriptionDto } from '../models/subscription.model';
import { Charge } from '../models/charge.model';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionService {
  private readonly endpoint = 'subscriptions';

  constructor(private apiService: ApiService) {}

  getSubscriptions(): Observable<Subscription[]> {
    return this.apiService.get<Subscription[]>(this.endpoint);
  }

  getMySubscriptions(): Observable<Subscription[]> {
    return this.apiService.get<Subscription[]>(`${this.endpoint}/my-subscriptions`);
  }

  getSubscriptionById(id: string): Observable<Subscription> {
    return this.apiService.get<Subscription>(`${this.endpoint}/${id}`);
  }

  createSubscription(data: CreateSubscriptionDto): Observable<Subscription> {
    return this.apiService.post<Subscription>(this.endpoint, data);
  }

  updateSubscription(id: string, data: UpdateSubscriptionDto): Observable<Subscription> {
    return this.apiService.patch<Subscription>(`${this.endpoint}/${id}`, data);
  }

  deleteSubscription(id: string): Observable<void> {
    return this.apiService.delete<void>(`${this.endpoint}/${id}`);
  }

  generateCharges(subscriptionId: string, until: string): Observable<Charge[]> {
    return this.apiService.post<Charge[]>(
      `charges/subscriptions/${subscriptionId}/generate?until=${until}`,
      {}
    );
  }
}

