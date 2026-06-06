import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastService } from '@core/services/toast.service';

@Component({
  selector: 'app-add-maid',
  standalone: true,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './add-maid.component.html',
  styleUrls: ['./add-maid.component.css'],
})
export class AddMaidComponent {
  readonly toast = inject(ToastService);
  readonly router = inject(Router);

  readonly fullName = signal('');
  readonly phone = signal('');
  readonly aadhaar = signal('');
  readonly age = signal('');
  readonly zone = signal('Tatibandh');
  readonly service = signal('Cleaning');
  readonly upi = signal('');
  readonly bank = signal('');
  readonly ifsc = signal('');
  readonly emergency = signal('');
  readonly notes = signal('');

  readonly saveOpen = signal(false);
  readonly saving = signal(false);

  readonly summaryLine = computed(() => {
    const name = this.fullName().trim() || '—';
    return `${name} · ${this.zone()} · ${this.service()}`;
  });

  openSave(): void {
    if (!this.fullName().trim()) {
      this.toast.show('Full name required', '⚠️');
      return;
    }
    if (!this.phone().trim()) {
      this.toast.show('Phone number required', '⚠️');
      return;
    }
    this.saveOpen.set(true);
  }

  closeSave(): void {
    this.saveOpen.set(false);
  }

  confirmSave(): void {
    this.saving.set(true);
    setTimeout(() => {
      this.saving.set(false);
      this.closeSave();
      this.toast.show('Maid added — KYC verification queued', '👩');
      void this.router.navigateByUrl('/admin/maids');
    }, 800);
  }
}
