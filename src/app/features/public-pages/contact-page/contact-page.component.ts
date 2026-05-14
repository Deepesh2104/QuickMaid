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
import { DEFAULT_OG_IMAGE_PATH, TEL_HREF, WA_DEFAULT_BOOKING_TEXT, buildWhatsAppHref } from '@core/site.constants';

@Component({
  selector: 'app-contact-page',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './contact-page.component.html',
  styleUrls: ['../qm-public.css'],
})
export class ContactPageComponent implements OnInit, OnDestroy {
  private readonly seo = inject(SeoService);

  readonly waHref = buildWhatsAppHref(WA_DEFAULT_BOOKING_TEXT);
  readonly telHref = TEL_HREF;

  ngOnInit(): void {
    this.seo.setPage({
      title: 'Contact QuickMaid | Official WhatsApp, email & phone (Raipur)',
      description:
        'Official QuickMaid touchpoints — WhatsApp, email, and phone for bookings and support in Raipur, India. Phishing se bachne ke liye sirf in channels par trust karein.',
      canonicalPath: '/contact',
      ogTitle: 'Contact QuickMaid',
      ogDescription: 'Official channels for WhatsApp booking, legal, and support — Raipur, India.',
      ogImagePath: DEFAULT_OG_IMAGE_PATH,
    });
  }

  ngOnDestroy(): void {
    this.seo.resetToDefaults();
  }
}
