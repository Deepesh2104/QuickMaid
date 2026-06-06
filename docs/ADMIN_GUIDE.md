# Admin Console Guide

Screen-by-screen reference for `/admin`. All data is **demo/seeded** unless noted as **live** (from `AppStateService`).

**Login:** `/auth` → any valid email/phone + any password → `/admin/dashboard`

---

## Navigation structure

| Section | Screens |
|---------|---------|
| **Main** | Dashboard, Executive, Bookings, Dispatch, Customers, Maids, Add maid |
| **Finance & growth** | Revenue, Payouts, Plans, Reports, Campaigns, Corporate |
| **Operations** | Zones, Reviews, Training & QC |
| **People & support** | Team, Support, Knowledge base, Alerts |
| **Platform** | Audit log, Compliance, Integrations, Settings |

**Live nav badges:** Bookings count, Maids pending partners, Support queue, Campaigns waitlist.

---

## Main

### Dashboard (`/admin/dashboard`)

**Purpose:** Ops command center — KPIs, charts, capacity, alerts.

| Feature | Details |
|---------|---------|
| Date range | 7d / 30d / 90d filter |
| Charts | GMV trend, booking mix (Chart.js) |
| Ops alert banner | **Live** — links when inbound bookings, partner apps, or waitlist exist |
| Actions | Refresh data, capacity view |
| Export | CSV / JSON KPI export |

Uses `dash-*` CSS (not `adm-*`).

---

### Executive (`/admin/executive`)

**Purpose:** Leadership snapshot — board-ready metrics.

| Feature | Details |
|---------|---------|
| Actions | Board pack preview |
| Export | `.txt` board pack download |

---

### Bookings (`/admin/bookings`)

**Purpose:** Booking pipeline — assign, reassign, refunds, SLA.

| Feature | Details |
|---------|---------|
| Filters | Status (all / ongoing / completed / no-show), instant search |
| **Live rows** | Web bookings from `/book` show **Web** badge + row highlight |
| Row actions | View detail, cancel, refund, reassign |
| Bulk | Auto-assign by zone |
| Dispatch link | Uses `DispatchEngineService` for reassign/backup |
| Export | CSV (filtered or all) |

---

### Dispatch (`/admin/dispatch`)

**Purpose:** Real-time assignment board.

| Feature | Details |
|---------|---------|
| Board | Unassigned queue + maid columns |
| Actions | Drag-drop assign, auto-assign queue, rebalance all |
| Shared state | `DispatchEngineService` (same engine as Bookings) |

---

### Customers (`/admin/customers`)

**Purpose:** CRM — segments, health scores, outreach.

| Feature | Details |
|---------|---------|
| Filters | Plan (instant / monthly / annual), health (VIP / active / at-risk), search |
| Profile modal | Full customer detail (`admin-profile.css`) |
| Actions | Segment sync, message templates, win-back campaigns |
| Export | CSV with optional PII mask toggle |

---

### Maids (`/admin/maids`)

**Purpose:** Partner roster, KYC, payouts, partner review queue.

| Feature | Details |
|---------|---------|
| Filters | Status, zone, search |
| **Live queue** | Partner applications from `/partner` onboarding |
| **Persisted roster** | Approved maids saved in `approvedMaids` |
| Profile modal | Full maid detail drawer |
| Row actions | Edit, approve, reject, suspend, reinstate, remove, payout |
| Bulk | Bulk KYC verification |
| Export | CSV (filtered or all) |

---

### Add maid (`/admin/add-maid`)

**Purpose:** Manual maid onboarding form.

| Feature | Details |
|---------|---------|
| Form | Name, phone, zone, skills, KYC, UPI |
| Submit | Save & verify confirm → navigates to Maids |

---

## Finance & growth

### Revenue (`/admin/revenue`)

**Purpose:** GMV analytics, recognition ledger, FY snapshots.

| Feature | Details |
|---------|---------|
| Filters | Source (instant / subscription / B2B / addon), search |
| Charts | GMV stack, revenue mix |
| Actions | Refresh FY snapshot, ledger drill-down, board pack |
| Export | CSV / JSON ledger |

---

### Payouts (`/admin/payouts`)

**Purpose:** Maid payment batches and holds.

| Feature | Details |
|---------|---------|
| Filters | Status (all / ready / pending / held), search |
| Actions | Reconcile, batch pay all, per-row KYC hold / pay / notify |

---

### Plans (`/admin/plans`)

**Purpose:** Subscription plans and subscriber lifecycle.

| Feature | Details |
|---------|---------|
| Filters | Plan kind, account status, search |
| Actions | Price rules editor, new plan form, subscriber detail |
| Lifecycle | Pause, cancel subscriber |

---

### Reports (`/admin/reports`)

**Purpose:** Scheduled and on-demand report hub.

| Feature | Details |
|---------|---------|
| Actions | Schedule new report, run now (per row or ad-hoc) |
| Export | CSV / pseudo-PDF / XLSX download |

---

### Campaigns (`/admin/campaigns`)

**Purpose:** Coupons, promos, city waitlist management.

| Feature | Details |
|---------|---------|
| **Live waitlist** | Entries from landing page waitlist form |
| Actions | Create coupon, campaign detail, notify waitlist, remove entry |
| Export | Waitlist CSV |

---

### Corporate (`/admin/corporate`)

**Purpose:** B2B account management.

| Feature | Details |
|---------|---------|
| Actions | New B2B account, ERP sync toggle, account detail, push invoice |

---

## Operations

### Zones (`/admin/zones`)

**Purpose:** Geographic coverage and surge pricing.

| Feature | Details |
|---------|---------|
| Filters | Health (optimal → critical), search |
| Actions | Recalc coverage, add zone, policy editor, zone detail, surge pricing, pull maids |

Raipur zones: Tatibandh, Civil Lines, Shankar Nagar, Pandri, Telibandha, Mana.

---

### Reviews (`/admin/reviews`)

**Purpose:** Review moderation and response templates.

| Feature | Details |
|---------|---------|
| Filters | Bucket (all / 5★ / low / flagged), search |
| Actions | Reply (WhatsApp / SMS / in-app), escalate, mark helpful (rich modal) |
| Auto-reply | Rules editor |
| Export | CSV (filtered or all) |

---

### Training & QC (`/admin/quality`)

**Purpose:** Field audits and maid certification.

| Feature | Details |
|---------|---------|
| Filters | Maid selector |
| Actions | Schedule field audit, certification checklist, certify maid |

---

## People & support

### Team & roles (`/admin/team`)

**Purpose:** Internal staff RBAC (UI demo).

| Feature | Details |
|---------|---------|
| Actions | Invite user, edit role, suspend, resend invite |
| Note | No real Auth API — invites are in-memory |

---

### Support (`/admin/support`)

**Purpose:** Full ticket desk (3-column layout).

| Feature | Details |
|---------|---------|
| Layout | Hides admin sidebar/topbar (`support-host`) |
| Filters | Inbox filter, ticket search/sort |
| Actions | Chat, canned replies, bulk outreach, merge tickets |
| Quick actions | Refund, pause plan, backup maid |
| Analytics | CSAT, agent metrics |
| Export | Ticket CSV / JSON |

Uses `SupportFacadeService` + `TicketService`.

---

### Knowledge base (`/admin/knowledge-base`)

**Purpose:** Internal/partner/public articles.

| Feature | Details |
|---------|---------|
| Filters | Article search |
| Actions | Create/edit article, visibility toggle (internal / partner / public) |

---

### Alerts (`/admin/notifications`)

**Purpose:** Alert inbox and routing rules.

| Feature | Details |
|---------|---------|
| Actions | Alert detail, routing rule CRUD (severity → channel) |

---

## Platform

### Audit log (`/admin/audit`)

**Purpose:** Sensitive action trail.

| Feature | Details |
|---------|---------|
| Data | Seed entries + **live** `extraAudit` from `AppStateService` |
| Filters | Date range, actor |
| Actions | Entry detail modal |
| Export | CSV |

---

### Compliance (`/admin/compliance`)

**Purpose:** Privacy requests and PII controls.

| Feature | Details |
|---------|---------|
| Actions | DSAR request (export/delete), process queue, PII minimization toggle |

---

### Integrations (`/admin/integrations`)

**Purpose:** Third-party connector vault UI.

| Connectors | SMS, Razorpay, Google Maps, WhatsApp |
| Actions | Edit/rotate secrets, geo webhook |
| **Warning** | Values are demo-only — never commit real keys |

---

### Settings (`/admin/settings`)

**Purpose:** Platform toggles and demo reset.

| Toggles | Email bookings, SMS OTP, push dispatch, maintenance mode, 2FA payouts |
| Persistence | `qm_settings` in localStorage |
| Reset demo | Type **`RESET`** → clears `qm_app_state` (bookings, partners, waitlist, approved maids, audit) |

---

## Common UI patterns

| Pattern | Where |
|---------|-------|
| Toast feedback | Every confirm action |
| `adm-modal-backdrop` | Detail, confirm, form modals |
| CSV export | Most list screens |
| Segmented filters | `adm-seg` button groups |
| Profile drawer | Customers, Maids (👁 icon) |
| Theme picker | Admin topbar |

---

## Related docs

- [Demo Walkthrough](./DEMO_WALKTHROUGH.md) — live presentation script
- [Architecture](./ARCHITECTURE.md) — services and state
- [Development Guide](./DEVELOPMENT.md) — adding new screens
