-- =============================================================================
-- QuickMaid Schema Migration: v1.1 → v1.2 FINAL
-- =============================================================================
-- Run on PostgreSQL 14+ after v1.1 migration is applied.
-- See SCHEMA_FINAL.md for full specification and architecture notes.
-- =============================================================================

BEGIN;

-- -----------------------------------------------------------------------------
-- 1. NEW ENUMS
-- -----------------------------------------------------------------------------

DO $$ BEGIN
  CREATE TYPE domain_event_status AS ENUM ('pending', 'published', 'failed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE corporate_user_role AS ENUM ('admin', 'approver', 'employee');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE integration_provider AS ENUM (
    'razorpay', 'fcm', 'msg91', 'twilio', 'digilocker', 'google_places', 'sentry'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TYPE wallet_entry_source ADD VALUE IF NOT EXISTS 'adjustment';

-- -----------------------------------------------------------------------------
-- 2. CUSTOMERS & MAIDS — denormalized counter sync metadata
-- -----------------------------------------------------------------------------

ALTER TABLE customers
  ADD COLUMN IF NOT EXISTS counters_synced_at timestamp;

ALTER TABLE maids
  ADD COLUMN IF NOT EXISTS rating_synced_at timestamp;

COMMENT ON COLUMN customers.total_visits IS 'Denormalized — synced from bookings via nightly job';
COMMENT ON COLUMN customers.total_spent_paise IS 'Denormalized — synced from bookings via nightly job';
COMMENT ON COLUMN customers.avg_csat IS 'Denormalized — synced from booking_reviews';
COMMENT ON COLUMN maids.avg_rating IS 'Denormalized — synced from booking_reviews';
COMMENT ON COLUMN maids.total_jobs IS 'Denormalized — synced from completed bookings';
COMMENT ON COLUMN maids.age IS 'DEPRECATED — use date_of_birth; retained for backward compatibility';

-- -----------------------------------------------------------------------------
-- 3. BOOKINGS — B2B link + optimistic locking
-- -----------------------------------------------------------------------------

ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS corporate_account_id uuid REFERENCES corporate_accounts(id),
  ADD COLUMN IF NOT EXISTS row_version int NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_bookings_corporate
  ON bookings (corporate_account_id)
  WHERE corporate_account_id IS NOT NULL;

-- -----------------------------------------------------------------------------
-- 4. CORPORATE MODULE
-- -----------------------------------------------------------------------------

ALTER TABLE corporate_accounts
  ADD COLUMN IF NOT EXISTS updated_at timestamp NOT NULL DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_corporate_accounts_status ON corporate_accounts (status);
CREATE INDEX IF NOT EXISTS idx_corporate_accounts_city ON corporate_accounts (city_id);

CREATE TABLE IF NOT EXISTS corporate_account_users (
  corporate_account_id uuid NOT NULL REFERENCES corporate_accounts(id) ON DELETE CASCADE,
  customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  role corporate_user_role NOT NULL DEFAULT 'employee',
  department varchar(100),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp NOT NULL DEFAULT now(),
  PRIMARY KEY (corporate_account_id, customer_id)
);

CREATE INDEX IF NOT EXISTS idx_corporate_users_customer ON corporate_account_users (customer_id);

CREATE TABLE IF NOT EXISTS corporate_booking_policies (
  corporate_account_id uuid PRIMARY KEY REFERENCES corporate_accounts(id) ON DELETE CASCADE,
  approval_required boolean NOT NULL DEFAULT false,
  spend_limit_paise bigint,
  auto_approve_under_paise int DEFAULT 0,
  allowed_zones uuid[],
  updated_at timestamp NOT NULL DEFAULT now()
);

-- -----------------------------------------------------------------------------
-- 5. TRANSACTIONAL OUTBOX
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS domain_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  aggregate_type varchar(50) NOT NULL,
  aggregate_id uuid NOT NULL,
  event_type varchar(100) NOT NULL,
  payload jsonb NOT NULL,
  status domain_event_status NOT NULL DEFAULT 'pending',
  published_at timestamp,
  retry_count int NOT NULL DEFAULT 0,
  last_error text,
  created_at timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_domain_events_pending
  ON domain_events (status, created_at)
  WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS idx_domain_events_aggregate
  ON domain_events (aggregate_type, aggregate_id);

CREATE INDEX IF NOT EXISTS idx_domain_events_type ON domain_events (event_type);

-- -----------------------------------------------------------------------------
-- 6. TRAINING & QUALITY
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS training_courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code varchar(32) UNIQUE NOT NULL,
  title varchar(200) NOT NULL,
  description text,
  duration_minutes int NOT NULL DEFAULT 15,
  is_mandatory boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS maid_training_completions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  maid_id uuid NOT NULL REFERENCES maids(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES training_courses(id) ON DELETE CASCADE,
  score smallint CHECK (score IS NULL OR (score >= 0 AND score <= 100)),
  completed_at timestamp NOT NULL DEFAULT now(),
  expires_at timestamp,
  UNIQUE (maid_id, course_id)
);

CREATE INDEX IF NOT EXISTS idx_maid_training_maid ON maid_training_completions (maid_id);

-- Seed mandatory courses (idempotent)
INSERT INTO training_courses (code, title, description, duration_minutes, is_mandatory, sort_order)
VALUES
  ('HYGIENE-101', 'Hygiene & Safety Basics', 'Hand washing, PPE, chemical safety', 20, true, 1),
  ('CUSTOMER-101', 'Customer Service Standards', 'Greeting, communication, complaint handling', 15, true, 2),
  ('APP-101', 'Partner App Walkthrough', 'Accept jobs, OTP, navigation, earnings', 10, true, 3)
ON CONFLICT (code) DO NOTHING;

-- -----------------------------------------------------------------------------
-- 7. PLATFORM OPS
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS feature_flags (
  key varchar(64) NOT NULL,
  environment varchar(20) NOT NULL DEFAULT 'prod',
  value jsonb NOT NULL DEFAULT 'true',
  description varchar(255),
  is_enabled boolean NOT NULL DEFAULT true,
  updated_by uuid REFERENCES admin_users(id),
  updated_at timestamp NOT NULL DEFAULT now(),
  PRIMARY KEY (key, environment)
);

CREATE TABLE IF NOT EXISTS integration_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider integration_provider NOT NULL,
  environment varchar(20) NOT NULL DEFAULT 'prod',
  display_name varchar(100) NOT NULL,
  config_encrypted text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  last_verified_at timestamp,
  updated_by uuid REFERENCES admin_users(id),
  updated_at timestamp NOT NULL DEFAULT now(),
  UNIQUE (provider, environment)
);

CREATE TABLE IF NOT EXISTS analytics_daily_snapshots (
  snapshot_date date NOT NULL,
  city_id uuid NOT NULL REFERENCES cities(id),
  bookings_created int NOT NULL DEFAULT 0,
  bookings_completed int NOT NULL DEFAULT 0,
  bookings_cancelled int NOT NULL DEFAULT 0,
  gmv_paise bigint NOT NULL DEFAULT 0,
  accept_rate_pct decimal(5,2),
  cancel_rate_pct decimal(5,2),
  active_maids int NOT NULL DEFAULT 0,
  active_customers int NOT NULL DEFAULT 0,
  refreshed_at timestamp NOT NULL DEFAULT now(),
  PRIMARY KEY (snapshot_date, city_id)
);

CREATE INDEX IF NOT EXISTS idx_analytics_snapshots_date ON analytics_daily_snapshots (snapshot_date);

CREATE TABLE IF NOT EXISTS schema_migrations (
  version varchar(20) PRIMARY KEY,
  applied_at timestamp NOT NULL DEFAULT now(),
  applied_by varchar(100),
  checksum varchar(64)
);

-- -----------------------------------------------------------------------------
-- 8. INDEX IMPROVEMENTS
-- -----------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_booking_reviews_customer ON booking_reviews (customer_id);
CREATE INDEX IF NOT EXISTS idx_booking_reviews_created ON booking_reviews (created_at);
CREATE INDEX IF NOT EXISTS idx_location_pings_booking_time ON maid_location_pings (booking_id, recorded_at);

-- Rating CHECK constraints (idempotent)
DO $$ BEGIN
  ALTER TABLE booking_reviews ADD CONSTRAINT chk_review_rating
    CHECK (rating >= 1 AND rating <= 5);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- -----------------------------------------------------------------------------
-- 9. RECORD MIGRATION
-- -----------------------------------------------------------------------------

INSERT INTO schema_migrations (version, applied_by, checksum)
VALUES ('v1.2', 'quickmaid.schema.v1.2.migration.sql', md5('v1.2-final'))
ON CONFLICT (version) DO NOTHING;

COMMIT;

-- =============================================================================
-- POST-MIGRATION (run separately in maintenance window — NOT inside transaction)
-- =============================================================================
-- See SCHEMA_FINAL.md § Partitioning for full scripts.
--
-- 1. Partition maid_location_pings by recorded_at (monthly)
-- 2. Partition audit_logs by created_at (monthly)
-- 3. Partition notifications by created_at (monthly)
-- 4. Create materialized view mv_daily_ops_summary from analytics_daily_snapshots
-- 5. Schedule Hangfire jobs: counter sync, snapshot refresh, outbox publisher
