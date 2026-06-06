import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewEncapsulation,
  inject,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { SeoService } from '@core/services/seo.service';
import {
  DEFAULT_OG_IMAGE_PATH,
  TEL_HREF,
  WA_DEFAULT_BOOKING_TEXT,
  buildWhatsAppHref,
} from '@core/site.constants';

export interface QmContactFaq {
  q: string;
  a: string;
}

export interface QmWaTemplate {
  label: string;
  hint: string;
  message: string;
}

export interface QmContactTopic {
  value: string;
  label: string;
}

export interface QmContactForm {
  name: string;
  phone: string;
  email: string;
  topic: string;
  area: string;
  message: string;
}

@Component({
  selector: 'app-contact-page',
  standalone: true,
  imports: [FormsModule, RouterLink, RouterLinkActive],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './contact-page.component.html',
  styleUrls: ['../qm-public.css', './contact-page.component.css'],
})
export class ContactPageComponent implements OnInit, OnDestroy, AfterViewInit {
  private readonly seo = inject(SeoService);
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly phoneDisplay = '+91 98765 43210';
  readonly telHref = TEL_HREF;
  readonly email = 'support@quickmaid.in';

  readonly waBook = buildWhatsAppHref(WA_DEFAULT_BOOKING_TEXT);
  readonly waSupport = buildWhatsAppHref(
    'Hi QuickMaid — support chahiye. Area + booking detail / issue short mein likhein.',
  );
  readonly waPartner = buildWhatsAppHref(
    'Hi QuickMaid — partner / didi onboarding ya payout ke baare mein puchna hai.',
  );

  readonly hours = [
    { day: 'Mon – Sun', time: '8:00 AM – 8:00 PM IST', note: 'WhatsApp + phone desk' },
    { day: 'Email', time: '24–48h typical', note: 'Legal, invoice, privacy' },
    { day: 'Urgent visit-day', time: '~15 min WA', note: 'Working hours · best effort' },
  ] as const;

  readonly waTemplates: readonly QmWaTemplate[] = [
    {
      label: 'New booking',
      hint: 'Service + slot + area',
      message:
        'Hi QuickMaid — Raipur se booking karna hai.\nService: \nDate/slot: \nArea: \nAddress (landmark): ',
    },
    {
      label: 'Reschedule',
      hint: 'Old slot + new preference',
      message:
        'Hi QuickMaid — reschedule chahiye.\nBooking ref (if any): \nNew date/slot: \nArea: ',
    },
    {
      label: 'Support / issue',
      hint: '1–2 lines + photo optional',
      message:
        'Hi QuickMaid — support.\nIssue: \nVisit date/time: \nArea: ',
    },
    {
      label: 'Partner onboarding',
      hint: 'Name + zone + experience',
      message:
        'Hi QuickMaid — partner join karna hai.\nName: \nArea/zone: \nExperience: ',
    },
  ];

  readonly routingSteps = [
    {
      step: '01',
      title: 'Book / badlo',
      body: 'WhatsApp booking line ya /book — service, slot, pata clear likho.',
      cta: 'WhatsApp book',
      href: this.waBook,
      external: true,
    },
    {
      step: '02',
      title: 'Visit-day help',
      body: 'Support WhatsApp — time + area. OTP issues ya delay yahi line.',
      cta: 'Support chat',
      href: this.waSupport,
      external: true,
    },
    {
      step: '03',
      title: 'Legal / invoice',
      body: 'Email — subject: Invoice, Privacy, Partnership. Non-urgent.',
      cta: this.email,
      href: `mailto:${this.email}`,
      external: false,
    },
  ] as const;

  readonly phishRules = [
    'Sirf is page ke WhatsApp, phone (+91 98765 43210), aur email bookmark karo.',
    'Random “new company number” ya Telegram group par payment mat karo.',
    'Team kabhi OTP, UPI PIN, ya screen-share nahi maangti.',
    'Advance maangne wale “agent” links — ignore. Official flow follow karo.',
  ] as const;

  readonly faqs: readonly QmContactFaq[] = [
    {
      q: 'Sabse fast reply kahan milti hai?',
      a: 'WhatsApp booking line — working hours mein typically ~15 minutes. Email 24–48 hours.',
    },
    {
      q: 'Kya main phone par bhi book kar sakta hoon?',
      a: 'Haan — Mon–Sun 8 AM–8 PM IST desk. Lekin slot confirm ke liye WhatsApp zyada clear rehta hai.',
    },
    {
      q: 'Partner payout / onboarding kiske liye?',
      a: 'Partner WhatsApp line — name, zone, experience bhejo. Family booking ke liye alag booking line.',
    },
    {
      q: 'Fake QuickMaid message kaise pehchanun?',
      a: 'Number mismatch, OTP/PIN maangna, ya unknown UPI — red flags. Doubt par isi page se call karke verify karo.',
    },
    {
      q: 'Office visit possible hai?',
      a: 'Ops Raipur hub se remote-first hain — pehle WhatsApp/email. Walk-in by appointment only (demo).',
    },
  ];

  copiedLabel: string | null = null;

  readonly contactTopics: readonly QmContactTopic[] = [
    { value: 'booking', label: 'New booking' },
    { value: 'reschedule', label: 'Reschedule / change slot' },
    { value: 'support', label: 'Support / complaint' },
    { value: 'partner', label: 'Partner onboarding' },
    { value: 'legal', label: 'Legal / privacy' },
    { value: 'other', label: 'Other' },
  ];

  readonly raipurAreas = [
    'Tatibandh',
    'Civil Lines',
    'Shankar Nagar',
    'Pandri',
    'Mowa',
    'Khamtarai',
    'Other / nearby',
  ] as const;

  contactForm: QmContactForm = {
    name: '',
    phone: '',
    email: '',
    topic: 'booking',
    area: '',
    message: '',
  };

  formSubmitted = false;
  formError = '';

  ngOnInit(): void {
    this.seo.setPage({
      title: 'Contact QuickMaid | Official WhatsApp, email & phone — Raipur',
      description:
        'Sirf official channels: WhatsApp booking & support, email for legal/invoices, phone Mon–Sun 8–8 IST. Message templates aur phishing safety guide.',
      canonicalPath: '/contact',
      ogTitle: 'Contact QuickMaid — official touchpoints',
      ogDescription:
        'WhatsApp-first booking, Hindi support, clear escalation — Raipur, India. Official QuickMaid contact page.',
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

  waHrefFor(message: string): string {
    return buildWhatsAppHref(message);
  }

  submitContactForm(): void {
    const name = this.contactForm.name.trim();
    const phone = this.contactForm.phone.trim();
    const message = this.contactForm.message.trim();

    if (!name || !phone || !message) {
      this.formError = 'Name, phone aur message zaroori hain.';
      this.formSubmitted = false;
      this.cdr.markForCheck();
      return;
    }

    const topicLabel =
      this.contactTopics.find((t) => t.value === this.contactForm.topic)?.label ?? this.contactForm.topic;
    const lines = [
      'Hi QuickMaid — contact form se message bheja hai.',
      '',
      `Name: ${name}`,
      `Phone: ${phone}`,
      this.contactForm.email.trim() ? `Email: ${this.contactForm.email.trim()}` : null,
      `Topic: ${topicLabel}`,
      this.contactForm.area ? `Area: ${this.contactForm.area}` : null,
      '',
      'Message:',
      message,
    ].filter((line): line is string => line !== null);

    const waMessage = lines.join('\n');
    window.open(buildWhatsAppHref(waMessage), '_blank', 'noopener,noreferrer');

    this.formError = '';
    this.formSubmitted = true;
    this.cdr.markForCheck();
  }

  sendViaEmail(): void {
    const name = this.contactForm.name.trim();
    const phone = this.contactForm.phone.trim();
    const message = this.contactForm.message.trim();

    if (!name || !phone || !message) {
      this.formError = 'Pehle form bharo, phir email bhejo.';
      this.cdr.markForCheck();
      return;
    }

    const topicLabel =
      this.contactTopics.find((t) => t.value === this.contactForm.topic)?.label ?? this.contactForm.topic;
    const subject = encodeURIComponent(`QuickMaid contact — ${topicLabel}`);
    const body = encodeURIComponent(
      `Name: ${name}\nPhone: ${phone}\nEmail: ${this.contactForm.email || '—'}\nTopic: ${topicLabel}\nArea: ${this.contactForm.area || '—'}\n\n${message}`,
    );
    window.location.href = `mailto:${this.email}?subject=${subject}&body=${body}`;
  }

  resetContactForm(): void {
    this.contactForm = {
      name: '',
      phone: '',
      email: '',
      topic: 'booking',
      area: '',
      message: '',
    };
    this.formSubmitted = false;
    this.formError = '';
    this.cdr.markForCheck();
  }

  async copyTemplate(t: QmWaTemplate): Promise<void> {
    try {
      await navigator.clipboard.writeText(t.message);
      this.copiedLabel = t.label;
      this.cdr.markForCheck();
      setTimeout(() => {
        if (this.copiedLabel === t.label) {
          this.copiedLabel = null;
          this.cdr.markForCheck();
        }
      }, 2200);
    } catch {
      /* fallback: open WA with prefilled text */
      window.open(this.waHrefFor(t.message), '_blank', 'noopener,noreferrer');
    }
  }
}
