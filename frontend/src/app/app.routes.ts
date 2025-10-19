import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';

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
    path: 'auth/setup-password',
    loadComponent: () => import('./pages/auth/setup-password/setup-password.component').then(m => m.SetupPasswordComponent)
  },
  {
    path: 'admin',
    loadChildren: () => import('./pages/admin/admin.routes').then(m => m.ADMIN_ROUTES),
    canActivate: [authGuard, adminGuard]
  },
  {
    path: 'user',
    loadChildren: () => import('./pages/user/user.routes').then(m => m.USER_ROUTES),
    canActivate: [authGuard]
  },
  {
    path: '**',
    redirectTo: '/login'
  }
];

