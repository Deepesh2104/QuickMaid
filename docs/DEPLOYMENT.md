# Deployment Guide

Deploy **this repository** (QuickMaid web + admin) as a **static SPA** to any CDN or static host.

> Mobile apps deploy via App Store / Play Store from **QuickMaid-App** repo (separate process).

## Build

```bash
npm install
npm run build
```

**Output directory:** `dist/quickmaid/`

Verify locally:

```bash
npx serve dist/quickmaid
# or: npx http-server dist/quickmaid
```

## Pre-deploy checklist

- [ ] `npm run build` succeeds
- [ ] `SITE_ORIGIN` in `src/app/core/site.constants.ts` matches production domain
- [ ] `src/sitemap.xml` URLs updated if domain changed
- [ ] `src/robots.txt` reviewed
- [ ] No `.env` or secrets in build output
- [ ] SPA fallback configured on host

## SPA routing (required)

Angular uses **PathLocationStrategy** — URLs like `/admin/dashboard` are client-side routes. The server must return `index.html` for unknown paths.

### Netlify

Included in build via `src/host-config/_redirects`:

```
/*    /index.html   200
```

Deploy `dist/quickmaid/` as publish directory.

### Vercel

`vercel.json` at project root (create if needed):

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

### Cloudflare Pages

Build command: `npm run build`  
Output directory: `dist/quickmaid`  
Add redirect rule: `/* /index.html 200`

### Nginx

```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

### Apache (.htaccess)

```apache
RewriteEngine On
RewriteBase /
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

## Environment-specific config

### Site origin

```typescript
// src/app/core/site.constants.ts
export const SITE_ORIGIN = 'https://quickmaid.in';
```

Used by `SeoService` for canonical URLs and Open Graph tags.

### Contact details

Same file:

- `CONTACT_PHONE_WA` — WhatsApp number (no `+`)
- `CONTACT_PHONE_E164` — tel: link
- `QM_DEFAULT_TITLE` / `QM_DEFAULT_DESCRIPTION` — default meta

## Assets included in build

| Asset | Source |
|-------|--------|
| `/assets/**` | `src/assets/` |
| `robots.txt` | `src/robots.txt` |
| `sitemap.xml` | `src/sitemap.xml` |
| `_redirects` | `src/host-config/_redirects` |

## Performance notes

- Production build uses output hashing (`outputHashing: all`)
- Initial bundle budget: 1 MB warning / 3 MB error
- Component style budget: 18 KB warning per component CSS
- Google Fonts loaded from CDN in `index.html` — build may inline fonts (requires network during build)

## CSS maintenance scripts

```bash
npm run audit:css   # Report bundle sizes
npm run purge:css   # Helper to identify unused CSS
```

## HTTPS

Always deploy behind HTTPS. Demo auth sessions in `localStorage`/`sessionStorage` are not secure without TLS.

## What is NOT deployed

This build is **front-end only**. You still need separate infrastructure for:

- REST/GraphQL API (Phase 3)
- Database
- SMS / OTP provider
- Payment gateway webhooks
- Cron jobs for scheduled reports

See [Phase 3 Backend](./PHASE3_BACKEND.md).

## Post-deploy smoke test

1. `/` — landing loads, fonts render
2. `/book` — complete a booking
3. `/auth` — login works
4. `/admin/dashboard` — ops alert visible
5. `/admin/bookings` — web booking appears
6. Hard refresh on `/admin/maids` — route resolves (SPA fallback works)
7. `/terms`, `/privacy` — legal pages load

## Related docs

- [Platform Overview](./PLATFORM.md)
- [Architecture](./ARCHITECTURE.md)
- [Development Guide](./DEVELOPMENT.md)
