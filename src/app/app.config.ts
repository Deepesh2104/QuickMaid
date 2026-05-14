import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    // Path URLs: configure hosting so all routes serve index.html (SPA fallback).
    provideRouter(routes, withComponentInputBinding()),
  ],
};
