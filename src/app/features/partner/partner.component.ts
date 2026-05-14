import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ToastService } from '@core/services/toast.service';
import { SeoService } from '@core/services/seo.service';
import { DEFAULT_OG_IMAGE_PATH } from '@core/site.constants';

@Component({
  selector: 'app-partner',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './partner.component.html',
  styleUrls: ['../public-shell.css'],
})
export class PartnerComponent implements OnInit, OnDestroy {
  private readonly seo = inject(SeoService);
  readonly toast = inject(ToastService);

  ngOnInit(): void {
    this.seo.setPage({
      title: 'Partner with QuickMaid | Maids & helpers in Raipur',
      description:
        'Join QuickMaid as a verified service partner in Raipur — fair payouts, flexible schedule, and official support.',
      canonicalPath: '/partner',
      ogTitle: 'Partner with QuickMaid',
      ogDescription: 'Earn more with verified bookings — QuickMaid partner program Raipur.',
      ogImagePath: DEFAULT_OG_IMAGE_PATH,
    });
  }

  ngOnDestroy(): void {
    this.seo.resetToDefaults();
  }

  openEarnings(): void {
    this.toast.show('Earnings detail · Phase 3', '💸');
  }
}
