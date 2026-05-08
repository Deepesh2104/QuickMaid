import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, startWith } from 'rxjs';
import { MobileService } from '@core/services/mobile.service';

@Component({
  selector: 'app-mobile-block',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div id="mobile-block" [class.show]="visible()">
      <div class="mb-logo">
        <div class="mb-logo-box">🏠</div>
        <span class="mb-logo-text">QuickMaid</span>
      </div>
      <div class="mb-icon-wrap">💻</div>
      <div class="mb-title">Admin Portal ke liye<br><em>Bada Screen Chahiye</em></div>
      <p class="mb-desc">Admin dashboard mobile par use nahi ho sakta. Behtar experience ke liye in devices par open karein:</p>
      <div class="mb-devices">
        <div class="mb-device"><div class="mb-device-ico">🖥️</div><div class="mb-device-lbl">Desktop</div></div>
        <div class="mb-device"><div class="mb-device-ico">💻</div><div class="mb-device-lbl">Laptop</div></div>
        <div class="mb-device"><div class="mb-device-ico">🖱️</div><div class="mb-device-lbl">Computer</div></div>
        <div class="mb-device"><div class="mb-device-ico">📱</div><div class="mb-device-lbl">Tablet (bada)</div></div>
      </div>
      <button class="mb-back-btn" (click)="goBack()">← Landing Page Par Wapas Jao</button>
      <div class="mb-hint">Minimum screen width 1024px chahiye</div>
    </div>
  `,
})
export class MobileBlockComponent {
  private readonly router = inject(Router);
  private readonly mobile = inject(MobileService);

  private readonly url = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => e.urlAfterRedirects),
      startWith(this.router.url),
    ),
    { initialValue: this.router.url },
  );

  readonly visible = computed(() => {
    const u = this.url() || '';
    return this.mobile.isMobile() && (u.startsWith('/admin') || u.startsWith('/auth'));
  });

  goBack(): void {
    this.router.navigateByUrl('/');
  }
}
