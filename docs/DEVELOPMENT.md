# Development Guide

Conventions and workflows for contributing to QuickMaid.

## Environment setup

```bash
git clone https://github.com/Deepesh2104/QuickMaid.git
cd QuickMaid
npm install
npm start          # http://localhost:4200
```

**Node:** 18.x or 20.x LTS  
**Package manager:** npm (lockfile not committed — run `npm install` fresh)

## Project conventions

### Components

- **Standalone only** — no NgModules
- **OnPush** change detection on all feature components
- **Signals** for component state (`signal`, `computed`, `effect` sparingly)
- **inject()** for DI (avoid constructor injection in new code)
- Template-driven forms via `FormsModule` (no ReactiveFormsModule yet)

### File naming

```
feature-name.component.ts
feature-name.component.html
feature-name.component.css   # optional, co-located
```

Admin screens follow: `src/app/features/admin/{screen}/{screen}.component.*`

### Adding a new admin screen

1. **Create component** in `src/app/features/admin/my-screen/`
2. **Add route** in `admin.routes.ts`:
   ```typescript
   { path: 'my-screen', loadComponent: () => import('./my-screen/my-screen.component').then(m => m.MyScreenComponent) }
   ```
3. **Add nav item** in `admin-nav.config.ts` (appropriate section)
4. **Add breadcrumb label** in `BREADCRUMB_LABELS` (same file)
5. Use standard `adm-page` skeleton (see CSS section below)

### Adding a public page

1. Create standalone component under `features/`
2. Register in `app.routes.ts` with `loadComponent`
3. Call `SeoService.setPage()` in `ngOnInit`, `resetToDefaults()` in `ngOnDestroy`

### Services

- Shared app logic → `src/app/core/services/`
- Feature-specific → co-locate under feature folder (e.g. `support/data/`)
- Use `@Injectable({ providedIn: 'root' })` for singletons

### Toasts

```typescript
private readonly toast = inject(ToastService);
this.toast.show('Action completed', '✅');
```

### Modals

Standard pattern in admin HTML:

```html
<div class="adm-modal-backdrop" [class.open]="modalOpen()" (click)="closeModal()">
  <div class="adm-modal" [class.open]="modalOpen()" (click)="$event.stopPropagation()" role="dialog">
  ...
  </div>
</div>
```

Toggle with a `signal<boolean>`.

## CSS conventions

### Design tokens (`src/styles.css`)

Edit these three lines to retheme the entire app:

```css
--primary: #0D9488;
--primary-2: #14B8A6;
--primary-rgb: 13, 148, 136;
```

Or use runtime theme picker (sets `body.theme-teal`, etc.).

### Admin page skeleton

```html
<div class="adm-page bk-page">
  <header class="adm-hero">
    <p class="adm-eyebrow">Operations</p>
    <h1 class="adm-title">Bookings</h1>
    <p class="adm-sub">Subtitle text</p>
    <div class="adm-hero-aside">...</div>
  </header>

  <div class="adm-kpi-grid">...</div>

  <div class="adm-toolbar">
    <div class="adm-seg">...</div>
    <div class="adm-search-wrap">...</div>
  </div>

  <div class="adm-table-card">...</div>
</div>
```

### Key `adm-*` classes

| Class | Purpose |
|-------|---------|
| `adm-page` | Page root |
| `adm-hero` | Page header block |
| `adm-kpi-grid` / `adm-kpi` | Metric tiles |
| `adm-toolbar` | Filters + search row |
| `adm-seg` / `adm-seg-btn` | Segmented filter control |
| `adm-search-inp` | Search input |
| `adm-table-card` | Table container |
| `adm-btn` / `adm-btn--primary` / `adm-btn--ghost` | Buttons |
| `adm-modal-backdrop` / `adm-modal` | Modal overlay |
| `adm-empty` | Empty state |
| `adm-split` | Main + aside layout |

Per-screen suffix classes (`bk-page`, `rv-page`) go in component CSS for overrides.

### Angular template note

Escape `@` in HTML templates as `&#64;` (e.g. email placeholders).

## Charts

```typescript
private readonly chart = inject(ChartService);

ngAfterViewInit() {
  this.chart.create(this.canvasRef.nativeElement, { type: 'line', data, options });
}

ngOnDestroy() {
  this.chart.destroy(this.canvasRef.nativeElement);
}
```

Palette from `CHART_PALETTE` token in `core/tokens/chart-palette.token.ts`.

## CSV export pattern

Most admin tables build CSV in-component:

```typescript
const rows = [['ID', 'Name'], ...data.map(d => [d.id, d.name])];
const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
const blob = new Blob([csv], { type: 'text/csv' });
// trigger download via temporary <a>
```

## Persisting demo state

If a new public action should appear in admin:

1. Add interface to `app-state.service.ts`
2. Add to `PersistedState` interface
3. Update `load()`, `persist()`, and `resetDemo()`
4. Expose a signal + mutation method
5. Read from target admin component via `inject(AppStateService)`
6. Call `logAudit()` for audit trail entries

## Scripts

```bash
npm run build       # Production build
npm run watch       # Dev build with watch
npm run audit:css   # CSS size report
npm run purge:css   # Unused CSS helper
```

## Build troubleshooting

| Issue | Fix |
|-------|-----|
| Google Fonts inlining fails | Retry with network; or use `npm start` for dev |
| CSS budget warning on `qm-public.css` | Warning only (~1 KB over 18 KB limit) |
| `strictTemplates` errors | Project has `strictTemplates: false` in tsconfig |

## Code review checklist

- [ ] OnPush + signals used
- [ ] No secrets in code or committed files
- [ ] SEO set on new public pages
- [ ] Modal backdrop closes on outside click
- [ ] Toast feedback on user actions
- [ ] `npm run build` passes
- [ ] Matches existing `adm-*` / naming patterns

## Related docs

- [Architecture](./ARCHITECTURE.md)
- [Admin Guide](./ADMIN_GUIDE.md)
- [Phase 3 Backend](./PHASE3_BACKEND.md)
