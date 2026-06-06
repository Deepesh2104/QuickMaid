import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ToastService } from '@core/services/toast.service';
import { SeoService } from '@core/services/seo.service';
import { DEFAULT_OG_IMAGE_PATH } from '@core/site.constants';

type ServiceStatus = 'operational' | 'degraded' | 'outage';

interface StatusService {
  readonly id: string;
  readonly name: string;
  readonly status: ServiceStatus;
  readonly detail: string;
}

interface StatusIncident {
  readonly id: string;
  readonly title: string;
  readonly when: string;
  readonly status: 'resolved' | 'monitoring' | 'investigating';
  readonly body: string;
}

@Component({
  selector: 'app-status',
  standalone: true,
  imports: [RouterLink, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './status.component.html',
  styleUrls: ['../public-shell.css', './status.component.css'],
})
export class StatusComponent implements OnInit, OnDestroy {
  private readonly seo = inject(SeoService);
  readonly toast = inject(ToastService);

  readonly subscribeEmail = signal('');
  readonly subscribed = signal(false);

  readonly services: readonly StatusService[] = [
    { id: 'booking', name: 'Booking API', status: 'operational', detail: 'p99 180ms' },
    { id: 'payments', name: 'Payments (Razorpay)', status: 'operational', detail: 'Webhooks OK' },
    { id: 'sms', name: 'SMS OTP', status: 'degraded', detail: 'MSG91 latency +40%' },
    { id: 'partner', name: 'Partner app', status: 'operational', detail: 'v2.4.1' },
    { id: 'whatsapp', name: 'WhatsApp routing', status: 'operational', detail: 'Business API' },
    { id: 'admin', name: 'Admin dashboard', status: 'operational', detail: 'All zones' },
  ];

  readonly incidents: readonly StatusIncident[] = [
    {
      id: 'inc-12',
      title: 'SMS OTP delivery delays',
      when: 'Jun 6, 2026 · 9:14 AM IST',
      status: 'monitoring',
      body: 'Provider latency spike. Fallback email OTP enabled for login.',
    },
    {
      id: 'inc-11',
      title: 'Scheduled maintenance — payouts',
      when: 'Jun 4, 2026 · 2:00–3:00 AM IST',
      status: 'resolved',
      body: 'Partner payout batch completed. No data loss.',
    },
    {
      id: 'inc-10',
      title: 'Booking API elevated errors',
      when: 'May 28, 2026 · 6:40 PM IST',
      status: 'resolved',
      body: 'Hotfix deployed. Root cause: cache invalidation on zone deploy.',
    },
  ];

  readonly overallStatus = computed((): ServiceStatus => {
    if (this.services.some((s) => s.status === 'outage')) return 'outage';
    if (this.services.some((s) => s.status === 'degraded')) return 'degraded';
    return 'operational';
  });

  readonly overallLabel = computed(() => {
    const s = this.overallStatus();
    return s === 'operational' ? 'All systems operational' : s === 'degraded' ? 'Partial degradation' : 'Major outage';
  });

  ngOnInit(): void {
    this.seo.setPage({
      title: 'System Status | QuickMaid',
      description:
        'QuickMaid platform status — bookings, WhatsApp routing, and partner app availability. Raipur operations.',
      canonicalPath: '/status',
      ogTitle: 'System Status | QuickMaid',
      ogDescription: 'Live status for QuickMaid services and infrastructure.',
      ogImagePath: DEFAULT_OG_IMAGE_PATH,
    });
  }

  ngOnDestroy(): void {
    this.seo.resetToDefaults();
  }

  statusLabel(s: ServiceStatus): string {
    return s === 'operational' ? 'Operational' : s === 'degraded' ? 'Degraded' : 'Outage';
  }

  incidentStatusLabel(s: StatusIncident['status']): string {
    const map = { resolved: 'Resolved', monitoring: 'Monitoring', investigating: 'Investigating' };
    return map[s];
  }

  subscribe(): void {
    const email = this.subscribeEmail().trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      this.toast.show('Valid email daalein', '⚠️');
      return;
    }
    this.subscribed.set(true);
    this.toast.show('Status updates subscribed', '🔔');
  }
}
