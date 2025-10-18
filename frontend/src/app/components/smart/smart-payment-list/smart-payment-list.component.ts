import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { AppState } from '../../../store';
import * as PaymentActions from '../../../store/payments/payment.actions';
import * as PaymentSelectors from '../../../store/payments/payment.selectors';
import * as UiSelectors from '../../../store/ui/ui.selectors';

@Component({
  selector: 'app-smart-payment-list',
  template: `
    <app-dumb-payment-list
      [payments]="payments$ | async"
      [loading]="loading$ | async"
      [error]="error$ | async"
      [userRole]="userRole$ | async"
      (create)="onCreate($event)"
      (update)="onUpdate($event)"
      (verify)="onVerify($event)"
      (delete)="onDelete($event)"
      (refresh)="onRefresh()">
    </app-dumb-payment-list>
  `
})
export class SmartPaymentListComponent implements OnInit {
  payments$: Observable<any[]>;
  loading$: Observable<boolean>;
  error$: Observable<string | null>;
  userRole$: Observable<string | null>;

  constructor(private store: Store<AppState>) {
    this.payments$ = this.store.select(PaymentSelectors.selectAllPayments);
    this.loading$ = this.store.select(UiSelectors.selectLoading);
    this.error$ = this.store.select(UiSelectors.selectError);
    this.userRole$ = this.store.select(PaymentSelectors.selectUserRole);
  }

  ngOnInit() {
    this.store.dispatch(PaymentActions.loadPayments());
  }

  onCreate(payment: any) {
    this.store.dispatch(PaymentActions.createPayment({ payment }));
  }

  onUpdate({ id, payment }: { id: string; payment: any }) {
    this.store.dispatch(PaymentActions.updatePayment({ id, payment }));
  }

  onVerify({ id, verificationData }: { id: string; verificationData: any }) {
    this.store.dispatch(PaymentActions.verifyPayment({ id, verificationData }));
  }

  onDelete(id: string) {
    this.store.dispatch(PaymentActions.deletePayment({ id }));
  }

  onRefresh() {
    this.store.dispatch(PaymentActions.loadPayments());
  }
}
