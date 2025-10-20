import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { AppState } from '../../../store';
import { UserBalance } from '../../../models/report.model';
import * as ReportsActions from '../../../store/reports/reports.actions';
import { selectMyBalance, selectReportsLoading, selectReportsError } from '../../../store/reports/reports.selectors';

@Component({
  selector: 'app-balance',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './balance.component.html',
  styleUrls: ['./balance.component.css']
})
export class BalanceComponent implements OnInit, OnDestroy {
  balance$: Observable<UserBalance | null>;
  loading$: Observable<boolean>;
  error$: Observable<string | null>;
  
  asOfDate: string = '';
  private destroy$ = new Subject<void>();

  constructor(private store: Store<AppState>) {
    this.balance$ = this.store.select(selectMyBalance);
    this.loading$ = this.store.select(selectReportsLoading);
    this.error$ = this.store.select(selectReportsError);
  }

  ngOnInit(): void {
    this.loadBalance();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadBalance(): void {
    this.store.dispatch(ReportsActions.loadMyBalance({ 
      asOfDate: this.asOfDate || undefined 
    }));
  }

  onDateChange(): void {
    this.loadBalance();
  }

  clearDate(): void {
    this.asOfDate = '';
    this.loadBalance();
  }

  refresh(): void {
    this.loadBalance();
  }
}

