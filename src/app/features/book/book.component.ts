import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AppStateService } from '@core/services/app-state.service';
import { ToastService } from '@core/services/toast.service';
import { SeoService } from '@core/services/seo.service';
import { DEFAULT_OG_IMAGE_PATH } from '@core/site.constants';

type BookStep = 'details' | 'otp' | 'payment' | 'done';

const SERVICE_PRICES: Readonly<Record<string, number>> = {
  'Deep clean': 499,
  Regular: 149,
  'Kitchen focus': 299,
};

@Component({
  selector: 'app-book',
  standalone: true,
  imports: [RouterLink, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './book.component.html',
  styleUrls: ['../public-shell.css', './book.component.css'],
})
export class BookComponent implements OnInit, OnDestroy {
  private readonly seo = inject(SeoService);
  readonly toast = inject(ToastService);
  private readonly appState = inject(AppStateService);

  readonly minDate = new Date().toISOString().slice(0, 10);
  readonly step = signal<BookStep>('details');
  readonly service = signal('Deep clean');
  readonly when = signal('');
  readonly slot = signal('8:00 AM – 10:00 AM');
  readonly address = signal('');
  readonly phone = signal('');
  readonly otp = signal('');
  readonly otpSent = signal(false);
  readonly otpVerifying = signal(false);
  readonly paymentMethod = signal<'upi' | 'card' | 'cod'>('upi');
  readonly paying = signal(false);
  readonly bookingId = signal('');

  readonly price = computed(() => SERVICE_PRICES[this.service()] ?? 149);
  readonly stepIndex = computed(() => {
    const order: BookStep[] = ['details', 'otp', 'payment', 'done'];
    return order.indexOf(this.step()) + 1;
  });

  ngOnInit(): void {
    this.seo.setPage({
      title: 'Book a Visit | QuickMaid — home cleaning in Raipur',
      description:
        'Web booking flow for QuickMaid Raipur — choose service, date, and address. Verified maids, transparent pricing.',
      canonicalPath: '/book',
      ogTitle: 'Book a Visit | QuickMaid',
      ogDescription: 'Request a home visit in Raipur — QuickMaid booking.',
      ogImagePath: DEFAULT_OG_IMAGE_PATH,
    });
  }

  ngOnDestroy(): void {
    this.seo.resetToDefaults();
  }

  goToDetails(): void {
    this.step.set('details');
  }

  sendOtp(): void {
    const phone = this.phone().trim();
    if (!/^\d{10}$/.test(phone.replace(/\D/g, '').slice(-10))) {
      this.toast.show('10-digit mobile number daalein', '⚠️');
      return;
    }
    this.otpSent.set(true);
    this.otp.set('');
    this.toast.show('OTP bheja — demo: 123456', '📱');
  }

  verifyOtpAndContinue(): void {
    if (!this.otpSent()) {
      this.sendOtp();
      return;
    }
    if (this.otp().trim() !== '123456') {
      this.toast.show('Galat OTP — demo ke liye 123456 use karein', '⚠️');
      return;
    }
    this.otpVerifying.set(true);
    setTimeout(() => {
      this.otpVerifying.set(false);
      this.step.set('payment');
      this.toast.show('Mobile verified', '✅');
    }, 600);
  }

  continueFromDetails(): void {
    if (!this.when().trim() || !this.address().trim()) {
      this.toast.show('Date aur address daalein', '⚠️');
      return;
    }
    this.step.set('otp');
  }

  payAndConfirm(): void {
    this.paying.set(true);
    setTimeout(() => {
      this.paying.set(false);
      const id = 'QM-' + Math.floor(1000 + Math.random() * 9000);
      this.bookingId.set(id);
      this.appState.addInboundBooking({
        id,
        phone: this.phone(),
        service: this.service(),
        when: `${this.when()} · ${this.slot()}`,
        address: this.address(),
        amount: this.price(),
      });
      this.step.set('done');
      this.toast.show('Booking confirmed! Admin panel mein dikhega.', '🎉');
    }, 900);
  }

  bookAnother(): void {
    this.step.set('details');
    this.when.set('');
    this.address.set('');
    this.phone.set('');
    this.otp.set('');
    this.otpSent.set(false);
    this.bookingId.set('');
  }
}
