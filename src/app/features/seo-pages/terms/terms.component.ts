import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  ViewEncapsulation,
  inject,
} from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { SeoService } from '@core/services/seo.service';
import { DEFAULT_OG_IMAGE_PATH } from '@core/site.constants';

@Component({
  selector: 'app-terms',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './terms.component.html',
  styleUrls: ['../../public-pages/qm-public.css'],
})
export class TermsComponent implements OnInit, OnDestroy {
  private readonly seo = inject(SeoService);

  readonly lastUpdated = '2026-05-14';

  ngOnInit(): void {
    this.seo.setPage({
      title: 'Terms & Conditions | QuickMaid — bookings, payments & liability',
      description:
        'QuickMaid terms of service: bookings, payments, cancellations, conduct, liability, governing law (Raipur, India). Official legal page.',
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
