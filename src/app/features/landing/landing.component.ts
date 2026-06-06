import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter } from 'rxjs';
import { MobileService } from '@core/services/mobile.service';
import { AuthService } from '@core/services/auth.service';
import { SeoService } from '@core/services/seo.service';
import { AppStateService } from '@core/services/app-state.service';
import { ToastService } from '@core/services/toast.service';
import {
  DEFAULT_OG_IMAGE_PATH,
  SITE_ORIGIN,
  TEL_HREF,
  WA_DEFAULT_BOOKING_TEXT,
  buildWhatsAppHref,
  CONTACT_PHONE_E164,
} from '@core/site.constants';

interface Faq {
  q: string;
  a: string;
  open: boolean;
}

export interface CityCard {
  name: string;
  status: 'live' | 'soon';
  eta?: string;
  blurb: string;
}

const LD_LOCAL = 'qm-ld-local-business';
const LD_FAQ = 'qm-ld-faq-page';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css'],
})
export class LandingComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly mobile = inject(MobileService);
  private readonly auth = inject(AuthService);
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly seo = inject(SeoService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly toast = inject(ToastService);
  private readonly appState = inject(AppStateService);

  /** Public CTAs — same number site-wide */
  readonly telHref = TEL_HREF;
  readonly waBook = buildWhatsAppHref(WA_DEFAULT_BOOKING_TEXT);
  readonly waInstant = buildWhatsAppHref(
    'Hi QuickMaid — Raipur mein instant / hourly maid booking chahiye.',
  );
  readonly waMonthly = buildWhatsAppHref(
    'Hi QuickMaid — monthly maid plan Raipur ke liye details chahiye.',
  );
  readonly waAnnual = buildWhatsAppHref(
    'Hi QuickMaid — annual maid plan Raipur ke liye details chahiye.',
  );
  readonly waFooter = buildWhatsAppHref('Hi QuickMaid — Raipur se connect karna hai.');

  readonly faqs = signal<Faq[]>([
    {
      q: 'Kya maid safe aur verified hoti hai?',
      a: 'Haan, 100%. Har maid ka Aadhaar verification, police character certificate, aur background check hota hai.',
      open: false,
    },
    {
      q: 'Maid na aaye toh kya hoga?',
      a: 'Strict No-Show Zero policy hai. 15 min late hone par admin ko alert milta hai, backup maid assign hoti hai.',
      open: false,
    },
    {
      q: 'Koi cheez toot gayi toh kya karein?',
      a: 'Har booking par ₹5,000 tak ki damage guarantee hai.',
      open: false,
    },
    {
      q: 'Kya app chahiye booking ke liye?',
      a: 'Abhi nahi! Sirf WhatsApp karo — Hindi mein message karo, koi problem nahi.',
      open: false,
    },
    {
      q: 'Kya monthly plan pause kar sakte hain?',
      a: 'Bilkul! Monthly plan upto 15 days, annual plan upto 30 days pause kar sakte ho.',
      open: false,
    },
  ]);

  readonly mobileNavOpen = signal(false);

  readonly cities: readonly CityCard[] = [
    { name: 'Raipur', status: 'live', blurb: 'HQ · full maid & cleaning coverage' },
    { name: 'Bhilai', status: 'live', blurb: 'Steel city · monthly plans live' },
    { name: 'Durg', status: 'live', blurb: 'Twin-city slots · same-day booking' },
    { name: 'Nagpur', status: 'soon', eta: 'Q3 2026', blurb: 'Maharashtra expansion waitlist' },
    { name: 'Bilaspur', status: 'soon', eta: 'Q4 2026', blurb: 'CG east corridor pilot' },
    { name: 'Raigarh', status: 'soon', eta: '2027', blurb: 'Industrial belt onboarding' },
  ];

  readonly liveCities = computed(() => this.cities.filter((c) => c.status === 'live'));
  readonly soonCities = computed(() => this.cities.filter((c) => c.status === 'soon'));

  readonly notifyOpen = signal(false);
  readonly notifyCity = signal('');
  readonly notifyEmail = signal('');

  openNotify(city: string): void {
    this.notifyCity.set(city);
    this.notifyEmail.set('');
    this.notifyOpen.set(true);
  }

  closeNotify(): void {
    this.notifyOpen.set(false);
  }

  submitNotify(): void {
    const email = this.notifyEmail().trim();
    if (!email) return;
    this.appState.addWaitlist(this.notifyCity(), email);
    this.closeNotify();
    this.toast.show(`Waitlist saved for ${this.notifyCity()} — we'll email you first`, '📍');
  }

  ngOnInit(): void {
    this.seo.setPage({
      title: 'QuickMaid — Verified Maid & Home Cleaning in Raipur | WhatsApp Booking',
      description:
        'Book Aadhaar-verified maids in Raipur for cleaning, cooking, bartan & laundry. WhatsApp booking, monthly plans, clear prices. Official QuickMaid channels only.',
      canonicalPath: '/',
      ogTitle: 'QuickMaid — Verified Maid & Home Cleaning in Raipur',
      ogDescription:
        'WhatsApp-first booking for verified home help in Raipur. Monthly plans, transparent pricing, no agent commission.',
      ogImagePath: DEFAULT_OG_IMAGE_PATH,
    });

    this.seo.injectJsonLd(LD_LOCAL, {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      name: 'QuickMaid',
      url: SITE_ORIGIN,
      image: `${SITE_ORIGIN}${DEFAULT_OG_IMAGE_PATH}`,
      telephone: CONTACT_PHONE_E164,
      description:
        'On-demand verified home help in Raipur — cleaning, cooking, laundry, bartan, elderly assist. WhatsApp booking.',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Raipur',
        addressRegion: 'Chhattisgarh',
        addressCountry: 'IN',
      },
      areaServed: { '@type': 'City', name: 'Raipur' },
    });

    this.seo.injectJsonLd(LD_FAQ, {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: this.faqs().map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: {
          '@type': 'Answer',
          text: f.a,
        },
      })),
    });

    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        setTimeout(() => this.scrollToHashIfPresent(), 0);
      });
  }

  showAuth(e?: Event): void {
    if (e) e.preventDefault();
    this.mobile.isMobile();
    this.closeMobileNav();
    if (this.auth.isAuthenticated()) {
      void this.router.navigateByUrl('/admin/dashboard');
      return;
    }
    void this.router.navigateByUrl('/auth');
  }

  toggleMobileNav(): void {
    this.mobileNavOpen.update((v) => !v);
    this.syncBodyScroll();
  }

  closeMobileNav(): void {
    this.mobileNavOpen.set(false);
    this.syncBodyScroll();
  }

  @HostListener('window:keydown.escape')
  onEscape(): void {
    if (this.mobileNavOpen()) this.closeMobileNav();
  }

  toggleFaq(idx: number): void {
    this.faqs.update((list) =>
      list.map((f, i) => ({
        ...f,
        open: i === idx ? !f.open : false,
      })),
    );
  }

  ngAfterViewInit(): void {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e, i) => {
          if (e.isIntersecting) {
            setTimeout(() => e.target.classList.add('visible'), i * 90);
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
    );
    this.host.nativeElement.querySelectorAll('.reveal').forEach((el: Element) => io.observe(el));

    setTimeout(() => this.scrollToHashIfPresent(), 0);
    setTimeout(() => this.scrollToHashIfPresent(), 200);
  }

  /** Deep links: `#plans`, `#services`, etc. */
  private scrollToHashIfPresent(): void {
    const fromRouter = this.router.parseUrl(this.router.url).fragment?.trim() ?? '';
    const raw = globalThis.location?.hash?.replace(/^#/, '') ?? '';
    const hash = (fromRouter || raw.split('?')[0] || '').trim();
    if (!hash) return;
    document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  ngOnDestroy(): void {
    document.body.style.overflow = '';
    this.seo.removeJsonLdById(LD_LOCAL);
    this.seo.removeJsonLdById(LD_FAQ);
    this.seo.resetToDefaults();
  }

  private syncBodyScroll(): void {
    document.body.style.overflow = this.mobileNavOpen() ? 'hidden' : '';
  }
}
