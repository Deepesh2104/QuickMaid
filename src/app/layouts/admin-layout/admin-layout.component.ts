import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet, NavigationEnd } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, startWith } from 'rxjs';
import { ToastService } from '@core/services/toast.service';
import { ThemePickerComponent } from '@shared/ui/theme-picker/theme-picker.component';
import { ADMIN_NAV, BREADCRUMB_LABELS } from './admin-nav.config';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ThemePickerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './admin-layout.component.html',
})
export class AdminLayoutComponent {
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  readonly nav = ADMIN_NAV;

  private readonly url = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => e.urlAfterRedirects),
      startWith(this.router.url),
    ),
    { initialValue: this.router.url },
  );

  readonly breadcrumb = computed(() => {
    const u = this.url() || '';
    const seg = u.split('/').filter(Boolean).pop() || 'dashboard';
    return BREADCRUMB_LABELS[seg] ?? 'Dashboard';
  });

  doLogout(): void {
    this.router.navigateByUrl('/');
    this.toast.show('Logged out successfully', '👋');
  }

  notify(): void {
    this.toast.show('3 new booking alerts!', '🔔');
  }
}
