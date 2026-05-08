import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ToastService } from '@core/services/toast.service';

type AuthTab = 'login' | 'signup';
type PwType = 'password' | 'text';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './auth.component.html',
})
export class AuthComponent {
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  readonly tab = signal<AuthTab>('login');
  readonly loginPwType = signal<PwType>('password');
  readonly signupPwType = signal<PwType>('password');
  readonly signupPw = signal('');
  readonly selectedRole = signal('admin');

  readonly strength = computed(() => {
    const v = this.signupPw();
    let s = 0;
    if (v.length >= 8) s++;
    if (/[A-Z]/.test(v)) s++;
    if (/[0-9]/.test(v)) s++;
    if (/[^A-Za-z0-9]/.test(v)) s++;
    return s;
  });
  readonly strengthWidth = computed(() => this.strength() * 25 + '%');
  readonly strengthColor = computed(() => {
    const colors = ['#EF4444', '#F59E0B', '#F59E0B', '#1C8C52', '#1C8C52'];
    return colors[this.strength()];
  });

  switchTab(t: AuthTab): void { this.tab.set(t); }
  selectRole(role: string): void { this.selectedRole.set(role); }

  togglePw(which: AuthTab): void {
    const target = which === 'login' ? this.loginPwType : this.signupPwType;
    target.update((t) => (t === 'password' ? 'text' : 'password'));
  }

  doLogin(): void {
    this.toast.show('Login successful! Welcome back 👋', '✅');
    this.router.navigateByUrl('/admin/dashboard');
  }
}
