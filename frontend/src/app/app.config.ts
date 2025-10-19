import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { routes } from './app.routes';
import { reducers } from './store';
import { AuthEffects } from './store/effects/auth.effects';
import { SubscriptionEffects } from './store/effects/subscription.effects';
import { PaymentEffects } from './store/effects/payment.effects';
import { UsersEffects } from './store/effects/users.effects';
import { ChargesEffects } from './store/effects/charges.effects';
import { authInterceptor } from './interceptors/auth.interceptor';
import { errorInterceptor } from './interceptors/error.interceptor';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([authInterceptor, errorInterceptor])
    ),
    provideStore(reducers),
    provideEffects([AuthEffects, SubscriptionEffects, PaymentEffects, UsersEffects, ChargesEffects]),
    provideStoreDevtools({
      maxAge: 25,
      logOnly: environment.production,
    }),
  ]
};

