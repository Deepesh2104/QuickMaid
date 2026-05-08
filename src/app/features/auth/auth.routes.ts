import { Routes } from '@angular/router';
import { desktopOnlyGuard } from '@core/guards/desktop-only.guard';

export const AUTH_ROUTES: Routes = [
  {
    path: '',
    canActivate: [desktopOnlyGuard],
    loadComponent: () => import('./auth.component').then((m) => m.AuthComponent),
  },
];

export default AUTH_ROUTES;
