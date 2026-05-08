import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { MobileService } from '../services/mobile.service';

/**
 * Allows navigation only on desktop-class viewports.
 * On mobile, the global <app-mobile-block> overlay is shown instead;
 * this guard simply lets the route render so that overlay can position correctly.
 *
 * Kept as a functional guard for forward-compat (Angular 16+).
 */
export const desktopOnlyGuard: CanActivateFn = (): boolean | UrlTree => {
  inject(MobileService);
  inject(Router);
  return true;
};
