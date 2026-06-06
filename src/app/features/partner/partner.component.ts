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

type PartnerTab = 'dashboard' | 'onboarding' | 'earnings';
type OnboardStep = 'profile' | 'documents' | 'bank' | 'review';

interface PartnerJob {
  readonly id: string;
  readonly time: string;
  readonly area: string;
  readonly service: string;
  readonly pay: number;
  readonly status: 'upcoming' | 'done';
}

interface EarningRow {
  readonly week: string;
  readonly jobs: number;
  readonly gross: number;
  readonly bonus: number;
}

@Component({
  selector: 'app-partner',
  standalone: true,
  imports: [RouterLink, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './partner.component.html',
  styleUrls: ['../public-shell.css', './partner.component.css'],
})
export class PartnerComponent implements OnInit, OnDestroy {
  private readonly seo = inject(SeoService);
  readonly toast = inject(ToastService);
  private readonly appState = inject(AppStateService);

  readonly tab = signal<PartnerTab>('dashboard');
  readonly onboardStep = signal<OnboardStep>('profile');
  readonly onboardComplete = signal(false);

  readonly fullName = signal('');
  readonly phone = signal('');
  readonly city = signal('Raipur');
  readonly skills = signal('Cleaning');
  readonly aadhaarUploaded = signal(false);
  readonly photoUploaded = signal(false);
  readonly bankName = signal('');
  readonly accountNo = signal('');
  readonly ifsc = signal('');

  readonly todayJobs: readonly PartnerJob[] = [
    { id: 'J-441', time: '8:30 AM', area: 'Pandri', service: 'Daily clean', pay: 520, status: 'done' },
    { id: 'J-442', time: '11:00 AM', area: 'Civil Lines', service: 'Kitchen focus', pay: 680, status: 'done' },
    { id: 'J-443', time: '4:00 PM', area: 'Tatibandh', service: 'Deep clean', pay: 640, status: 'upcoming' },
  ];

  readonly earnings: readonly EarningRow[] = [
    { week: 'Jun 2 – 8', jobs: 14, gross: 7840, bonus: 420 },
    { week: 'May 26 – Jun 1', jobs: 12, gross: 6720, bonus: 0 },
    { week: 'May 19 – 25', jobs: 15, gross: 8450, bonus: 500 },
  ];

  readonly todayTotal = computed(() =>
    this.todayJobs.reduce((sum, j) => sum + j.pay, 0),
  );

  readonly onboardStepIndex = computed(() => {
    const order: OnboardStep[] = ['profile', 'documents', 'bank', 'review'];
    return order.indexOf(this.onboardStep()) + 1;
  });

  ngOnInit(): void {
    this.seo.setPage({
      title: 'Partner with QuickMaid | Maids & helpers in Raipur',
      description:
        'Join QuickMaid as a verified service partner in Raipur — fair payouts, flexible schedule, and official support.',
      canonicalPath: '/partner',
      ogTitle: 'Partner with QuickMaid',
      ogDescription: 'Earn more with verified bookings — QuickMaid partner program Raipur.',
      ogImagePath: DEFAULT_OG_IMAGE_PATH,
    });
  }

  ngOnDestroy(): void {
    this.seo.resetToDefaults();
  }

  setTab(t: PartnerTab): void {
    this.tab.set(t);
  }

  nextOnboard(): void {
    const step = this.onboardStep();
    if (step === 'profile') {
      if (!this.fullName().trim() || this.phone().trim().length < 10) {
        this.toast.show('Naam aur 10-digit phone daalein', '⚠️');
        return;
      }
      this.onboardStep.set('documents');
      return;
    }
    if (step === 'documents') {
      if (!this.aadhaarUploaded() || !this.photoUploaded()) {
        this.toast.show('Dono documents upload karein', '⚠️');
        return;
      }
      this.onboardStep.set('bank');
      return;
    }
    if (step === 'bank') {
      if (!this.bankName().trim() || !this.accountNo().trim() || !this.ifsc().trim()) {
        this.toast.show('Bank details poori karein', '⚠️');
        return;
      }
      this.onboardStep.set('review');
      return;
    }
    this.appState.addPartnerApplication({
      name: this.fullName(),
      phone: this.phone(),
      city: this.city(),
      skills: this.skills(),
      bankName: this.bankName(),
    });
    this.onboardComplete.set(true);
    this.tab.set('dashboard');
    this.toast.show('Onboarding submit! Admin → Maids mein pending dikhega.', '🎉');
  }

  prevOnboard(): void {
    const order: OnboardStep[] = ['profile', 'documents', 'bank', 'review'];
    const i = order.indexOf(this.onboardStep());
    if (i > 0) this.onboardStep.set(order[i - 1]);
  }

  uploadDoc(kind: 'aadhaar' | 'photo'): void {
    if (kind === 'aadhaar') this.aadhaarUploaded.set(true);
    else this.photoUploaded.set(true);
    this.toast.show('Document uploaded (demo)', '📎');
  }
}
