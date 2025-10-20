import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { 
  Payment, 
  CreateUserPaymentDto, 
  UpdateUserPaymentDto,
  UserPaymentStats,
  SuggestedSchedule
} from '../models/payment.model';

@Injectable({
  providedIn: 'root'
})
export class UserPaymentService {
  private readonly endpoint = 'user-payments';

  constructor(private apiService: ApiService) {}

  getMyPayments(status?: string): Observable<Payment[]> {
    const queryParams = status ? `?status=${status}` : '';
    return this.apiService.get<Payment[]>(`${this.endpoint}${queryParams}`);
  }

  getPendingPayments(): Observable<Payment[]> {
    return this.apiService.get<Payment[]>(`${this.endpoint}/pending`);
  }

  getPaymentHistory(): Observable<Payment[]> {
    return this.apiService.get<Payment[]>(`${this.endpoint}/history`);
  }

  getPaymentStats(): Observable<UserPaymentStats> {
    return this.apiService.get<UserPaymentStats>(`${this.endpoint}/stats`);
  }

  getSuggestedSchedule(amount: number): Observable<SuggestedSchedule> {
    return this.apiService.get<SuggestedSchedule>(`${this.endpoint}/suggestions/${amount}`);
  }

  getPayment(id: string): Observable<Payment> {
    return this.apiService.get<Payment>(`${this.endpoint}/${id}`);
  }

  createPayment(payment: CreateUserPaymentDto): Observable<Payment> {
    return this.apiService.post<Payment>(this.endpoint, payment);
  }

  updatePayment(id: string, payment: UpdateUserPaymentDto): Observable<Payment> {
    return this.apiService.patch<Payment>(`${this.endpoint}/${id}`, payment);
  }

  deletePayment(id: string): Observable<void> {
    return this.apiService.delete<void>(`${this.endpoint}/${id}`);
  }

  cancelPayment(id: string): Observable<Payment> {
    return this.apiService.patch<Payment>(`${this.endpoint}/${id}/cancel`, {});
  }
}
