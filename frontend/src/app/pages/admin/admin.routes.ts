import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'subscriptions',
    children: [
      {
        path: '',
        loadComponent: () => import('./subscriptions/subscriptions.component').then(m => m.SubscriptionsComponent)
      },
      {
        path: ':id',
        loadComponent: () => import('./subscriptions/subscription-details/subscription-details.component').then(m => m.SubscriptionDetailsComponent)
      }
    ]
  },
  {
    path: 'users',
    loadComponent: () => import('./users/users.component').then(m => m.UsersComponent)
  },
  {
    path: 'charges',
    loadComponent: () => import('./charges/charges.component').then(m => m.ChargesComponent)
  },
  {
    path: 'payments',
    loadComponent: () => import('./payments/payments.component').then(m => m.PaymentsComponent)
  },
];

