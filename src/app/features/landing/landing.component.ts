import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  inject,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { MobileService } from '@core/services/mobile.service';

interface Faq {
  q: string;
  a: string;
  open: boolean;
}

@Component({
  selector: 'app-landing',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './landing.component.html',
})
export class LandingComponent implements AfterViewInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly mobile = inject(MobileService);
  private readonly host = inject(ElementRef<HTMLElement>);

  readonly faqs = signal<Faq[]>([
    { q: 'Kya maid safe aur verified hoti hai?', a: 'Haan, 100%. Har maid ka Aadhaar verification, police character certificate, aur background check hota hai.', open: false },
    { q: 'Maid na aaye toh kya hoga?', a: 'Strict No-Show Zero policy hai. 15 min late hone par admin ko alert milta hai, backup maid assign hoti hai.', open: false },
    { q: 'Koi cheez toot gayi toh kya karein?', a: 'Har booking par ₹5,000 tak ki damage guarantee hai.', open: false },
    { q: 'Kya app chahiye booking ke liye?', a: 'Abhi nahi! Sirf WhatsApp karo — Hindi mein message karo, koi problem nahi.', open: false },
    { q: 'Kya monthly plan pause kar sakte hain?', a: 'Bilkul! Monthly plan upto 15 days, annual plan upto 30 days pause kar sakte ho.', open: false },
  ]);

  readonly mobileNavOpen = signal(false);

  showAuth(e?: Event): void {
    if (e) e.preventDefault();
    this.mobile.isMobile();
    this.closeMobileNav();
    this.router.navigateByUrl('/auth');
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
  }

  ngOnDestroy(): void {
    document.body.style.overflow = '';
  }

  private syncBodyScroll(): void {
    document.body.style.overflow = this.mobileNavOpen() ? 'hidden' : '';
  }
}
