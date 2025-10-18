import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/user/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'admin',
    loadChildren: () => import('./pages/admin/admin.routes').then(m => m.ADMIN_ROUTES),
    // canActivate: [AuthGuard, AdminGuard] - will add when guards are created
  },
  {
    path: 'user',
    loadChildren: () => import('./pages/user/user.routes').then(m => m.USER_ROUTES),
    // canActivate: [AuthGuard] - will add when guard is created
  },
  {
    path: '**',
    redirectTo: '/login'
  }
];

