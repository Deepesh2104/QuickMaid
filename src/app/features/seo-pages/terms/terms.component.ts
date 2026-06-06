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

export interface QmLegalTocItem {
  id: string;
  num: string;
  label: string;
}

export interface QmTermsHighlight {
  title: string;
  body: string;
  icon: string;
}

export interface QmTermsFaq {
  q: string;
  a: string;
}

export interface QmLegalQuickFact {
  label: string;
  value: string;
  note: string;
}

@Component({
  selector: 'app-terms',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './terms.component.html',
  styleUrls: [
    '../../public-pages/qm-public.css',
    '../../public-pages/qm-legal.css',
    './terms.component.css',
  ],
})
export class TermsComponent implements OnInit, OnDestroy, AfterViewInit {
  private readonly seo = inject(SeoService);
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly cdr = inject(ChangeDetectorRef);

  private scrollSpyIo: IntersectionObserver | null = null;
  private onScroll: (() => void) | null = null;

  readonly lastUpdated = '2026-05-14';
  readonly docVersion = '1.2';

  activeTocId = 't-intro';
  readingProgress = 0;

  readonly quickFacts: readonly QmLegalQuickFact[] = [
    { label: 'Applies to', value: 'Customers & partners', note: 'Platform use + bookings' },
    { label: 'Jurisdiction', value: 'Raipur, India', note: 'Courts / consumer forums' },
    { label: 'Format', value: 'EN + HI summary', note: 'Plain-language clarity' },
  ];

  readonly highlights: readonly QmTermsHighlight[] = [
    {
      icon: '01',
      title: 'Acceptance',
      body: 'Booking ya platform use = in terms se agreement. Agree nahi ho to service use na karein.',
    },
    {
      icon: '02',
      title: 'Bookings',
      body: 'Slots capacity par depend. Cancellation / no-show fees jahan disclose hon.',
    },
    {
      icon: '03',
      title: 'Payments',
      body: 'Authorized partners se process. GST / invoices applicable law ke mutabiq.',
    },
    {
      icon: '04',
      title: 'Liability cap',
      body: 'Jahan law allow kare, liability disputed period fees tak capped ho sakti hai.',
    },
  ];

  readonly toc: readonly QmLegalTocItem[] = [
    { id: 't-intro', num: '—', label: 'Intro' },
    { id: 't-accept', num: '1', label: 'Acceptance' },
    { id: 't-service', num: '2', label: 'Service' },
    { id: 't-book', num: '3', label: 'Bookings' },
    { id: 't-pay', num: '4', label: 'Payments' },
    { id: 't-conduct', num: '5', label: 'Conduct' },
    { id: 't-liab', num: '6', label: 'Liability' },
    { id: 't-law', num: '7', label: 'Governing law' },
    { id: 't-contact', num: '8', label: 'Contact' },
  ];

  readonly faqs: readonly QmTermsFaq[] = [
    {
      q: 'Terms kab update hote hain?',
      a: 'Material changes par website / WhatsApp notice ki koshish. Major changes par renewed acceptance maang sakte hain.',
    },
    {
      q: 'Cancellation fee kab lagti hai?',
      a: 'Jahan applicable ho, booking flow ya rate card par disclose ki jayegi — har plan alag ho sakta hai.',
    },
    {
      q: 'Partner ke liye alag rules hain?',
      a: 'Same framework — conduct, payouts, aur safety dono sides par apply. Partner onboarding par extra policies ho sakti hain.',
    },
    {
      q: 'Dispute ka forum kahan hai?',
      a: 'Primarily Raipur, Chhattisgarh courts / consumer forums — mandatory law jo impose kare uske subject.',
    },
  ];

  ngOnInit(): void {
    this.seo.setPage({
      title: 'Terms & Conditions | QuickMaid — bookings, payments & liability',
      description:
        'QuickMaid terms of service: bookings, payments, cancellations, conduct, liability, governing law (Raipur, India). Official legal page.',
      canonicalPath: '/terms',
      ogTitle: 'Terms & Conditions | QuickMaid',
      ogDescription: 'Platform rules for customers and service partners — QuickMaid India.',
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
