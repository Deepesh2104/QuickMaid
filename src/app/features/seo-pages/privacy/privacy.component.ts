import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '@core/services/seo.service';
import { DEFAULT_OG_IMAGE_PATH } from '@core/site.constants';
import { SeoShellComponent } from '../seo-shell.component';

@Component({
  selector: 'app-privacy',
  standalone: true,
  imports: [SeoShellComponent, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './privacy.component.html',
})
export class PrivacyComponent implements OnInit, OnDestroy {
  private readonly seo = inject(SeoService);

  ngOnInit(): void {
    this.seo.setPage({
      title: 'Privacy Policy | QuickMaid — data, cookies & your rights',
      description:
        'QuickMaid privacy policy: data we collect, how we use it, cookies, retention, and your rights. Raipur, India.',
      canonicalPath: '/privacy',
      ogTitle: 'Privacy Policy | QuickMaid',
      ogDescription: 'How QuickMaid handles personal data — transparency for customers and partners.',
      ogImagePath: DEFAULT_OG_IMAGE_PATH,
    });
  }

  ngOnDestroy(): void {
    this.seo.resetToDefaults();
  }
}
