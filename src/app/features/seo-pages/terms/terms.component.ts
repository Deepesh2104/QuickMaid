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

  readonly lastUpdated = '2026-05-14';

  readonly heroPills = ['Customers & partners', 'Raipur · India', 'English + Hindi summary'] as const;

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

  printPage(): void {
    window.print();
  }
}
