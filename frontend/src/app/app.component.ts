import { Component, OnInit, inject } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, take } from 'rxjs/operators';
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
  private router = inject(Router);

  ngOnInit(): void {
    // Wait for initial navigation to complete before checkAuth - ensures router.url is correct for public page redirect logic
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      take(1)
    ).subscribe(() => {
      this.store.dispatch(AuthActions.checkAuth());
    });
  }
}

