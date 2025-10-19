import { Routes } from '@angular/router';

export const USER_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'account',
    pathMatch: 'full'
  },
  {
    path: 'account',
    loadComponent: () => import('./account/account.component').then(m => m.AccountComponent)
  },
  {
    path: 'settings',
    loadComponent: () => import('./settings/settings.component').then(m => m.SettingsComponent)
  },
];

