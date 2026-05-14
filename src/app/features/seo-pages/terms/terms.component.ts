import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '@core/services/seo.service';
import { DEFAULT_OG_IMAGE_PATH } from '@core/site.constants';
import { SeoShellComponent } from '../seo-shell.component';

@Component({
  selector: 'app-terms',
  standalone: true,
  imports: [SeoShellComponent, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './terms.component.html',
})
export class TermsComponent implements OnInit, OnDestroy {
  private readonly seo = inject(SeoService);

  ngOnInit(): void {
    this.seo.setPage({
      title: 'Terms & Conditions | QuickMaid — bookings, payments & liability',
      description:
        'QuickMaid terms of service: bookings, payments, cancellations, liability, and contact. Raipur, Chhattisgarh, India.',
      canonicalPath: '/terms',
      ogTitle: 'Terms & Conditions | QuickMaid',
      ogDescription: 'Platform rules for customers and service partners — QuickMaid India.',
      ogImagePath: DEFAULT_OG_IMAGE_PATH,
    });
  }

  ngOnDestroy(): void {
    this.seo.resetToDefaults();
  }
}
