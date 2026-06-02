import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
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

export interface QmAboutFaq {
  q: string;
  a: string;
}

@Component({
  selector: 'app-about-page',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './about-page.component.html',
  styleUrls: ['../qm-public.css', './about-page.component.css'],
})
export class AboutPageComponent implements OnInit, OnDestroy, AfterViewInit {
  private readonly seo = inject(SeoService);
  private readonly host = inject(ElementRef<HTMLElement>);

  readonly telHref = TEL_HREF;
  readonly waBook = buildWhatsAppHref(WA_DEFAULT_BOOKING_TEXT);
  readonly waAbout = buildWhatsAppHref(
    'Hi QuickMaid — aapke baare mein aur jaanna hai. Raipur service & verification ke baare mein batayein.',
  );

  readonly trustPills = [
    'Aadhaar verified',
    'OTP start & end',
    '₹0 agent fee',
    'WhatsApp-first',
  ] as const;

  readonly compareRows = [
    { aspect: 'Booking', old: 'Phone tag, agent middleman', qm: 'WhatsApp / web — clear steps' },
    { aspect: 'Pricing', old: 'Hidden cuts & surprises', qm: 'Plans on site — jo dikhe wahi' },
    { aspect: 'Trust', old: 'Word-of-mouth only', qm: 'Profile + OTP + ratings' },
    { aspect: 'Partner pay', old: 'Commission deducted', qm: 'More earning direct to didi' },
    { aspect: 'Support', old: 'Random numbers', qm: 'Official channels only' },
  ] as const;

  readonly testimonials = [
    {
      quote:
        'Pehli baar booking par hi profile aur OTP mile — ghar wale confident the. Monthly plan switch bhi easy tha.',
      name: 'Priya S.',
      meta: 'Tatibandh · Monthly cleaning',
      stars: '5',
    },
    {
      quote:
        'Agent ke bina zyada earning milti hai. Schedule WhatsApp par clear rehta hai, payout time par.',
      name: 'Savita D.',
      meta: 'Partner · 4.9 ★ verified',
      stars: '5',
    },
    {
      quote:
        'Office se ghar aate hi slot confirm — support ne phishing wale fake links se bachaya.',
      name: 'Rahul M.',
      meta: 'Civil Lines · Instant cook',
      stars: '5',
    },
  ] as const;

  readonly zones = [
    { name: 'Tatibandh', load: 'High demand', pct: 88 },
    { name: 'Civil Lines', load: 'Growing', pct: 72 },
    { name: 'Shankar Nagar', load: 'Stable', pct: 61 },
    { name: 'Pandri', load: 'Expanding', pct: 54 },
    { name: 'Mowa', load: 'New slots', pct: 48 },
    { name: 'Khamtarai', load: 'Waitlist', pct: 42 },
  ] as const;

  readonly principles = [
    {
      title: 'Clarity over chaos',
      body: 'Har booking par visible steps — kaun, kab, kitna. Koi andhera nahi.',
      tag: '01',
    },
    {
      title: 'Respect both sides',
      body: 'Family aur partner dono ke liye official, polite communication.',
      tag: '02',
    },
    {
      title: 'Raipur depth first',
      body: 'Ek city mein strong ops — phir hi expansion. Quality > speed.',
      tag: '03',
    },
    {
      title: 'Safety by design',
      body: 'Verification, OTP, damage cover (T&C) — trust stack built-in.',
      tag: '04',
    },
  ] as const;

  readonly faqs: readonly QmAboutFaq[] = [
    {
      q: 'QuickMaid sirf Raipur mein hai?',
      a: 'Haan — abhi focus Raipur & nearby hubs par hai. Jab ops rock-solid ho tab hi naye cities.',
    },
    {
      q: 'Booking ke liye kya official channel hai?',
      a: 'Is website par WhatsApp / web book buttons, Contact page, aur verified WhatsApp line — koi random agent nahi.',
    },
    {
      q: 'Partner verification kaise hoti hai?',
      a: 'Identity checks, references, aur field traceability onboarding par — profile aapko match se pehle dikhti hai.',
    },
    {
      q: 'Agent commission really ₹0 hai?',
      a: 'Customer side par agent fee nahi. Partner ko zyada earning seedha payout flow ke through (policy ke hisaab se).',
    },
    {
      q: 'Agar visit start na ho ya issue aaye?',
      a: 'OTP start tabhi count hota hai jab aap confirm karein. Support official channels par — details Terms mein.',
    },
  ];

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

  ngAfterViewInit(): void {
    const root = this.host.nativeElement;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      root.querySelectorAll('.qm-reveal').forEach((el: Element) => el.classList.add('qm-reveal--in'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('qm-reveal--in');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -32px 0px' },
    );
    root.querySelectorAll('.qm-reveal').forEach((el: Element) => io.observe(el));
  }

  ngOnDestroy(): void {
    this.seo.resetToDefaults();
  }
}
