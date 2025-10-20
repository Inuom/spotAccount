import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppState } from './store';
import * as AuthActions from './store/auth/auth.actions';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <router-outlet></router-outlet>
  `,
  styles: []
})
export class AppComponent implements OnInit {
  title = 'Shared Subscription Debt Manager';
  private store = inject(Store<AppState>);

  ngOnInit(): void {
    // Check for existing authentication state on app initialization
    this.store.dispatch(AuthActions.checkAuth());
  }
}

