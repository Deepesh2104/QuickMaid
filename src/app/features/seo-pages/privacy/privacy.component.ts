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
import { RouterLink, RouterLinkActive } from '@angular/router';
import { SeoService } from '@core/services/seo.service';
import { DEFAULT_OG_IMAGE_PATH } from '@core/site.constants';

export interface QmPrivacyTocItem {
  id: string;
  num: string;
  label: string;
}

export interface QmPrivacySummaryItem {
  title: string;
  body: string;
  icon: string;
}

export interface QmPrivacyFaq {
  q: string;
  a: string;
}

export interface QmLegalQuickFact {
  label: string;
  value: string;
  note: string;
}

@Component({
  selector: 'app-privacy',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './privacy.component.html',
  styleUrls: [
    '../../public-pages/qm-public.css',
    '../../public-pages/qm-legal.css',
    './privacy.component.css',
  ],
})
export class PrivacyComponent implements OnInit, OnDestroy, AfterViewInit {
  private readonly seo = inject(SeoService);
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly cdr = inject(ChangeDetectorRef);

  private scrollSpyIo: IntersectionObserver | null = null;
  private onScroll: (() => void) | null = null;

  readonly lastUpdated = '2026-05-14';

  activeTocId = 'p-intro';
  readingProgress = 0;

  readonly quickFacts: readonly QmLegalQuickFact[] = [
    { label: 'Framework', value: 'DPDP direction', note: 'India privacy alignment' },
    { label: 'Data sales', value: 'Never sold', note: 'No broker mass marketing' },
    { label: 'Region', value: 'Raipur, India', note: 'Operational base' },
  ];

  readonly trustPoints = [
    'HTTPS + access controls',
    'Processors under contract',
    'Deletion where law permits',
  ] as const;

  readonly summary: readonly QmPrivacySummaryItem[] = [
    {
      icon: '01',
      title: 'What we collect',
      body: 'Identity, booking, support, and technical logs only where needed for service.',
    },
    {
      icon: '02',
      title: 'How we use it',
      body: 'Dispatch, support, fraud prevention, legal compliance, and product reliability.',
    },
    {
      icon: '03',
      title: 'When we share',
      body: 'With trusted processors/contracts or lawful requests. No mass data selling.',
    },
    {
      icon: '04',
      title: 'Your controls',
      body: 'Access, correction, consent withdrawal, and deletion requests where law permits.',
    },
  ];

  readonly toc: readonly QmPrivacyTocItem[] = [
    { id: 'p-intro', num: '—', label: 'Intro' },
    { id: 'p-collect', num: '1', label: 'Data we collect' },
    { id: 'p-use', num: '2', label: 'Use cases' },
    { id: 'p-share', num: '3', label: 'Sharing' },
    { id: 'p-cookies', num: '4', label: 'Cookies' },
    { id: 'p-retain', num: '5', label: 'Retention' },
    { id: 'p-rights', num: '6', label: 'Your rights' },
    { id: 'p-grievance', num: '7', label: 'Grievance' },
  ];

  readonly dataMap = [
    { type: 'Identity & contact', examples: 'Name, mobile, email, service address', retention: 'Account lifetime + legal need' },
    { type: 'Booking metadata', examples: 'Slot, plan, visit notes, payment status', retention: 'Operational + tax records' },
    { type: 'Support records', examples: 'Tickets, chat/email transcript', retention: 'Support lifecycle + quality review' },
    { type: 'Technical logs', examples: 'Browser, coarse timestamps, error events', retention: 'Short rotation windows' },
  ] as const;

  readonly rightsCards = [
    {
      title: 'Access & correction',
      body: 'Aap apna stored profile/booking data verify aur correction request kar sakte ho.',
    },
    {
      title: 'Consent controls',
      body: 'Consent-based processing ke cases mein withdraw/change options available rahenge.',
    },
    {
      title: 'Deletion requests',
      body: 'Law allow kare to data deletion initiate kar sakte hain; statutory carve-outs apply.',
    },
    {
      title: 'Grievance escalation',
      body: 'Official contact channel se verifiable request bhejein; SLA-based handling target rahega.',
    },
  ] as const;

  readonly faqs: readonly QmPrivacyFaq[] = [
    {
      q: 'Kya QuickMaid mera data bechta hai?',
      a: 'Nahi. Personal data mass marketing brokers ko sell nahi kiya jata.',
    },
    {
      q: 'Deletion request kaise bheju?',
      a: 'Contact page par verifiable identity ke saath request bhejein; legal carve-outs ke hisaab se handle hota hai.',
    },
    {
      q: 'Cookies mandatory hain?',
      a: 'Essential session/security cookies ho sakte hain; non-essential marketing cookies se pehle consent UI target hai.',
    },
    {
      q: 'Security posture details mil sakti hain?',
      a: 'High-level practices public hain; enterprise-level detail NDA ke under share ki ja sakti hai.',
    },
  ];

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

  ngAfterViewInit(): void {
    const root = this.host.nativeElement;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      root.querySelectorAll('.qm-reveal').forEach((el: Element) => el.classList.add('qm-reveal--in'));
    } else {
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

    this.setupScrollSpy();
    this.setupReadingProgress();
  }

  ngOnDestroy(): void {
    this.scrollSpyIo?.disconnect();
    if (this.onScroll) {
      window.removeEventListener('scroll', this.onScroll);
    }
    this.seo.resetToDefaults();
  }

  setActiveToc(id: string): void {
    this.activeTocId = id;
    this.cdr.markForCheck();
  }

  printPage(): void {
    window.print();
  }

  private setupScrollSpy(): void {
    const root = this.host.nativeElement;
    const headings = root.querySelectorAll('.qm-legal-prose h2[id]');
    if (!headings.length) return;

    this.scrollSpyIo = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target.id) {
          this.activeTocId = visible[0].target.id;
          this.cdr.markForCheck();
        }
      },
      { rootMargin: '-42% 0px -48% 0px', threshold: [0, 0.25, 0.5, 1] },
    );
    headings.forEach((h: Element) => this.scrollSpyIo?.observe(h));
  }

  private setupReadingProgress(): void {
    const root = this.host.nativeElement;
    const prose = root.querySelector('.qm-legal-prose') as HTMLElement | null;
    if (!prose) return;

    this.onScroll = () => {
      const rect = prose.getBoundingClientRect();
      const start = window.scrollY + rect.top;
      const end = start + prose.offsetHeight - window.innerHeight * 0.4;
      const pct = end <= start ? 100 : ((window.scrollY - start) / (end - start)) * 100;
      const next = Math.min(100, Math.max(0, Math.round(pct)));
      if (next !== this.readingProgress) {
        this.readingProgress = next;
        this.cdr.markForCheck();
      }
    };

    this.onScroll();
    window.addEventListener('scroll', this.onScroll, { passive: true });
  }
}
