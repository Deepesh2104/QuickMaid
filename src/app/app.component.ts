import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from '@core/services/theme.service';
import { ToastComponent } from '@shared/ui/toast/toast.component';
import { MobileBlockComponent } from '@shared/ui/mobile-block/mobile-block.component';

@Component({
  selector: 'app-root',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, ToastComponent, MobileBlockComponent],
  template: `
    <router-outlet></router-outlet>
    <app-toast></app-toast>
    <app-mobile-block></app-mobile-block>
  `,
})
export class AppComponent {
  /** Eager init so body theme classes apply (picker UI removed). */
  private readonly _theme = inject(ThemeService);
}
