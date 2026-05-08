import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  inject,
  signal,
} from '@angular/core';
import { ThemeService } from '@core/services/theme.service';

@Component({
  selector: 'app-theme-picker',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="tp-wrap">
      <button class="tp-trigger" (click)="toggle($event)" [title]="'Theme: ' + theme.currentPreset().name">
        <span class="tp-swatch-mini" [style.background]="theme.currentPreset().swatch"></span>
        <span class="tp-trigger-label">{{ theme.currentPreset().name }}</span>
        <span class="tp-caret">▾</span>
      </button>

      @if (open()) {
        <div class="tp-pop" (click)="$event.stopPropagation()">
          <div class="tp-pop-title">Choose Brand Theme</div>
          <div class="tp-pop-sub">Color sare app me apply hoga — buttons, links, charts, badges.</div>
          <div class="tp-list">
            @for (p of theme.presets; track p.id) {
              <button
                class="tp-row"
                [class.active]="theme.current() === p.id"
                (click)="select(p.id)">
                <span class="tp-swatch-pair">
                  <span class="tp-swatch" [style.background]="p.swatch"></span>
                  <span class="tp-swatch tp-swatch-2" [style.background]="p.swatch2"></span>
                </span>
                <span class="tp-row-info">
                  <span class="tp-row-name">{{ p.name }}</span>
                  <span class="tp-row-desc">{{ p.description }}</span>
                </span>
                @if (theme.current() === p.id) {
                  <span class="tp-row-check">✓</span>
                }
              </button>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .tp-wrap{position:relative;display:inline-block;}
    .tp-trigger{display:flex;align-items:center;gap:8px;background:var(--cream2);border:1px solid var(--border2);border-radius:9px;padding:6px 11px;font-size:12px;font-weight:700;color:var(--ink);cursor:pointer;font-family:'Cabinet Grotesk',sans-serif;transition:.18s;height:32px;}
    .tp-trigger:hover{background:var(--white);border-color:var(--primary);}
    .tp-swatch-mini{width:14px;height:14px;border-radius:50%;display:inline-block;box-shadow:0 0 0 2px var(--white),0 0 0 3px var(--border2);flex-shrink:0;}
    .tp-trigger-label{white-space:nowrap;}
    .tp-caret{font-size:10px;color:var(--muted);}
    .tp-pop{position:absolute;top:calc(100% + 8px);right:0;background:var(--white);border:1px solid var(--border2);border-radius:14px;padding:14px;box-shadow:var(--shadow-lg);z-index:1000;width:300px;animation:tpIn .18s ease;}
    @keyframes tpIn{from{opacity:0;transform:translateY(-6px);}to{opacity:1;transform:none;}}
    .tp-pop-title{font-size:13px;font-weight:800;margin-bottom:2px;}
    .tp-pop-sub{font-size:11px;color:var(--muted);margin-bottom:10px;line-height:1.4;}
    .tp-list{display:flex;flex-direction:column;gap:4px;}
    .tp-row{display:flex;align-items:center;gap:11px;width:100%;background:transparent;border:1px solid transparent;border-radius:10px;padding:7px 9px;cursor:pointer;text-align:left;font-family:'Cabinet Grotesk',sans-serif;transition:.15s;}
    .tp-row:hover{background:var(--cream2);}
    .tp-row.active{background:rgba(var(--primary-rgb),.08);border-color:rgba(var(--primary-rgb),.25);}
    .tp-swatch-pair{display:flex;flex-shrink:0;}
    .tp-swatch{width:18px;height:18px;border-radius:50%;border:2px solid var(--white);box-shadow:0 1px 3px rgba(0,0,0,.15);}
    .tp-swatch-2{margin-left:-7px;}
    .tp-row-info{flex:1;min-width:0;display:flex;flex-direction:column;}
    .tp-row-name{font-size:12.5px;font-weight:700;color:var(--ink);}
    .tp-row-desc{font-size:10.5px;color:var(--muted);line-height:1.35;margin-top:1px;}
    .tp-row-check{color:var(--primary);font-size:14px;font-weight:800;flex-shrink:0;}
    @media(max-width:780px){.tp-trigger-label{display:none;}.tp-pop{width:280px;}}
  `],
})
export class ThemePickerComponent {
  readonly theme = inject(ThemeService);
  readonly open = signal(false);
  private readonly host = inject(ElementRef<HTMLElement>);

  toggle(ev: MouseEvent): void {
    ev.stopPropagation();
    this.open.update((v) => !v);
  }

  select(id: string): void {
    this.theme.setTheme(id);
    this.open.set(false);
  }

  @HostListener('document:click', ['$event'])
  onOutsideClick(ev: MouseEvent): void {
    if (!this.host.nativeElement.contains(ev.target as Node)) {
      this.open.set(false);
    }
  }
}
