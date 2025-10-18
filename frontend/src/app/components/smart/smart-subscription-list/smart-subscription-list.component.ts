import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { AppState } from '../../../store';
import * as SubscriptionActions from '../../../store/subscriptions/subscription.actions';
import * as SubscriptionSelectors from '../../../store/subscriptions/subscription.selectors';
import * as UiSelectors from '../../../store/ui/ui.selectors';

@Component({
  selector: 'app-smart-subscription-list',
  template: `
    <app-dumb-subscription-list
      [subscriptions]="subscriptions$ | async"
      [loading]="loading$ | async"
      [error]="error$ | async"
      (create)="onCreate($event)"
      (update)="onUpdate($event)"
      (delete)="onDelete($event)"
      (refresh)="onRefresh()">
    </app-dumb-subscription-list>
  `
})
export class SmartSubscriptionListComponent implements OnInit {
  subscriptions$: Observable<any[]>;
  loading$: Observable<boolean>;
  error$: Observable<string | null>;

  constructor(private store: Store<AppState>) {
    this.subscriptions$ = this.store.select(SubscriptionSelectors.selectAllSubscriptions);
    this.loading$ = this.store.select(UiSelectors.selectLoading);
    this.error$ = this.store.select(UiSelectors.selectError);
  }

  ngOnInit() {
    this.store.dispatch(SubscriptionActions.loadSubscriptions());
  }

  onCreate(subscription: any) {
    this.store.dispatch(SubscriptionActions.createSubscription({ subscription }));
  }

  onUpdate({ id, subscription }: { id: string; subscription: any }) {
    this.store.dispatch(SubscriptionActions.updateSubscription({ id, subscription }));
  }

  onDelete(id: string) {
    this.store.dispatch(SubscriptionActions.deleteSubscription({ id }));
  }

  onRefresh() {
    this.store.dispatch(SubscriptionActions.loadSubscriptions());
  }
}
