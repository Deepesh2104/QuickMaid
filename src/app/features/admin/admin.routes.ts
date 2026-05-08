import { Routes } from '@angular/router';
import { desktopOnlyGuard } from '@core/guards/desktop-only.guard';
import { authGuard } from '@core/guards/auth.guard';
import { AdminLayoutComponent } from '@layouts/admin-layout/admin-layout.component';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    canActivate: [desktopOnlyGuard, authGuard],
    children: [
      { path: '',          redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./dashboard/dashboard.component').then((m) => m.DashboardComponent) },
      { path: 'bookings',  loadComponent: () => import('./bookings/bookings.component').then((m) => m.BookingsComponent) },
      { path: 'customers', loadComponent: () => import('./customers/customers.component').then((m) => m.CustomersComponent) },
      { path: 'maids',     loadComponent: () => import('./maids/maids.component').then((m) => m.MaidsComponent) },
      { path: 'add-maid',  loadComponent: () => import('./add-maid/add-maid.component').then((m) => m.AddMaidComponent) },
      { path: 'revenue',   loadComponent: () => import('./revenue/revenue.component').then((m) => m.RevenueComponent) },
      { path: 'payouts',   loadComponent: () => import('./payouts/payouts.component').then((m) => m.PayoutsComponent) },
      { path: 'plans',     loadComponent: () => import('./plans/plans.component').then((m) => m.PlansComponent) },
      { path: 'zones',     loadComponent: () => import('./zones/zones.component').then((m) => m.ZonesComponent) },
      { path: 'reviews',   loadComponent: () => import('./reviews/reviews.component').then((m) => m.ReviewsComponent) },
      { path: 'support',   loadComponent: () => import('./support/support.component').then((m) => m.SupportComponent) },
      { path: 'settings',  loadComponent: () => import('./settings/settings.component').then((m) => m.SettingsComponent) },
    ],
  },
];

export default ADMIN_ROUTES;
