import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { AppState } from '../../../store';
import { BalanceReport } from '../../../models/report.model';
import * as ReportsActions from '../../../store/reports/reports.actions';
import { selectCurrentReport, selectReportsLoading, selectReportsError } from '../../../store/reports/reports.selectors';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent implements OnInit {
  report$: Observable<BalanceReport | null>;
  loading$: Observable<boolean>;
  error$: Observable<string | null>;
  
  reportType: 'all' | 'subscription' | 'user' = 'all';
  subscriptionId: string = '';
  userId: string = '';
  asOfDate: string = '';

  constructor(private store: Store<AppState>) {
    this.report$ = this.store.select(selectCurrentReport);
    this.loading$ = this.store.select(selectReportsLoading);
    this.error$ = this.store.select(selectReportsError);
  }

  ngOnInit(): void {
    this.loadAllBalances();
  }

  loadAllBalances(): void {
    this.store.dispatch(ReportsActions.loadAllBalances({ asOfDate: this.asOfDate || undefined }));
  }

  loadSubscriptionBalance(): void {
    if (this.subscriptionId) {
      this.store.dispatch(ReportsActions.loadSubscriptionBalance({ 
        subscriptionId: this.subscriptionId,
        asOfDate: this.asOfDate || undefined 
      }));
    }
  }

  loadUserBalance(): void {
    if (this.userId) {
      this.store.dispatch(ReportsActions.loadUserBalance({ 
        userId: this.userId,
        asOfDate: this.asOfDate || undefined 
      }));
    }
  }

  generateReport(): void {
    switch (this.reportType) {
      case 'all':
        this.loadAllBalances();
        break;
      case 'subscription':
        this.loadSubscriptionBalance();
        break;
      case 'user':
        this.loadUserBalance();
        break;
    }
  }
}

