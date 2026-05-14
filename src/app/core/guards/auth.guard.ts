import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthService } from '@core/services/auth.service';

/**
 * Blocks `/admin` until a session exists (sessionStorage prototype).
 * Replace with real tokens + refresh when the API is ready.
 */
export const authGuard: CanActivateFn = (_route, state): boolean | UrlTree => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isAuthenticated()) return true;
  return router.createUrlTree(['/auth'], { queryParams: { returnUrl: state.url } });
};
