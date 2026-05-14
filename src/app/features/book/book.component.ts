import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ToastService } from '@core/services/toast.service';
import { SeoService } from '@core/services/seo.service';
import { DEFAULT_OG_IMAGE_PATH } from '@core/site.constants';

@Component({
  selector: 'app-book',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './book.component.html',
  styleUrls: ['../public-shell.css'],
})
export class BookComponent implements OnInit, OnDestroy {
  private readonly seo = inject(SeoService);
  readonly toast = inject(ToastService);
  readonly minDate = new Date().toISOString().slice(0, 10);
  readonly service = signal('Deep clean');
  readonly when = signal('');
  readonly address = signal('');

  ngOnInit(): void {
    this.seo.setPage({
      title: 'Book a Visit | QuickMaid — home cleaning in Raipur',
      description:
        'Web booking flow for QuickMaid Raipur — choose service, date, and address. Verified maids, transparent pricing.',
      canonicalPath: '/book',
      ogTitle: 'Book a Visit | QuickMaid',
      ogDescription: 'Request a home visit in Raipur — QuickMaid booking.',
      ogImagePath: DEFAULT_OG_IMAGE_PATH,
    });
  }

  ngOnDestroy(): void {
    this.seo.resetToDefaults();
  }

  submit(): void {
    if (!this.when().trim() || !this.address().trim()) {
      this.toast.show('Date aur address daalein', '⚠️');
      return;
    }
    this.toast.show('Booking request queued · Phase 3 API', '✅');
  }
}
