# QuickMaid Documentation

Complete documentation for the QuickMaid Angular prototype — public site, partner portal, and admin console.

## Quick links

| Document | Audience | Description |
|----------|----------|-------------|
| [Project README](../README.md) | Everyone | Overview, install, routes, quick start |
| [Architecture](./ARCHITECTURE.md) | Developers | Services, state, guards, data flow |
| [Development Guide](./DEVELOPMENT.md) | Developers | Conventions, adding features, CSS, debugging |
| [Admin Guide](./ADMIN_GUIDE.md) | Ops / PM / Demo | Every admin screen explained |
| [Demo Walkthrough](./DEMO_WALKTHROUGH.md) | Sales / Stakeholders | Step-by-step live demo script |
| [Deployment](./DEPLOYMENT.md) | DevOps | Build, hosting, SPA config, SEO |
| [Phase 3 Backend](./PHASE3_BACKEND.md) | Backend team | Planned API, auth, integrations |

## What is QuickMaid?

QuickMaid is a **home-cleaning marketplace** focused on Raipur, India. This repo is a **UI prototype** (Phase 1–2) that demonstrates:

- Customer-facing marketing and booking
- Partner (maid) onboarding portal
- Full internal admin console for operations, finance, compliance, and support

There is **no production backend** in this repository. Cross-screen flows use `localStorage` via `AppStateService` so demos feel connected.

## Documentation map

```
QuickMaid/
├── README.md                 ← Start here (install + overview)
└── docs/
    ├── README.md             ← This index
    ├── ARCHITECTURE.md       ← How the app is built
    ├── DEVELOPMENT.md        ← How to extend the codebase
    ├── ADMIN_GUIDE.md        ← Admin screen reference
    ├── DEMO_WALKTHROUGH.md   ← Presenter script (~15 min)
    ├── DEPLOYMENT.md         ← Ship to production static host
    └── PHASE3_BACKEND.md     ← Future API design notes
```

## Demo credentials cheat sheet

| Flow | Path | Key detail |
|------|------|------------|
| Admin login | `/auth` | Valid email or 10-digit mobile + any password |
| Web booking OTP | `/book` | Demo OTP: `123456` |
| Reset all demo data | `/admin/settings` | Type `RESET` to confirm |
| Theme switch | Admin topbar | Theme picker (6 presets) |

## Support

- **Repository:** [github.com/Deepesh2104/QuickMaid](https://github.com/Deepesh2104/QuickMaid)
- **Issues:** GitHub Issues for bugs and feature requests
