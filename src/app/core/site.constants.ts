/**
 * Production site + contact defaults for SEO, CTAs, and structured data.
 * Deploy: use PathLocationStrategy (no hash) and configure the host so all paths
 * fall back to index.html (SPA). Update SITE_ORIGIN if the domain changes.
 */
export const SITE_ORIGIN = 'https://quickmaid.in';

/** WhatsApp number without + (wa.me format). */
export const CONTACT_PHONE_WA = '919876543210';

/** E.164 for tel: and schema.org telephone */
export const CONTACT_PHONE_E164 = `+${CONTACT_PHONE_WA}`;

export const DEFAULT_OG_IMAGE_PATH = '/assets/marketing/about-hero-ref.png';

export const WA_DEFAULT_BOOKING_TEXT =
  'Hi QuickMaid — Raipur se booking karna hai. Service aur slot bataiye.';

export const QM_DEFAULT_TITLE =
  'QuickMaid — Verified Maid & Home Cleaning in Raipur | WhatsApp Booking';

export const QM_DEFAULT_DESCRIPTION =
  'Book Aadhaar-verified maids in Raipur for cleaning, cooking, bartan & laundry. WhatsApp booking, monthly plans, clear prices. Official QuickMaid channels only.';

export function buildWhatsAppHref(message: string): string {
  return `https://wa.me/${CONTACT_PHONE_WA}?text=${encodeURIComponent(message)}`;
}

export const TEL_HREF = `tel:${CONTACT_PHONE_E164}`;
