import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Unauthorized - redirect to login
        localStorage.removeItem('token');
        router.navigate(['/login']);
      } else if (error.status === 403) {
        // Forbidden - redirect to appropriate page
        router.navigate(['/']);
      }

      return throwError(() => error);
    })
  );
};

