import { Routes } from '@angular/router';

export const USER_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard.component').then(m => m.UserDashboardComponent)
  },
  {
    path: 'account',
    loadComponent: () => import('./account/account.component').then(m => m.AccountComponent)
  },
  {
    path: 'settings',
    loadComponent: () => import('./settings/settings.component').then(m => m.SettingsComponent)
  },
  {
    path: 'payments',
    children: [
      {
        path: '',
        loadComponent: () => import('./payments/payments.component').then(m => m.UserPaymentsComponent)
      },
      {
        path: 'new',
        loadComponent: () => import('./payments/new-payment/new-payment.component').then(m => m.NewPaymentComponent)
      }
    ]
  },
];

