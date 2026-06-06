import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet, NavigationEnd } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, startWith } from 'rxjs';
import { ToastService } from '@core/services/toast.service';
import { AuthService } from '@core/services/auth.service';
import { AppStateService } from '@core/services/app-state.service';
import { ADMIN_NAV, BREADCRUMB_LABELS, NavItem, NavSection } from './admin-nav.config';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './admin-layout.component.html',
})
export class AdminLayoutComponent {
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  readonly auth = inject(AuthService);
  private readonly appState = inject(AppStateService);

  readonly nav = computed((): readonly NavSection[] =>
    ADMIN_NAV.map((section) => ({
      ...section,
      items: section.items.map((item) => this.withLiveBadge(item)),
    })),
  );

  private withLiveBadge(item: NavItem): NavItem {
    if (item.path === 'bookings') {
      return { ...item, badge: this.appState.bookingsBadge(), badgeTone: 'default' };
    }
    if (item.path === 'maids') {
      const b = this.appState.maidsBadge();
      return b ? { ...item, badge: b, badgeTone: 'red' } : { ...item, badge: undefined };
    }
    if (item.path === 'support') {
      return { ...item, badge: this.appState.supportBadge(), badgeTone: 'red' };
    }
    if (item.path === 'campaigns') {
      const n = this.appState.waitlistCount();
      return n > 0 ? { ...item, badge: String(n), badgeTone: 'default' } : { ...item, badge: undefined };
    }
    return item;
  }

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
    this.auth.logout();
    void this.router.navigateByUrl('/');
    this.toast.show('Logged out successfully', '👋');
  }

  notify(): void {
    void this.router.navigateByUrl('/admin/notifications');
  }
}
