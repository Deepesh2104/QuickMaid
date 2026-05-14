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
  selector: 'app-about-page',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './about-page.component.html',
  styleUrls: ['../qm-public.css'],
})
export class AboutPageComponent implements OnInit, OnDestroy {
  private readonly seo = inject(SeoService);

  ngOnInit(): void {
    this.seo.setPage({
      title: 'About QuickMaid | Verified maids & home help in Raipur',
      description:
        'QuickMaid — Raipur-first verified partner network, transparent payouts, and WhatsApp-first booking for busy families.',
      canonicalPath: '/about',
      ogTitle: 'About QuickMaid | Raipur',
      ogDescription:
        'Verified partners, transparent payouts, WhatsApp-first booking — QuickMaid story and values.',
      ogImagePath: DEFAULT_OG_IMAGE_PATH,
    });
  }

  ngOnDestroy(): void {
    this.seo.resetToDefaults();
  }
}
