# QuickMaid

<p align="center">
  <strong>Verified maid & home cleaning in Raipur</strong><br>
  Web marketing · Web booking · Partner portal · Admin console
</p>

<p align="center">
  <a href="https://github.com/Deepesh2104/QuickMaid">GitHub</a> ·
  <a href="./docs/README.md">Documentation</a> ·
  <a href="./docs/DEMO_WALKTHROUGH.md">Demo script</a>
</p>

---

Angular 18 **web prototype** for QuickMaid — marketing site, web booking, partner onboarding, and a 25-screen admin console. Runs locally with **no backend**; demo data uses `localStorage`.

> **This repo** = web + admin only. **Mobile apps** → separate repo `QuickMaid-App` (own docs). **API + DB** → `QuickMaid-API` (Phase 3). See [Platform Overview](./docs/PLATFORM.md).

---

## Documentation

| Guide | Description |
|-------|-------------|
| [**Docs index**](./docs/README.md) | Full documentation map |
| [**Platform**](./docs/PLATFORM.md) | 3 repos, one database, web vs mobile |
| [**Architecture**](./docs/ARCHITECTURE.md) | Services, state, guards, data flow |
| [**Public guide**](./docs/PUBLIC_GUIDE.md) | Landing, book, partner, auth, legal |
| [**Admin guide**](./docs/ADMIN_GUIDE.md) | All 25 admin screens |
| [**Development**](./docs/DEVELOPMENT.md) | Conventions, CSS, adding features |
| [**Demo walkthrough**](./docs/DEMO_WALKTHROUGH.md) | 15-minute live demo script |
| [**Deployment**](./docs/DEPLOYMENT.md) | Build, hosting, SPA config |
| [**Phase 3 backend**](./docs/PHASE3_BACKEND.md) | Shared API plan |

---

## Quick start

```bash
git clone https://github.com/Deepesh2104/QuickMaid.git
cd QuickMaid
npm install
npm start
```

Open **http://localhost:4200**

| Command | Description |
|---------|-------------|
| `npm start` | Dev server (opens browser) |
| `npm run build` | Production build → `dist/quickmaid/` |
| `npm run watch` | Dev build with watch |
| `npm run audit:css` | CSS bundle size report |
| `npm run purge:css` | Unused CSS helper |

**Requires:** Node.js 18+ or 20+ LTS

---

## What's in this repo

| Area | Path | Description |
|------|------|-------------|
| Landing | `/` | Hero, services, plans, FAQ, waitlist |
| Book | `/book` | 4-step web booking (OTP demo: `123456`) |
| Partner | `/partner` | Maid dashboard + onboarding (web preview) |
| Auth | `/auth` | Staff login → admin |
| Public | `/about`, `/contact`, `/terms`, `/privacy`, `/status` | Info & legal |
| Admin | `/admin/*` | 25 ops screens |

Details: [Public Guide](./docs/PUBLIC_GUIDE.md) · [Admin Guide](./docs/ADMIN_GUIDE.md)

---

## Demo credentials

| Flow | How |
|------|-----|
| **Admin** | `/auth` → valid email/phone + any password → `/admin/dashboard` |
| **Booking OTP** | `/book` → OTP **`123456`** |
| **Reset demo** | `/admin/settings` → type **`RESET`** |

---

## Cross-app demo flows

| Public | → Admin |
|--------|---------|
| Complete `/book` | `/admin/bookings` (Web badge) |
| `/partner` submit | `/admin/maids` (review queue) |
| Landing waitlist | `/admin/campaigns` |

Full script: [Demo Walkthrough](./docs/DEMO_WALKTHROUGH.md)

---

## Tech stack

| Layer | Technology |
|-------|------------|
| Framework | Angular 18 (standalone, signals, OnPush) |
| Language | TypeScript 5.5 strict |
| Charts | Chart.js 4.x |
| Styling | CSS tokens in `src/styles.css` |
| State | Signals + localStorage (demo) |

**Aliases:** `@core`, `@shared`, `@layouts`, `@features`

---

## Project structure

```
QuickMaid/
├── README.md
├── docs/                         # Web repo documentation
├── src/
│   ├── app/
│   │   ├── core/                 # Services, guards
│   │   ├── shared/               # Toast, theme, mobile-block
│   │   ├── layouts/              # Admin shell
│   │   └── features/             # landing, book, partner, admin, …
│   ├── styles.css
│   └── assets/
├── angular.json
└── package.json
```

---

## Storage keys (demo)

| Key | Purpose |
|-----|---------|
| `qm_app_state` | Bookings, partners, waitlist, approved maids, audit |
| `qm_settings` | Platform toggles |
| `qm_session_v1` / `qm_session_remember_v1` | Staff session |
| `quickmaid-theme-v2` | Theme preset |

---

## Deployment

```bash
npm run build
# Deploy dist/quickmaid/ — SPA fallback required
```

[Deployment Guide](./docs/DEPLOYMENT.md) · Update `SITE_ORIGIN` in `src/app/core/site.constants.ts`

---

## Platform roadmap

| Phase | Repo | Status |
|-------|------|--------|
| Web + admin demo | **QuickMaid** (this) | ✅ Built |
| Customer + Partner mobile | **QuickMaid-App** | Planned (separate docs) |
| API + PostgreSQL | **QuickMaid-API** | Phase 3 |

---

## Contributing

1. Branch from `main`
2. Match patterns: standalone, signals, OnPush, `adm-*` CSS
3. Run `npm run build` before PR
4. Never commit `.env` or API keys

---

## License

Private project. All rights reserved.
