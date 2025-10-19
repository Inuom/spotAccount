import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { AppState } from '../../../store';
import { Charge } from '../../../models/charge.model';
import * as ChargesActions from '../../../store/charges/charges.actions';
import { selectCharges, selectChargesLoading } from '../../../store/charges/charges.selectors';

@Component({
  selector: 'app-charges',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="charges-container">
      <div class="header">
        <h1>Charge Management</h1>
        <button class="btn-primary" (click)="refreshCharges()">
          Refresh Charges
        </button>
      </div>

      <div class="charges-section">
        <h2>All Charges</h2>
        
        <div *ngIf="chargesLoading$ | async" class="loading">Loading charges...</div>
        
        <div *ngIf="!(chargesLoading$ | async)" class="charges-grid">
          <div *ngFor="let charge of charges$ | async" class="charge-card">
            <div class="card-header">
              <h3>{{ charge.subscription?.title || 'Unknown Subscription' }}</h3>
              <span class="status-badge" [class.generated]="charge.status === 'GENERATED'">
                {{ charge.status }}
              </span>
            </div>

            <div class="card-body">
              <div class="info-row">
                <span class="label">Total Amount:</span>
                <span class="value">€{{ charge.amount_total }}</span>
              </div>
              <div class="info-row">
                <span class="label">Period:</span>
                <span class="value">
                  {{ charge.period_start | date:'short' }} - {{ charge.period_end | date:'short' }}
                </span>
              </div>
              <div class="info-row">
                <span class="label">Shares:</span>
                <span class="value">{{ charge.shares?.length || 0 }}</span>
              </div>
              <div class="info-row">
                <span class="label">Created:</span>
                <span class="value">{{ charge.created_at | date:'short' }}</span>
              </div>
            </div>

            <div class="card-footer">
              <button class="btn-secondary-sm">View Details</button>
              <button class="btn-primary-sm">Manage Shares</button>
            </div>
          </div>

          <div *ngIf="(charges$ | async)?.length === 0" class="empty-state">
            <p>No charges found.</p>
            <p>Generate charges from subscriptions to see them here.</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .charges-container {
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    h1 {
      margin: 0;
      color: #333;
    }

    h2 {
      margin: 0 0 1.5rem 0;
      color: #555;
      font-size: 1.5rem;
    }

    .btn-primary {
      background: #007bff;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 500;
    }

    .btn-primary:hover {
      background: #0056b3;
    }

    .charges-section {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .loading {
      text-align: center;
      padding: 3rem;
      color: #666;
    }

    .charges-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 1.5rem;
    }

    .charge-card {
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      overflow: hidden;
      transition: box-shadow 0.2s;
    }

    .charge-card:hover {
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      background: #f8f9fa;
      border-bottom: 1px solid #e0e0e0;
    }

    .status-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.85rem;
      font-weight: 600;
      background: #e0e0e0;
      color: #666;
    }

    .status-badge.generated {
      background: #28a745;
      color: white;
    }

    .card-body {
      padding: 1.5rem;
    }

    .info-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.75rem;
    }

    .info-row .label {
      color: #666;
      font-weight: 500;
    }

    .info-row .value {
      color: #333;
    }

    .card-footer {
      padding: 1rem 1.5rem;
      background: #f8f9fa;
      border-top: 1px solid #e0e0e0;
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .btn-secondary-sm, .btn-primary-sm {
      padding: 0.5rem 1rem;
      font-size: 0.9rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 500;
    }

    .btn-secondary-sm {
      background: #6c757d;
      color: white;
    }

    .btn-secondary-sm:hover {
      background: #5a6268;
    }

    .btn-primary-sm {
      background: #007bff;
      color: white;
    }

    .btn-primary-sm:hover {
      background: #0056b3;
    }

    .empty-state {
      text-align: center;
      padding: 3rem;
      color: #666;
      grid-column: 1 / -1;
    }

    .empty-state p {
      margin: 0.5rem 0;
    }
  `]
})
export class ChargesComponent implements OnInit {
  charges$: Observable<Charge[]>;
  chargesLoading$: Observable<boolean>;

  constructor(private store: Store<AppState>) {
    this.charges$ = this.store.select(selectCharges);
    this.chargesLoading$ = this.store.select(selectChargesLoading);
  }

  ngOnInit(): void {
    this.store.dispatch(ChargesActions.loadCharges({}));
  }

  refreshCharges(): void {
    this.store.dispatch(ChargesActions.loadCharges({}));
  }
}
