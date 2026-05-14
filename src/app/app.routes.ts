import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('@features/landing/landing.routes').then((m) => m.LANDING_ROUTES),
  },
  {
    path: 'auth',
    loadChildren: () => import('@features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  {
    path: 'admin',
    loadChildren: () => import('@features/admin/admin.routes').then((m) => m.ADMIN_ROUTES),
  },
  {
    path: 'book',
    loadComponent: () => import('@features/book/book.component').then((m) => m.BookComponent),
  },
  {
    path: 'partner',
    loadComponent: () => import('@features/partner/partner.component').then((m) => m.PartnerComponent),
  },
  {
    path: 'status',
    loadComponent: () => import('@features/status/status.component').then((m) => m.StatusComponent),
  },
  {
    path: 'about',
    loadComponent: () =>
      import('@features/public-pages/about-page/about-page.component').then((m) => m.AboutPageComponent),
  },
  {
    path: 'terms',
    loadComponent: () => import('@features/seo-pages/terms/terms.component').then((m) => m.TermsComponent),
  },
  {
    path: 'privacy',
    loadComponent: () => import('@features/seo-pages/privacy/privacy.component').then((m) => m.PrivacyComponent),
  },
  {
    path: 'contact',
    loadComponent: () =>
      import('@features/public-pages/contact-page/contact-page.component').then((m) => m.ContactPageComponent),
  },
  { path: '**', redirectTo: '' },
];
