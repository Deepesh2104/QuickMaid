import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ToastService } from '@core/services/toast.service';

type AuthTab = 'login' | 'signup';
type PwType = 'password' | 'text';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [FormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './auth.component.html',
})
export class AuthComponent {
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  readonly tab = signal<AuthTab>('login');
  readonly loginPwType = signal<PwType>('password');
  readonly signupPwType = signal<PwType>('password');

  /** Login: email ya 10-digit mobile (India) */
  readonly loginId = signal('');
  readonly loginPw = signal('');

  /** Signup */
  readonly selectedRole = signal('admin');
  readonly firstName = signal('');
  readonly lastName = signal('');
  readonly email = signal('');
  readonly phone = signal('');
  readonly city = signal('Raipur');
  readonly signupPw = signal('');
  readonly signupConfirmPw = signal('');
  readonly termsAccepted = signal(false);

  readonly strength = computed(() => {
    const v = this.signupPw();
    let s = 0;
    if (v.length >= 8) s++;
    if (/[A-Z]/.test(v)) s++;
    if (/[0-9]/.test(v)) s++;
    if (/[^A-Za-z0-9]/.test(v)) s++;
    return s;
  });

  readonly strengthLabel = computed(() => {
    if (this.signupPw().length === 0) return 'Type karte hi dikhega';
    const s = this.strength();
    const labels = ['Weak — 8+ chars, mix types', 'Okay', 'Good', 'Strong', 'Strong'];
    return labels[Math.min(s, 4)];
  });

  readonly strengthWidth = computed(() => `${this.strength() * 25}%`);

  readonly strengthColor = computed(() => {
    const colors = ['#EF4444', '#F59E0B', '#F59E0B', '#1C8C52', '#1C8C52'];
    return colors[this.strength()];
  });

  readonly loginPwToggleLabel = computed(() =>
    this.loginPwType() === 'password' ? 'Password dikhayein' : 'Password chhupayein',
  );

  readonly signupPwToggleLabel = computed(() =>
    this.signupPwType() === 'password' ? 'Password dikhayein' : 'Password chhupayein',
  );

  switchTab(t: AuthTab): void {
    this.tab.set(t);
  }

  selectRole(role: string): void {
    this.selectedRole.set(role);
  }

  togglePw(which: AuthTab): void {
    const target = which === 'login' ? this.loginPwType : this.signupPwType;
    target.update((t) => (t === 'password' ? 'text' : 'password'));
  }

  doLogin(): void {
    const id = this.loginId().trim();
    const pw = this.loginPw().trim();
    if (!id) {
      this.toast.show('Email ya phone number daalein', '⚠️');
      return;
    }
    if (!this.isValidLoginIdentifier(id)) {
      this.toast.show('Sahi email ya 10-digit mobile number daalein', '⚠️');
      return;
    }
    if (!pw) {
      this.toast.show('Password daalein', '⚠️');
      return;
    }
    this.toast.show('Login successful! Welcome back 👋', '✅');
    this.router.navigateByUrl('/admin/dashboard');
  }

  doSignup(): void {
    const fn = this.firstName().trim();
    const ln = this.lastName().trim();
    const em = this.email().trim();
    const ph = this.digitsOnly(this.phone());
    const pw = this.signupPw();
    const pw2 = this.signupConfirmPw();
    const city = this.city().trim();

    if (!fn) {
      this.toast.show('Pehla naam zaroori hai', '⚠️');
      return;
    }
    if (!ln) {
      this.toast.show('Aakhri naam zaroori hai', '⚠️');
      return;
    }
    if (!em || !this.isValidEmail(em)) {
      this.toast.show('Sahi email address daalein', '⚠️');
      return;
    }
    if (ph.length !== 10 || !/^[6-9]\d{9}$/.test(ph)) {
      this.toast.show('10-digit mobile number daalein (6–9 se start)', '⚠️');
      return;
    }
    if (!city) {
      this.toast.show('City chunein', '⚠️');
      return;
    }
    if (pw.length < 8) {
      this.toast.show('Password kam se kam 8 characters ka ho', '⚠️');
      return;
    }
    if (pw !== pw2) {
      this.toast.show('Password aur confirm password match nahi kar rahe', '⚠️');
      return;
    }
    if (!this.termsAccepted()) {
      this.toast.show('Terms & Privacy accept karein', '⚠️');
      return;
    }

    this.toast.show(`Account ready! Role: ${this.selectedRole()} — abhi demo login 🎉`, '✅');
    this.router.navigateByUrl('/admin/dashboard');
  }

  private isValidLoginIdentifier(raw: string): boolean {
    if (raw.includes('@')) {
      return this.isValidEmail(raw);
    }
    const d = this.digitsOnly(raw);
    return d.length === 10 && /^[6-9]\d{9}$/.test(d);
  }

  private isValidEmail(s: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
  }

  private digitsOnly(s: string): string {
    return s.replace(/\D/g, '');
  }
}
