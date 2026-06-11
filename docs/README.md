# QuickMaid Documentation

**Scope:** This documentation covers the **QuickMaid web repository** only — marketing site, web booking, partner web portal, and admin console (Angular 18).

> **Mobile apps** (Customer + Partner) will be built in a **separate repository** (`QuickMaid-App`) with **its own documentation**. See [Platform Overview](./PLATFORM.md) for how everything connects.

---

## Documentation index

| Document | Audience | Description |
|----------|----------|-------------|
| [Project README](../README.md) | Everyone | Install, quick start, overview |
| [Platform Overview](./PLATFORM.md) | Product / Tech leads | 3 repos, one DB, web vs mobile split |
| [Architecture](./ARCHITECTURE.md) | Developers | Services, state, guards, data flow |
| [Public Guide](./PUBLIC_GUIDE.md) | Developers / Content | Landing, book, partner, auth, legal pages |
| [Admin Guide](./ADMIN_GUIDE.md) | Ops / PM / Demo | All 25 admin screens |
| [Development Guide](./DEVELOPMENT.md) | Developers | Conventions, CSS, adding features |
| [Demo Walkthrough](./DEMO_WALKTHROUGH.md) | Sales / Stakeholders | 15-minute live demo script |
| [Deployment](./DEPLOYMENT.md) | DevOps | Build, hosting, SPA config |
| [Phase 3 Backend](./PHASE3_BACKEND.md) | Backend team | API plan (shared by web + mobile) |

---

## What this repo contains

| Area | Routes | Screens |
|------|--------|---------|
| Landing & marketing | `/` | 1 page (multi-section) |
| Web booking | `/book` | 4-step flow |
| Partner web portal | `/partner` | 3 tabs + onboarding |
| Staff auth | `/auth` | Login + signup |
| Public pages | `/about`, `/contact`, `/terms`, `/privacy`, `/status` | 5 pages |
| Admin console | `/admin/*` | 25 screens |

**Total admin screens:** 25  
**Public/web pages:** 9 routes  

---

## Quick reference

### Demo credentials

| Flow | Path | Detail |
|------|------|--------|
| Admin login | `/auth` | Valid email or 10-digit mobile + any password |
| Web booking OTP | `/book` | `123456` |
| Reset demo data | `/admin/settings` | Type `RESET` |
| Theme picker | Admin topbar | 6 color presets |

### Cross-flow demos (web)

| Public action | Admin destination |
|---------------|-------------------|
| Complete `/book` | `/admin/bookings` (Web badge) |
| Submit `/partner` onboarding | `/admin/maids` (review queue) |
| Landing waitlist | `/admin/campaigns` (waitlist table) |

### Storage keys (demo)

| Key | Purpose |
|-----|---------|
| `qm_app_state` | Bookings, partners, waitlist, maids, audit |
| `qm_settings` | Platform toggles |
| `qm_session_v1` / `qm_session_remember_v1` | Staff session |
| `quickmaid-theme-v2` | Theme preset |

---

## Repository map

```
QuickMaid/                         ← YOU ARE HERE (web + admin)
├── README.md
├── docs/                            ← This folder
│   ├── README.md                  ← Index
│   ├── PLATFORM.md                ← 3-repo platform (brief)
│   ├── ARCHITECTURE.md
│   ├── PUBLIC_GUIDE.md
│   ├── ADMIN_GUIDE.md
│   ├── DEVELOPMENT.md
│   ├── DEMO_WALKTHROUGH.md
│   ├── DEPLOYMENT.md
│   └── PHASE3_BACKEND.md
└── src/                             ← Angular source

QuickMaid-App/                       ← Separate repo (mobile — own docs)
QuickMaid-API/                       ← Separate repo (backend — Phase 3)
```

---

## Tech stack (this repo)

| Layer | Choice |
|-------|--------|
| Framework | Angular 18 standalone |
| State | Signals + localStorage (demo) |
| Charts | Chart.js 4.x |
| CSS | Plain CSS, design tokens in `styles.css` |
| Build | `ng build` → `dist/quickmaid/` |

---

## Support

- **Repository:** [github.com/Deepesh2104/QuickMaid](https://github.com/Deepesh2104/QuickMaid)
- **Issues:** GitHub Issues
