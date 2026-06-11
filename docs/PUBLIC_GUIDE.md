# Public Web Guide

All **customer-facing and partner web pages** in this repository (not mobile apps).

## Route map

| Path | Component | File |
|------|-----------|------|
| `/` | Landing | `features/landing/` |
| `/book` | Web booking | `features/book/` |
| `/partner` | Partner hub | `features/partner/` |
| `/auth` | Staff login | `features/auth/` |
| `/about` | About | `features/public-pages/about-page/` |
| `/contact` | Contact | `features/public-pages/contact-page/` |
| `/terms` | Terms | `features/seo-pages/terms/` |
| `/privacy` | Privacy | `features/seo-pages/privacy/` |
| `/status` | System status | `features/status/` |

Staff admin is at `/admin` — see [Admin Guide](./ADMIN_GUIDE.md).

---

## Landing page (`/`)

**File:** `src/app/features/landing/landing.component.html`

### Sections

| Section | Anchor | Content |
|---------|--------|---------|
| Navigation | — | Logo, links, mobile drawer, Admin login CTA |
| Hero | — | Headline, WhatsApp book CTA, trust metrics |
| Trust strip | — | 4 stat tiles |
| How it works | `#how` | 4-step process |
| Services | `#services` | Deep clean, Regular, Kitchen, etc. |
| Plans | `#plans` | Instant / Monthly / Annual pricing |
| Testimonials | — | Customer reviews |
| Maid join | `#maid-join` | Partner recruitment CTA → `/partner` |
| Cities | `#cities` | Raipur + expansion cities |
| FAQ | — | Accordion questions |
| Footer CTA | — | Final book CTA |
| Footer | — | Links, legal, social |
| Waitlist modal | — | City notify form → `AppStateService.addWaitlist()` |
| WhatsApp float | — | Fixed WA button |

### Key actions

- **WhatsApp book** — `buildWhatsAppHref()` from `site.constants.ts`
- **Waitlist** — persists to admin Campaigns via `AppStateService`
- **Admin login** — navigates to `/auth`

---

## Web booking (`/book`)

**File:** `src/app/features/book/book.component.ts`

### Flow (4 steps)

| Step | Screen | Validation |
|------|--------|------------|
| 1 | Details | Service, date, slot, address, phone |
| 2 | OTP | Demo OTP: **`123456`** |
| 3 | Payment | UPI / Card / COD |
| 4 | Done | Booking ID shown |

### Pricing (demo)

| Service | Price |
|---------|-------|
| Deep clean | ₹499 |
| Regular | ₹149 |
| Kitchen focus | ₹299 |

### Admin integration

On payment confirm → `AppStateService.addInboundBooking()` → appears in `/admin/bookings` with **Web** badge.

---

## Partner hub (`/partner`)

**File:** `src/app/features/partner/partner.component.ts`

### Tabs

| Tab | Content |
|-----|---------|
| **Today** | KPIs, today's job list (demo seeded) |
| **Onboarding** | 4-step wizard: Profile → Documents → Bank → Review |
| **Earnings** | Weekly earnings table (demo seeded) |

### Onboarding submit

→ `AppStateService.addPartnerApplication()` → `/admin/maids` partner review queue.

### Note

This is a **web preview** of partner UX. Production partner experience → **QuickMaid-App** (separate repo).

---

## Staff auth (`/auth`)

**File:** `src/app/features/auth/auth.component.ts`

| Tab | Fields |
|-----|--------|
| Login | Email or 10-digit mobile, password, role, remember me |
| Signup | Name, email, phone, city, password, terms |

**Demo:** Any valid email/phone format + any password → session stored → `/admin/dashboard`.

**Roles:** Admin, Manager, Analyst, Support (display only in prototype).

---

## About (`/about`)

Company story, mission, team highlights. Uses `qm-public.css` styling.

---

## Contact (`/contact`)

Contact form, phone, WhatsApp, email. Demo submit shows toast (no backend).

Constants: `CONTACT_PHONE_WA`, `TEL_HREF` in `site.constants.ts`.

---

## Terms & Privacy (`/terms`, `/privacy`)

Legal content pages with SEO meta via `SeoService`. Shared `qm-legal.css` styling.

---

## System status (`/status`)

Public uptime dashboard — service health list, incident subscribe (demo).

---

## SEO & site constants

**File:** `src/app/core/site.constants.ts`

| Constant | Purpose |
|----------|---------|
| `SITE_ORIGIN` | `https://quickmaid.in` — canonical base |
| `CONTACT_PHONE_WA` | WhatsApp deep link |
| `QM_DEFAULT_TITLE` | Default page title |
| `QM_DEFAULT_DESCRIPTION` | Default meta description |
| `DEFAULT_OG_IMAGE_PATH` | Open Graph image |

**Service:** `SeoService` — set per page in `ngOnInit`, reset in `ngOnDestroy`.

---

## Shared public styling

| File | Used by |
|------|---------|
| `features/public-shell.css` | Book, partner, status |
| `features/public-pages/qm-public.css` | About, contact |
| `features/seo-pages/qm-legal.css` | Terms, privacy |
| `src/styles.css` | Landing (global) |

---

## Related docs

- [Demo Walkthrough](./DEMO_WALKTHROUGH.md) — live demo script
- [Architecture](./ARCHITECTURE.md) — `AppStateService` data flows
- [Platform](./PLATFORM.md) — web vs mobile split
