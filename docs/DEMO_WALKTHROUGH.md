# Demo Walkthrough

A **15-minute live demo script** for stakeholders. Best on desktop (≥1024px width).

## Before you start

```bash
npm start
# Open http://localhost:4200 in Chrome/Edge, desktop width
```

1. **Reset demo data** (optional clean slate):
   - Login → `/admin/settings` → Reset demo data → type `RESET`
2. **Logout** if already logged in (topbar → Logout)
3. **Widen browser** to full screen

---

## Act 1 — Public experience (5 min)

### Landing page (`/`)

**Say:** *"QuickMaid is Raipur's verified home-cleaning marketplace — WhatsApp-first, with a full web booking option."*

Show:
- Hero + trust metrics
- Services grid and pricing plans
- Partner join section
- FAQ

**Action:** Scroll to city waitlist → enter email + city → submit.

**Say:** *"This feeds directly into our growth team's waitlist in admin."*

---

### Web booking (`/book`)

**Say:** *"Customers can book without installing an app."*

Walk through:
1. Select service (e.g. Deep clean — ₹499)
2. Pick date + time slot
3. Enter address (try including **Civil Lines** or **Pandri** for zone detection)
4. Enter 10-digit mobile
5. OTP step → enter **`123456`**
6. Choose payment method → confirm

**Say:** *"Booking is live in ops — no refresh needed on the admin side."*

---

### Partner portal (`/partner`)

**Say:** *"Maids onboard through a guided wizard."*

Walk through onboarding tabs:
1. Profile (name, phone, city, skills)
2. Documents (upload toggles — demo)
3. Bank details
4. Review → Submit

**Say:** *"Application lands in the partner review queue for ops approval."*

---

## Act 2 — Admin login (1 min)

### Staff login (`/auth`)

**Say:** *"Internal team uses role-based access — Admin, Manager, Analyst, Support."*

- Email: `demo@quickmaid.in` (or any valid email)
- Password: anything (e.g. `demo1234`)
- Role: **Admin**
- Check **Remember me** (optional)

Submit → lands on **Dashboard**.

---

## Act 3 — Operations (5 min)

### Dashboard (`/admin/dashboard`)

**Say:** *"Ops sees live alerts when web bookings or partner apps come in."*

Point out:
- **Ops alert banner** (should show inbound booking + partner app)
- KPI tiles and GMV chart
- Date range toggle

---

### Bookings (`/admin/bookings`)

**Say:** *"Web bookings are tagged and highlighted."*

Show:
- **Web** badge on the row you just created
- Row highlight
- Open booking detail modal
- Try reassign (dispatch integration)

Filter by status, export CSV.

---

### Dispatch (`/admin/dispatch`)

**Say:** *"Dispatch board shares state with bookings."*

Show:
- Unassigned queue
- Drag a job to a maid column (or auto-assign)
- Activity log updates

---

### Maids (`/admin/maids`)

**Say:** *"Partner applications from the portal appear here."*

Show:
- Partner review queue banner
- Open application → **Approve**
- Approved maid persists in roster (refresh page to prove)

Open profile modal (👁) on any maid — simple professional detail view.

---

### Customers (`/admin/customers`)

Quick tour:
- Segment filters (VIP, at-risk)
- Profile modal with booking history metrics
- CSV export with PII mask option

---

## Act 4 — Growth & finance (3 min)

### Campaigns (`/admin/campaigns`)

**Say:** *"Waitlist from the landing page shows here."*

Show:
- Waitlist table with your entry
- Notify modal, remove action
- Export waitlist CSV
- Coupon campaigns section

---

### Revenue (`/admin/revenue`)

Show:
- GMV chart + source filters
- Ledger drill-down modal
- FY snapshot refresh

---

### Payouts (`/admin/payouts`)

Show:
- Ready / pending / held filters
- Batch pay demo action

---

## Act 5 — Support & platform (2 min)

### Support (`/admin/support`)

**Say:** *"Full ticket desk — merges, canned replies, quick refund actions."*

Note: sidebar hides for immersive layout.

Pick a ticket → show chat panel, canned reply, quick action.

---

### Audit log (`/admin/audit`)

**Say:** *"Every web action we triggered is logged."*

Show entries for `booking.created`, `partner.apply`, `waitlist.join`.

Export CSV.

---

### Settings (`/admin/settings`)

Show platform toggles (maintenance mode, SMS OTP).

**Optional:** Reset demo with `RESET` if presenting again.

---

## Act 6 — Theming (30 sec)

Click **theme picker** in admin topbar → switch to Indigo or Violet.

**Say:** *"White-label ready — one CSS variable change or runtime preset."*

---

## Demo talking points

| Topic | Line |
|-------|------|
| Verification | Aadhaar-verified maids, KYC queue in admin |
| Geography | Zone-based dispatch for Raipur micro-markets |
| Channels | WhatsApp primary + web booking secondary |
| B2B | Corporate accounts module for offices |
| Compliance | DSAR queue, audit trail, PII controls |
| Phase 3 | Demo state → real API, Razorpay, MSG91 SMS |

---

## Troubleshooting during demo

| Problem | Fix |
|---------|-----|
| No web booking in admin | Same browser? Check localStorage not blocked |
| Mobile block screen | Widen browser to ≥1024px |
| Session expired | Re-login at `/auth` |
| Stale data | Settings → Reset → `RESET` |
| Chart blank | Scroll chart into view; try date range toggle |

---

## Related docs

- [Admin Guide](./ADMIN_GUIDE.md) — full screen reference
- [Architecture](./ARCHITECTURE.md) — how live state works
- [Phase 3 Backend](./PHASE3_BACKEND.md) — production roadmap
