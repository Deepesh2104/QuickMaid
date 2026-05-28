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
import {
  DEFAULT_OG_IMAGE_PATH,
  TEL_HREF,
  WA_DEFAULT_BOOKING_TEXT,
  buildWhatsAppHref,
} from '@core/site.constants';

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

  readonly telHref = TEL_HREF;
  readonly waBook = buildWhatsAppHref(WA_DEFAULT_BOOKING_TEXT);
  readonly waAbout = buildWhatsAppHref(
    'Hi QuickMaid — aapke baare mein aur jaanna hai. Raipur service & verification ke baare mein batayein.',
  );

  ngOnInit(): void {
    this.seo.setPage({
      title: 'About QuickMaid | Mission, trust & WhatsApp booking in Raipur',
      description:
        'QuickMaid Raipur-first home-help platform hai — Aadhaar-verified partners, transparent pricing, ₹0 agent fee, aur WhatsApp-first booking. Hamara mission, values aur trust stack yahan padhein.',
      canonicalPath: '/about',
      ogTitle: 'About QuickMaid — verified home help in Raipur',
      ogDescription:
        'Mission, safety stack, aur families + partners dono ke liye clear promise. Official QuickMaid story.',
      ogImagePath: DEFAULT_OG_IMAGE_PATH,
    });
  }

  ngOnDestroy(): void {
    this.seo.resetToDefaults();
  }
}
