import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { Store } from '@ngrx/store';
import { map, take } from 'rxjs/operators';
import { AppState } from '../store';
import { selectUserRole } from '../store/auth/auth.selectors';

export const adminGuard: CanActivateFn = () => {
  const store: Store<AppState> = inject(Store);
  const router = inject(Router);

  return store.select(selectUserRole).pipe(
    take(1),
    map(role => {
      if (role !== 'ADMIN') {
        router.navigate(['/user']);
        return false;
      }
      return true;
    })
  );
};

