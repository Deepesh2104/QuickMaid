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

  readonly waBook = buildWhatsAppHref(WA_DEFAULT_BOOKING_TEXT);
  readonly waSupport = buildWhatsAppHref(
    'Hi QuickMaid — support chahiye. Area + booking detail / issue short mein likhein.',
  );
  readonly waPartner = buildWhatsAppHref(
    'Hi QuickMaid — partner / didi onboarding ya payout ke baare mein puchna hai.',
  );
  readonly telHref = TEL_HREF;

  ngOnInit(): void {
    this.seo.setPage({
      title: 'Contact QuickMaid | Official WhatsApp, email & phone — Raipur',
      description:
        'Sirf official channels: WhatsApp booking & support, email for legal/invoices, phone Mon–Sun. Phishing se bachne ke liye random numbers / links par payment na karein.',
      canonicalPath: '/contact',
      ogTitle: 'Contact QuickMaid — official touchpoints',
      ogDescription:
        'WhatsApp-first booking, Hindi support, clear escalation — Raipur, India. Official QuickMaid contact page.',
      ogImagePath: DEFAULT_OG_IMAGE_PATH,
    });
  }

  ngOnDestroy(): void {
    this.seo.resetToDefaults();
  }
}
