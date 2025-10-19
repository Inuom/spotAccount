import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Charge, ChargeShare, CreateChargeDto } from '../models/charge.model';

@Injectable({
  providedIn: 'root'
})
export class ChargeService {
  private readonly endpoint = 'charges';

  constructor(private apiService: ApiService) {}

  getCharges(subscriptionId?: string, date?: string): Observable<Charge[]> {
    let queryParams = '';
    const params: string[] = [];
    
    if (subscriptionId) {
      params.push(`subscription_id=${subscriptionId}`);
    }
    
    if (date) {
      params.push(`date=${date}`);
    }
    
    if (params.length > 0) {
      queryParams = `?${params.join('&')}`;
    }
    
    return this.apiService.get<Charge[]>(`${this.endpoint}${queryParams}`);
  }

  getChargeById(id: string): Observable<Charge> {
    return this.apiService.get<Charge>(`${this.endpoint}/${id}`);
  }

  getChargeShares(chargeId: string): Observable<ChargeShare[]> {
    return this.apiService.get<ChargeShare[]>(`${this.endpoint}/${chargeId}/shares`);
  }

  createCharge(data: CreateChargeDto): Observable<Charge> {
    return this.apiService.post<Charge>(this.endpoint, data);
  }
}

