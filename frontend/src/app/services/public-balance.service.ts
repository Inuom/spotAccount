import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { PublicSubscriptionBalance } from '../models/public-balance.model';

@Injectable({
  providedIn: 'root'
})
export class PublicBalanceService {
  constructor(private apiService: ApiService) {}

  getSubscriptionBalance(shareToken: string): Observable<PublicSubscriptionBalance> {
    return this.apiService.getPublic<PublicSubscriptionBalance>(
      `public/subscription-balance/${shareToken}`
    );
  }
}
