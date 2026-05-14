import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '@core/services/seo.service';
import { DEFAULT_OG_IMAGE_PATH } from '@core/site.constants';

@Component({
  selector: 'app-status',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './status.component.html',
  styleUrls: ['../public-shell.css'],
})
export class StatusComponent implements OnInit, OnDestroy {
  private readonly seo = inject(SeoService);

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
}
