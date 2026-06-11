-- =============================================================================
-- QuickMaid Schema Migration: v1.0 → v1.1
-- =============================================================================
-- Run on PostgreSQL 14+ after v1.0 base schema is applied.
-- See SCHEMA_REVISION_v1.1.md for rationale and impact analysis.
-- =============================================================================

BEGIN;

-- -----------------------------------------------------------------------------
-- 1. NEW ENUMS
-- -----------------------------------------------------------------------------

CREATE TYPE marital_status AS ENUM ('single', 'married', 'widowed', 'other');
CREATE TYPE travel_mode AS ENUM ('walk', 'cycle', 'bus', 'auto', 'bike');

ALTER TYPE payment_method_type ADD VALUE IF NOT EXISTS 'emi';
ALTER TYPE kyc_doc_type ADD VALUE IF NOT EXISTS 'selfie';

-- -----------------------------------------------------------------------------
-- 2. CUSTOMERS
-- -----------------------------------------------------------------------------

ALTER TABLE customers
  ADD COLUMN IF NOT EXISTS public_id varchar(20),
  ADD COLUMN IF NOT EXISTS email varchar(255);

-- Backfill public_id from internal id (replace with app sequence in production seeder)
UPDATE customers
SET public_id = 'CU-' || LPAD((ABS(hashtext(id::text)) % 9000000 + 1000000)::text, 7, '0')
WHERE public_id IS NULL;

ALTER TABLE customers
  ALTER COLUMN public_id SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_customers_public_id ON customers (public_id);

-- -----------------------------------------------------------------------------
-- 3. MAIDS
-- -----------------------------------------------------------------------------

ALTER TABLE maids
  ADD COLUMN IF NOT EXISTS first_name varchar(80),
  ADD COLUMN IF NOT EXISTS last_name varchar(80),
  ADD COLUMN IF NOT EXISTS date_of_birth date,
  ADD COLUMN IF NOT EXISTS marital_status marital_status,
  ADD COLUMN IF NOT EXISTS travel_mode travel_mode,
  ADD COLUMN IF NOT EXISTS work_radius_km smallint NOT NULL DEFAULT 5,
  ADD COLUMN IF NOT EXISTS alternate_phone varchar(15),
  ADD COLUMN IF NOT EXISTS photo_url text,
  ADD COLUMN IF NOT EXISTS referred_by_code varchar(20);

-- Backfill names from display_name
UPDATE maids
SET
  first_name = COALESCE(first_name, split_part(display_name, ' ', 1)),
  last_name = COALESCE(last_name, NULLIF(trim(substring(display_name from position(' ' in display_name))), ''), '')
WHERE first_name IS NULL;

-- -----------------------------------------------------------------------------
-- 4. BOOKING ASSIGNMENTS (dispatch TTL)
-- -----------------------------------------------------------------------------

ALTER TABLE booking_assignments
  ADD COLUMN IF NOT EXISTS expires_at timestamp,
  ADD COLUMN IF NOT EXISTS offer_round smallint NOT NULL DEFAULT 1;

CREATE INDEX IF NOT EXISTS idx_assignments_pending_expiry
  ON booking_assignments (maid_id, expires_at)
  WHERE response = 'pending' AND is_active = true;

-- One active accepted/pending assignment per booking
CREATE UNIQUE INDEX IF NOT EXISTS uq_assignment_active_per_booking
  ON booking_assignments (booking_id)
  WHERE is_active = true AND response IN ('pending', 'accepted');

-- -----------------------------------------------------------------------------
-- 5. CORPORATE ACCOUNTS (admin CRM)
-- -----------------------------------------------------------------------------

ALTER TABLE corporate_accounts
  ADD COLUMN IF NOT EXISTS seats int,
  ADD COLUMN IF NOT EXISTS mrr_paise bigint,
  ADD COLUMN IF NOT EXISTS erp_external_id varchar(50),
  ADD COLUMN IF NOT EXISTS trial_ends_at date;

-- -----------------------------------------------------------------------------
-- 6. NOTIFICATIONS (per-app inbox)
-- -----------------------------------------------------------------------------

ALTER TABLE notifications
  ADD COLUMN IF NOT EXISTS app_client varchar(20);

UPDATE notifications SET app_client = 'customer' WHERE app_client IS NULL;

ALTER TABLE notifications
  ALTER COLUMN app_client SET NOT NULL;

DROP INDEX IF EXISTS notifications_user_id_is_read_created_at_idx;
CREATE INDEX IF NOT EXISTS idx_notifications_inbox
  ON notifications (user_id, app_client, is_read, created_at DESC);

-- -----------------------------------------------------------------------------
-- 7. NEW TABLES
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS maid_dispatch_preferences (
  maid_id uuid PRIMARY KEY REFERENCES maids(id) ON DELETE CASCADE,
  auto_assign_enabled boolean NOT NULL DEFAULT true,
  alert_new_jobs boolean NOT NULL DEFAULT true,
  alert_sound_enabled boolean NOT NULL DEFAULT true,
  max_concurrent_jobs smallint NOT NULL DEFAULT 1,
  updated_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS api_idempotency_keys (
  key varchar(64) PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  endpoint varchar(120) NOT NULL,
  response_status smallint NOT NULL,
  response_body jsonb,
  created_at timestamp NOT NULL DEFAULT now(),
  expires_at timestamp NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_idempotency_expires ON api_idempotency_keys (expires_at);
CREATE INDEX IF NOT EXISTS idx_idempotency_user ON api_idempotency_keys (user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS status_display_mappings (
  domain varchar(32) NOT NULL,
  canonical_status varchar(32) NOT NULL,
  display_status varchar(32) NOT NULL,
  sort_order smallint NOT NULL DEFAULT 0,
  PRIMARY KEY (domain, canonical_status)
);

-- -----------------------------------------------------------------------------
-- 8. PERFORMANCE INDEXES
-- -----------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_bookings_customer_active
  ON bookings (customer_id, visit_date DESC)
  WHERE status NOT IN ('cancelled', 'completed', 'no_show');

CREATE INDEX IF NOT EXISTS idx_location_booking_latest
  ON maid_location_pings (booking_id, recorded_at DESC);

ALTER TABLE booking_reviews
  DROP CONSTRAINT IF EXISTS chk_booking_review_rating;

ALTER TABLE booking_reviews
  ADD CONSTRAINT chk_booking_review_rating CHECK (rating BETWEEN 1 AND 5);

-- -----------------------------------------------------------------------------
-- 9. SEED: status_display_mappings
-- -----------------------------------------------------------------------------

INSERT INTO status_display_mappings (domain, canonical_status, display_status, sort_order) VALUES
  -- Customer app
  ('booking_customer', 'draft', 'upcoming', 1),
  ('booking_customer', 'pending_payment', 'upcoming', 2),
  ('booking_customer', 'confirmed', 'upcoming', 3),
  ('booking_customer', 'assigned', 'upcoming', 4),
  ('booking_customer', 'en_route', 'upcoming', 5),
  ('booking_customer', 'in_progress', 'upcoming', 6),
  ('booking_customer', 'completed', 'completed', 7),
  ('booking_customer', 'cancelled', 'cancelled', 8),
  ('booking_customer', 'no_show', 'cancelled', 9),
  -- Partner app (assignment-driven)
  ('booking_partner', 'pending', 'pending', 1),
  ('booking_partner', 'accepted', 'accepted', 2),
  ('booking_partner', 'assigned', 'accepted', 3),
  ('booking_partner', 'in_progress', 'in_progress', 4),
  ('booking_partner', 'completed', 'completed', 5),
  ('booking_partner', 'declined', 'declined', 6),
  ('booking_partner', 'expired', 'declined', 7),
  -- Admin CRM
  ('booking_admin', 'assigned', 'ongoing', 1),
  ('booking_admin', 'en_route', 'ongoing', 2),
  ('booking_admin', 'in_progress', 'ongoing', 3),
  ('booking_admin', 'completed', 'completed', 4),
  ('booking_admin', 'no_show', 'no-show', 5),
  ('booking_admin', 'cancelled', 'cancelled', 6),
  -- Support tickets
  ('ticket_admin', 'open', 'open', 1),
  ('ticket_admin', 'in_review', 'progress', 2),
  ('ticket_admin', 'resolved', 'resolved', 3),
  ('ticket_admin', 'snoozed', 'snoozed', 4)
ON CONFLICT (domain, canonical_status) DO NOTHING;

-- Seed dispatch preferences for existing maids
INSERT INTO maid_dispatch_preferences (maid_id)
SELECT id FROM maids
ON CONFLICT (maid_id) DO NOTHING;

COMMIT;

-- =============================================================================
-- ROLLBACK (manual — run only if reverting v1.1)
-- =============================================================================
-- DROP TABLE IF EXISTS status_display_mappings;
-- DROP TABLE IF EXISTS api_idempotency_keys;
-- DROP TABLE IF EXISTS maid_dispatch_preferences;
-- ALTER TABLE notifications DROP COLUMN IF EXISTS app_client;
-- ALTER TABLE corporate_accounts DROP COLUMN IF EXISTS seats, mrr_paise, erp_external_id, trial_ends_at;
-- ALTER TABLE booking_assignments DROP COLUMN IF EXISTS expires_at, offer_round;
-- ALTER TABLE maids DROP COLUMN IF EXISTS first_name, last_name, date_of_birth, marital_status, travel_mode, work_radius_km, alternate_phone, photo_url, referred_by_code;
-- ALTER TABLE customers DROP COLUMN IF EXISTS public_id, email;
-- DROP TYPE IF EXISTS travel_mode;
-- DROP TYPE IF EXISTS marital_status;
