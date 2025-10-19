import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Payment, CreatePaymentDto, UpdatePaymentDto, VerifyPaymentDto } from '../models/payment.model';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private readonly endpoint = 'payments';

  constructor(private apiService: ApiService) {}

  getPayments(params?: { status?: string; user_id?: string; charge_id?: string }): Observable<Payment[]> {
    let queryParams = '';
    const paramList: string[] = [];
    
    if (params?.status) {
      paramList.push(`status=${params.status}`);
    }
    if (params?.user_id) {
      paramList.push(`user_id=${params.user_id}`);
    }
    if (params?.charge_id) {
      paramList.push(`charge_id=${params.charge_id}`);
    }
    
    if (paramList.length > 0) {
      queryParams = `?${paramList.join('&')}`;
    }
    
    return this.apiService.get<Payment[]>(`${this.endpoint}${queryParams}`);
  }

  getPayment(id: string): Observable<Payment> {
    return this.apiService.get<Payment>(`${this.endpoint}/${id}`);
  }

  getPendingPayments(): Observable<Payment[]> {
    return this.apiService.get<Payment[]>(`${this.endpoint}/pending-verification`);
  }

  createPayment(payment: CreatePaymentDto): Observable<Payment> {
    return this.apiService.post<Payment>(this.endpoint, payment);
  }

  updatePayment(id: string, payment: UpdatePaymentDto): Observable<Payment> {
    return this.apiService.patch<Payment>(`${this.endpoint}/${id}`, payment);
  }

  deletePayment(id: string): Observable<void> {
    return this.apiService.delete<void>(`${this.endpoint}/${id}`);
  }

  verifyPayment(id: string, verificationData: VerifyPaymentDto): Observable<Payment> {
    return this.apiService.patch<Payment>(`${this.endpoint}/${id}/verify`, verificationData);
  }

  cancelPayment(id: string): Observable<Payment> {
    return this.apiService.patch<Payment>(`${this.endpoint}/${id}/cancel`, {});
  }
}
