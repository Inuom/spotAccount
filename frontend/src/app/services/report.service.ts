import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { BalanceReport, UserBalance } from '../models/report.model';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  constructor(private apiService: ApiService) {}

  /**
   * Get user balance report
   */
  getUserBalance(userId: string, asOfDate?: string): Observable<BalanceReport> {
    const params = asOfDate ? `?asOfDate=${asOfDate}` : '';
    return this.apiService.get<BalanceReport>(`reports/balance/user/${userId}${params}`);
  }

  /**
   * Get subscription balance report
   */
  getSubscriptionBalance(subscriptionId: string, asOfDate?: string): Observable<BalanceReport> {
    const params = asOfDate ? `?asOfDate=${asOfDate}` : '';
    return this.apiService.get<BalanceReport>(`reports/balance/subscription/${subscriptionId}${params}`);
  }

  /**
   * Get all balances report
   */
  getAllBalances(asOfDate?: string): Observable<BalanceReport> {
    const params = asOfDate ? `?asOfDate=${asOfDate}` : '';
    return this.apiService.get<BalanceReport>(`reports/balance/all${params}`);
  }

  /**
   * Get current user's balance
   */
  getMyBalance(asOfDate?: string): Observable<BalanceReport> {
    const params = asOfDate ? `?asOfDate=${asOfDate}` : '';
    return this.apiService.get<BalanceReport>(`reports/balance/me${params}`);
  }
}

