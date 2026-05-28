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
  selector: 'app-privacy',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './privacy.component.html',
  styleUrls: ['../../public-pages/qm-public.css', '../../public-pages/qm-legal.css'],
})
export class PrivacyComponent implements OnInit, OnDestroy {
  private readonly seo = inject(SeoService);

  readonly lastUpdated = '2026-05-14';

  ngOnInit(): void {
    this.seo.setPage({
      title: 'Privacy Policy | QuickMaid — data, cookies & your rights',
      description:
        'QuickMaid privacy policy: data we collect, use, sharing, cookies, retention, your rights, grievance — India-aligned transparency.',
      canonicalPath: '/privacy',
      ogTitle: 'Privacy Policy | QuickMaid',
      ogDescription: 'How QuickMaid handles personal data — customers & partners.',
      ogImagePath: DEFAULT_OG_IMAGE_PATH,
    });
  }

  ngOnDestroy(): void {
    this.seo.resetToDefaults();
  }
}
