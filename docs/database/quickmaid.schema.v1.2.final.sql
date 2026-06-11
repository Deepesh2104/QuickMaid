-- =============================================================================
-- QuickMaid Production Database Schema
-- =============================================================================
-- Engine     : PostgreSQL 14+
-- Version    : 1.2 FINAL
-- Tables     : 72
-- Generated  : June 2026
-- Usage      : psql -U quickmaid -d quickmaid -f quickmaid.schema.v1.2.final.sql
-- =============================================================================

BEGIN;

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- DROP (safe re-run — reverse dependency order)
-- =============================================================================

DROP TABLE IF EXISTS report_schedules CASCADE;
DROP TABLE IF EXISTS knowledge_base_articles CASCADE;
DROP TABLE IF EXISTS dsar_requests CASCADE;
DROP TABLE IF EXISTS platform_settings CASCADE;
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS admin_users CASCADE;
DROP TABLE IF EXISTS admin_role_permissions CASCADE;
DROP TABLE IF EXISTS admin_roles CASCADE;
DROP TABLE IF EXISTS permissions CASCADE;
DROP TABLE IF EXISTS schema_migrations CASCADE;
DROP TABLE IF EXISTS analytics_daily_snapshots CASCADE;
DROP TABLE IF EXISTS integration_configs CASCADE;
DROP TABLE IF EXISTS feature_flags CASCADE;
DROP TABLE IF EXISTS maid_training_completions CASCADE;
DROP TABLE IF EXISTS training_courses CASCADE;
DROP TABLE IF EXISTS admin_alert_rules CASCADE;
DROP TABLE IF EXISTS status_display_mappings CASCADE;
DROP TABLE IF EXISTS domain_events CASCADE;
DROP TABLE IF EXISTS api_idempotency_keys CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS device_push_tokens CASCADE;
DROP TABLE IF EXISTS booking_disputes CASCADE;
DROP TABLE IF EXISTS support_attachments CASCADE;
DROP TABLE IF EXISTS support_messages CASCADE;
DROP TABLE IF EXISTS support_tickets CASCADE;
DROP TABLE IF EXISTS maid_earnings_ledger CASCADE;
DROP TABLE IF EXISTS maid_payout_lines CASCADE;
DROP TABLE IF EXISTS payout_batches CASCADE;
DROP TABLE IF EXISTS corporate_booking_policies CASCADE;
DROP TABLE IF EXISTS corporate_account_users CASCADE;
DROP TABLE IF EXISTS corporate_accounts CASCADE;
DROP TABLE IF EXISTS waitlist_entries CASCADE;
DROP TABLE IF EXISTS referrals CASCADE;
DROP TABLE IF EXISTS coupon_redemptions CASCADE;
DROP TABLE IF EXISTS customer_coupons CASCADE;
DROP TABLE IF EXISTS coupon_campaigns CASCADE;
DROP TABLE IF EXISTS customer_subscriptions CASCADE;
DROP TABLE IF EXISTS wallet_ledger_entries CASCADE;
DROP TABLE IF EXISTS wallet_accounts CASCADE;
DROP TABLE IF EXISTS refunds CASCADE;
DROP TABLE IF EXISTS payment_transactions CASCADE;
DROP TABLE IF EXISTS payment_orders CASCADE;
DROP TABLE IF EXISTS booking_reviews CASCADE;
DROP TABLE IF EXISTS booking_assignments CASCADE;
DROP TABLE IF EXISTS booking_status_events CASCADE;
DROP TABLE IF EXISTS booking_line_items CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS maid_dispatch_preferences CASCADE;
DROP TABLE IF EXISTS maid_location_pings CASCADE;
DROP TABLE IF EXISTS maid_availability CASCADE;
DROP TABLE IF EXISTS maid_documents CASCADE;
DROP TABLE IF EXISTS maid_zones_map CASCADE;
DROP TABLE IF EXISTS maid_skills_map CASCADE;
DROP TABLE IF EXISTS maids CASCADE;
DROP TABLE IF EXISTS maid_applications CASCADE;
DROP TABLE IF EXISTS customer_saved_services CASCADE;
DROP TABLE IF EXISTS customer_payment_methods CASCADE;
DROP TABLE IF EXISTS customer_preferences CASCADE;
DROP TABLE IF EXISTS customer_addresses CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS auth_sessions CASCADE;
DROP TABLE IF EXISTS otp_verifications CASCADE;
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS subscription_plans CASCADE;
DROP TABLE IF EXISTS time_slots CASCADE;
DROP TABLE IF EXISTS skills CASCADE;
DROP TABLE IF EXISTS zone_services CASCADE;
DROP TABLE IF EXISTS services CASCADE;
DROP TABLE IF EXISTS service_categories CASCADE;
DROP TABLE IF EXISTS zones CASCADE;
DROP TABLE IF EXISTS cities CASCADE;

DROP TYPE IF EXISTS zone_health CASCADE;
DROP TYPE IF EXISTS customer_health CASCADE;
DROP TYPE IF EXISTS preferred_channel CASCADE;
DROP TYPE IF EXISTS cancel_reason CASCADE;
DROP TYPE IF EXISTS admin_role_key CASCADE;
DROP TYPE IF EXISTS payout_line_status CASCADE;
DROP TYPE IF EXISTS payout_batch_status CASCADE;
DROP TYPE IF EXISTS notification_category CASCADE;
DROP TYPE IF EXISTS notification_channel CASCADE;
DROP TYPE IF EXISTS message_sender CASCADE;
DROP TYPE IF EXISTS dispute_status CASCADE;
DROP TYPE IF EXISTS dispute_reason CASCADE;
DROP TYPE IF EXISTS ticket_status CASCADE;
DROP TYPE IF EXISTS ticket_topic CASCADE;
DROP TYPE IF EXISTS referral_status CASCADE;
DROP TYPE IF EXISTS customer_coupon_status CASCADE;
DROP TYPE IF EXISTS coupon_status CASCADE;
DROP TYPE IF EXISTS coupon_category CASCADE;
DROP TYPE IF EXISTS coupon_discount_type CASCADE;
DROP TYPE IF EXISTS subscription_status CASCADE;
DROP TYPE IF EXISTS subscription_plan_type CASCADE;
DROP TYPE IF EXISTS application_status CASCADE;
DROP TYPE IF EXISTS kyc_doc_status CASCADE;
DROP TYPE IF EXISTS travel_mode CASCADE;
DROP TYPE IF EXISTS marital_status CASCADE;
DROP TYPE IF EXISTS kyc_doc_type CASCADE;
DROP TYPE IF EXISTS maid_status CASCADE;
DROP TYPE IF EXISTS integration_provider CASCADE;
DROP TYPE IF EXISTS corporate_user_role CASCADE;
DROP TYPE IF EXISTS domain_event_status CASCADE;
DROP TYPE IF EXISTS wallet_entry_source CASCADE;
DROP TYPE IF EXISTS wallet_entry_type CASCADE;
DROP TYPE IF EXISTS refund_status CASCADE;
DROP TYPE IF EXISTS payment_status CASCADE;
DROP TYPE IF EXISTS booking_status CASCADE;
DROP TYPE IF EXISTS payment_method_type CASCADE;
DROP TYPE IF EXISTS address_label CASCADE;
DROP TYPE IF EXISTS home_type CASCADE;
DROP TYPE IF EXISTS gender CASCADE;
DROP TYPE IF EXISTS user_status CASCADE;
DROP TYPE IF EXISTS assignment_response CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;

-- =============================================================================
-- ENUMS
-- =============================================================================

CREATE TYPE user_role AS ENUM ('customer', 'maid', 'admin');
CREATE TYPE assignment_response AS ENUM ('pending', 'accepted', 'declined', 'expired');
CREATE TYPE user_status AS ENUM ('active', 'suspended', 'pending_verification', 'deleted');
CREATE TYPE gender AS ENUM ('female', 'male', 'other', 'prefer_not_to_say');
CREATE TYPE home_type AS ENUM ('bhk_1', 'bhk_2', 'bhk_3', 'villa', 'other');
CREATE TYPE address_label AS ENUM ('home', 'office', 'other');
CREATE TYPE payment_method_type AS ENUM ('upi', 'card', 'netbanking', 'wallet', 'cash', 'pay_later', 'emi');
CREATE TYPE booking_status AS ENUM ('draft', 'pending_payment', 'confirmed', 'assigned', 'en_route', 'in_progress', 'completed', 'cancelled', 'no_show');
CREATE TYPE payment_status AS ENUM ('created', 'authorized', 'captured', 'failed', 'refunded', 'partially_refunded');
CREATE TYPE refund_status AS ENUM ('requested', 'processing', 'completed', 'failed');
CREATE TYPE wallet_entry_type AS ENUM ('credit', 'debit', 'refund', 'bonus', 'adjustment');
CREATE TYPE wallet_entry_source AS ENUM ('topup', 'booking', 'plus_subscription', 'referral', 'promo', 'cancel_refund', 'admin_adjustment', 'adjustment');
CREATE TYPE domain_event_status AS ENUM ('pending', 'published', 'failed');
CREATE TYPE corporate_user_role AS ENUM ('admin', 'approver', 'employee');
CREATE TYPE integration_provider AS ENUM ('razorpay', 'fcm', 'msg91', 'twilio', 'digilocker', 'google_places', 'sentry');
CREATE TYPE maid_status AS ENUM ('pending_kyc', 'active', 'suspended', 'rejected', 'offboarded');
CREATE TYPE kyc_doc_type AS ENUM ('aadhaar', 'pan', 'police_verification', 'bank_proof', 'training_certificate', 'profile_photo', 'selfie');
CREATE TYPE marital_status AS ENUM ('single', 'married', 'widowed', 'other');
CREATE TYPE travel_mode AS ENUM ('walk', 'cycle', 'bus', 'auto', 'bike');
CREATE TYPE kyc_doc_status AS ENUM ('missing', 'pending', 'verified', 'rejected');
CREATE TYPE application_status AS ENUM ('submitted', 'under_review', 'approved', 'rejected');
CREATE TYPE subscription_plan_type AS ENUM ('instant', 'monthly', 'annual', 'plus', 'flex', 'onetime');
CREATE TYPE subscription_status AS ENUM ('active', 'paused', 'cancelled', 'expired');
CREATE TYPE coupon_discount_type AS ENUM ('percent', 'flat');
CREATE TYPE coupon_category AS ENUM ('booking', 'plus', 'all');
CREATE TYPE coupon_status AS ENUM ('draft', 'live', 'ended');
CREATE TYPE customer_coupon_status AS ENUM ('active', 'used', 'expired');
CREATE TYPE referral_status AS ENUM ('pending', 'credited', 'expired');
CREATE TYPE ticket_topic AS ENUM ('booking', 'payment', 'plus', 'partner', 'dispute', 'other');
CREATE TYPE ticket_status AS ENUM ('open', 'in_review', 'resolved', 'snoozed');
CREATE TYPE dispute_reason AS ENUM ('quality', 'incomplete', 'damage', 'behavior', 'billing', 'other');
CREATE TYPE dispute_status AS ENUM ('submitted', 'in_review', 'resolved', 'rejected');
CREATE TYPE message_sender AS ENUM ('customer', 'maid', 'agent', 'system');
CREATE TYPE notification_channel AS ENUM ('push', 'sms', 'whatsapp', 'email', 'in_app');
CREATE TYPE notification_category AS ENUM ('booking', 'pro', 'payment', 'offer', 'system');
CREATE TYPE payout_batch_status AS ENUM ('draft', 'processing', 'paid', 'failed', 'held');
CREATE TYPE payout_line_status AS ENUM ('pending', 'ready', 'held', 'paid', 'failed');
CREATE TYPE admin_role_key AS ENUM ('super_admin', 'ops_manager', 'support_l1', 'support_l2', 'analyst', 'finance');
CREATE TYPE cancel_reason AS ENUM ('schedule', 'alternative', 'maid', 'price', 'no_show', 'admin', 'other');
CREATE TYPE preferred_channel AS ENUM ('whatsapp', 'sms', 'call');
CREATE TYPE customer_health AS ENUM ('vip', 'active', 'at_risk', 'churned');
CREATE TYPE zone_health AS ENUM ('optimal', 'good', 'needs_supply', 'under_served', 'critical');

-- =============================================================================
-- GEOGRAPHY & SERVICE CATALOG
-- =============================================================================

CREATE TABLE cities (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code            varchar(32)  NOT NULL UNIQUE,
  name            varchar(100) NOT NULL,
  state           varchar(100) NOT NULL,
  country_code    char(2)      NOT NULL DEFAULT 'IN',
  is_live         boolean      NOT NULL DEFAULT false,
  timezone        varchar(64)  NOT NULL DEFAULT 'Asia/Kolkata',
  created_at      timestamp    NOT NULL DEFAULT now(),
  updated_at      timestamp    NOT NULL DEFAULT now()
);

CREATE TABLE zones (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id         uuid         NOT NULL REFERENCES cities(id),
  slug            varchar(64)  NOT NULL,
  name            varchar(100) NOT NULL,
  pincode         varchar(10),
  center_lat      decimal(10,7),
  center_lng      decimal(10,7),
  radius_km       decimal(6,2) DEFAULT 5,
  demand_score    int          DEFAULT 0,
  supply_score    int          DEFAULT 0,
  coverage_pct    decimal(5,2) DEFAULT 0,
  avg_eta_minutes int,
  health          zone_health  DEFAULT 'good',
  surge_active    boolean      NOT NULL DEFAULT false,
  surge_pct       decimal(5,2) DEFAULT 0,
  peak_hours      varchar(100),
  is_active       boolean      NOT NULL DEFAULT true,
  created_at      timestamp    NOT NULL DEFAULT now(),
  updated_at      timestamp    NOT NULL DEFAULT now(),
  UNIQUE (city_id, slug)
);

CREATE INDEX idx_zones_city ON zones (city_id);

CREATE TABLE service_categories (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        varchar(64)  NOT NULL UNIQUE,
  name        varchar(100) NOT NULL,
  sort_order  int          NOT NULL DEFAULT 0,
  is_active   boolean      NOT NULL DEFAULT true
);

CREATE TABLE services (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug              varchar(64)   NOT NULL UNIQUE,
  category_id       uuid          NOT NULL REFERENCES service_categories(id),
  name              varchar(150)  NOT NULL,
  description       text,
  base_price_paise  int           NOT NULL,
  duration_minutes  int,
  badge             varchar(32),
  perks             jsonb,
  icon_key          varchar(64),
  tint_hex          char(7),
  avg_rating        decimal(3,2)  DEFAULT 0,
  review_count      int           DEFAULT 0,
  is_active         boolean       NOT NULL DEFAULT true,
  sort_order        int           DEFAULT 0,
  created_at        timestamp     NOT NULL DEFAULT now(),
  updated_at        timestamp     NOT NULL DEFAULT now()
);

CREATE INDEX idx_services_category ON services (category_id);
CREATE INDEX idx_services_active ON services (is_active);

CREATE TABLE zone_services (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id             uuid NOT NULL REFERENCES zones(id) ON DELETE CASCADE,
  service_id          uuid NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  is_top_service      boolean DEFAULT false,
  price_override_paise int,
  UNIQUE (zone_id, service_id)
);

CREATE TABLE skills (
  id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code      varchar(64)  NOT NULL UNIQUE,
  label     varchar(100) NOT NULL,
  is_active boolean      DEFAULT true
);

CREATE TABLE time_slots (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code        varchar(32)  NOT NULL UNIQUE,
  label       varchar(100) NOT NULL,
  day_mask    varchar(20),
  start_time  time,
  end_time    time,
  sort_order  int       DEFAULT 0,
  is_active   boolean   DEFAULT true
);

CREATE TABLE subscription_plans (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code            varchar(32) NOT NULL UNIQUE,
  plan_type       subscription_plan_type NOT NULL,
  name            varchar(100) NOT NULL,
  price_paise     int NOT NULL,
  visit_credits   int,
  validity_days   int,
  discount_pct    decimal(5,2) DEFAULT 0,
  is_active       boolean DEFAULT true,
  created_at      timestamp NOT NULL DEFAULT now()
);

-- =============================================================================
-- AUTH & IDENTITY
-- =============================================================================

CREATE TABLE users (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone               varchar(15) NOT NULL UNIQUE,
  email               varchar(255),
  phone_verified_at   timestamp,
  email_verified_at   timestamp,
  status              user_status NOT NULL DEFAULT 'pending_verification',
  last_login_at       timestamp,
  created_at          timestamp NOT NULL DEFAULT now(),
  updated_at          timestamp NOT NULL DEFAULT now(),
  deleted_at          timestamp
);

CREATE INDEX idx_users_status ON users (status);

CREATE TABLE user_roles (
  user_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role        user_role NOT NULL,
  granted_at  timestamp NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, role)
);

CREATE TABLE otp_verifications (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone       varchar(15) NOT NULL,
  otp_hash    varchar(128) NOT NULL,
  purpose     varchar(32) NOT NULL,
  attempts    int NOT NULL DEFAULT 0,
  expires_at  timestamp NOT NULL,
  verified_at timestamp,
  ip_address  varchar(45),
  created_at  timestamp NOT NULL DEFAULT now()
);

CREATE INDEX idx_otp_phone_purpose ON otp_verifications (phone, purpose, created_at DESC);

CREATE TABLE auth_sessions (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  refresh_token_hash  varchar(128) NOT NULL,
  device_id           varchar(128),
  device_name         varchar(100),
  app_client          varchar(32) NOT NULL,
  ip_address          varchar(45),
  user_agent          text,
  expires_at          timestamp NOT NULL,
  revoked_at          timestamp,
  created_at          timestamp NOT NULL DEFAULT now()
);

CREATE INDEX idx_auth_sessions_user ON auth_sessions (user_id);
CREATE INDEX idx_auth_sessions_expires ON auth_sessions (expires_at);

-- =============================================================================
-- ADMIN RBAC (created early — referenced by maid_applications, etc.)
-- =============================================================================

CREATE TABLE permissions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code        varchar(64) NOT NULL UNIQUE,
  description varchar(255)
);

CREATE TABLE admin_roles (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role_key    admin_role_key NOT NULL UNIQUE,
  name        varchar(100) NOT NULL,
  description text
);

CREATE TABLE admin_role_permissions (
  role_id       uuid NOT NULL REFERENCES admin_roles(id) ON DELETE CASCADE,
  permission_id uuid NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE admin_users (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  role_id         uuid NOT NULL REFERENCES admin_roles(id),
  display_name    varchar(150) NOT NULL,
  login_id        varchar(100) NOT NULL UNIQUE,
  status          varchar(20) NOT NULL DEFAULT 'active',
  last_active_at  timestamp,
  invited_by      uuid REFERENCES admin_users(id),
  created_at      timestamp NOT NULL DEFAULT now()
);

-- =============================================================================
-- CUSTOMERS
-- =============================================================================

CREATE TABLE customers (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 uuid NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  public_id               varchar(20) NOT NULL UNIQUE,
  city_id                 uuid REFERENCES cities(id),
  name                    varchar(150) NOT NULL,
  email                   varchar(255),
  gender                  gender,
  home_type               home_type,
  locality                varchar(150),
  default_zone_id         uuid REFERENCES zones(id),
  avatar_url              text,
  language                char(2) NOT NULL DEFAULT 'en',
  referral_code           varchar(20) NOT NULL UNIQUE,
  referred_by_customer_id uuid REFERENCES customers(id),
  member_since            date NOT NULL DEFAULT CURRENT_DATE,
  health_segment          customer_health DEFAULT 'active',
  total_visits            int NOT NULL DEFAULT 0,
  total_spent_paise       bigint NOT NULL DEFAULT 0,
  avg_csat                decimal(3,2),
  counters_synced_at      timestamp,
  created_at              timestamp NOT NULL DEFAULT now(),
  updated_at              timestamp NOT NULL DEFAULT now(),
  deleted_at              timestamp
);

CREATE INDEX idx_customers_public_id ON customers (public_id);
CREATE INDEX idx_customers_referral_code ON customers (referral_code);
CREATE INDEX idx_customers_city ON customers (city_id);
CREATE INDEX idx_customers_health ON customers (health_segment);

CREATE TABLE customer_addresses (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id     uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  label           address_label NOT NULL,
  label_note      varchar(100),
  flat_no         varchar(50),
  building        varchar(150),
  street          varchar(255) NOT NULL,
  landmark        varchar(150),
  zone_id         uuid NOT NULL REFERENCES zones(id),
  pincode         varchar(10) NOT NULL,
  city_id         uuid NOT NULL REFERENCES cities(id),
  gate_code       varchar(50),
  contact_phone   varchar(15),
  latitude        decimal(10,7),
  longitude       decimal(10,7),
  formatted_line  text NOT NULL,
  is_default      boolean NOT NULL DEFAULT false,
  created_at      timestamp NOT NULL DEFAULT now(),
  updated_at      timestamp NOT NULL DEFAULT now(),
  deleted_at      timestamp
);

CREATE INDEX idx_customer_addresses_customer ON customer_addresses (customer_id);
CREATE INDEX idx_customer_addresses_default ON customer_addresses (customer_id, is_default);

CREATE TABLE customer_payment_methods (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id     uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  method_type     payment_method_type NOT NULL,
  label           varchar(100) NOT NULL,
  masked_detail   varchar(100) NOT NULL,
  gateway_token   varchar(255),
  is_default      boolean DEFAULT false,
  created_at      timestamp NOT NULL DEFAULT now(),
  deleted_at      timestamp
);

CREATE INDEX idx_customer_payment_methods ON customer_payment_methods (customer_id);

CREATE TABLE customer_saved_services (
  customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  service_id  uuid NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  saved_at    timestamp NOT NULL DEFAULT now(),
  PRIMARY KEY (customer_id, service_id)
);

-- =============================================================================
-- MAIDS / PARTNERS
-- =============================================================================

CREATE TABLE maid_applications (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  public_id               varchar(20) NOT NULL UNIQUE,
  user_id                 uuid REFERENCES users(id),
  existing_customer_id    uuid REFERENCES customers(id),
  full_name               varchar(150) NOT NULL,
  phone                   varchar(15) NOT NULL,
  city_id                 uuid REFERENCES cities(id),
  zone_id                 uuid REFERENCES zones(id),
  skills_text             varchar(255),
  age                     int,
  aadhaar_number_encrypted text,
  bank_name               varchar(100),
  bank_account_encrypted  text,
  ifsc                    varchar(20),
  upi_id                  varchar(100),
  emergency_contact       varchar(100),
  notes                   text,
  status                  application_status NOT NULL DEFAULT 'submitted',
  submitted_at            timestamp NOT NULL DEFAULT now(),
  reviewed_by             uuid REFERENCES admin_users(id),
  reviewed_at             timestamp,
  reject_reason           text,
  approved_maid_id        uuid
);

CREATE INDEX idx_maid_applications_phone_status ON maid_applications (phone, status);
CREATE INDEX idx_maid_applications_user ON maid_applications (user_id);
CREATE INDEX idx_maid_applications_status ON maid_applications (status);

CREATE TABLE maids (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  linked_customer_id  uuid UNIQUE REFERENCES customers(id),
  public_id           varchar(20) NOT NULL UNIQUE,
  application_id      uuid REFERENCES maid_applications(id),
  display_name        varchar(150) NOT NULL,
  first_name          varchar(80),
  last_name           varchar(80),
  date_of_birth       date,
  bio                 text,
  age                 int,
  gender              gender,
  marital_status      marital_status,
  travel_mode         travel_mode,
  work_radius_km      smallint DEFAULT 5,
  alternate_phone     varchar(15),
  photo_url           text,
  referred_by_code    varchar(20),
  city_id             uuid NOT NULL REFERENCES cities(id),
  primary_zone_id     uuid REFERENCES zones(id),
  address_line        text,
  emergency_contact   varchar(100),
  upi_id              varchar(100),
  bank_name           varchar(100),
  bank_account_masked varchar(30),
  ifsc                varchar(20),
  status              maid_status NOT NULL DEFAULT 'pending_kyc',
  police_verified     boolean DEFAULT false,
  training_verified   boolean DEFAULT false,
  experience_years    int DEFAULT 0,
  languages           varchar(255),
  avg_rating          decimal(3,2) DEFAULT 0,
  rating_synced_at    timestamp,
  total_jobs          int DEFAULT 0,
  on_time_pct         decimal(5,2) DEFAULT 0,
  repeat_rate_pct     decimal(5,2) DEFAULT 0,
  no_show_count       int DEFAULT 0,
  total_earnings_paise bigint DEFAULT 0,
  is_online           boolean NOT NULL DEFAULT false,
  last_active_at      timestamp,
  joined_at           date NOT NULL DEFAULT CURRENT_DATE,
  suspended_at        timestamp,
  suspend_reason      text,
  created_at          timestamp NOT NULL DEFAULT now(),
  updated_at          timestamp NOT NULL DEFAULT now(),
  deleted_at          timestamp
);

CREATE INDEX idx_maids_public_id ON maids (public_id);
CREATE INDEX idx_maids_city_status ON maids (city_id, status);
CREATE INDEX idx_maids_primary_zone ON maids (primary_zone_id);
CREATE INDEX idx_maids_status ON maids (status);

COMMENT ON COLUMN maids.age IS 'DEPRECATED — use date_of_birth';

CREATE TABLE customer_preferences (
  customer_id           uuid PRIMARY KEY REFERENCES customers(id) ON DELETE CASCADE,
  preferred_slot_id     uuid REFERENCES time_slots(id),
  favorite_maid_id      uuid REFERENCES maids(id),
  notify_booking        boolean DEFAULT true,
  notify_offers         boolean DEFAULT true,
  notify_pro            boolean DEFAULT true,
  notify_sms            boolean DEFAULT true,
  whatsapp_opt_in       boolean DEFAULT true,
  preferred_channel     preferred_channel DEFAULT 'whatsapp',
  gate_code             varchar(50),
  has_pets              boolean DEFAULT false,
  pet_notes             text,
  parking_notes         text,
  visit_instructions    text,
  emergency_name        varchar(100),
  emergency_phone       varchar(15),
  emergency_relation    varchar(50),
  location_permission   boolean DEFAULT false,
  push_permission       boolean DEFAULT false,
  updated_at            timestamp NOT NULL DEFAULT now()
);

CREATE TABLE maid_skills_map (
  maid_id  uuid NOT NULL REFERENCES maids(id) ON DELETE CASCADE,
  skill_id uuid NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  PRIMARY KEY (maid_id, skill_id)
);

CREATE TABLE maid_zones_map (
  maid_id uuid NOT NULL REFERENCES maids(id) ON DELETE CASCADE,
  zone_id uuid NOT NULL REFERENCES zones(id) ON DELETE CASCADE,
  PRIMARY KEY (maid_id, zone_id)
);

CREATE TABLE maid_documents (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  maid_id       uuid NOT NULL REFERENCES maids(id) ON DELETE CASCADE,
  doc_type      kyc_doc_type NOT NULL,
  status        kyc_doc_status NOT NULL DEFAULT 'missing',
  file_url      text,
  file_hash     varchar(64),
  verified_by   uuid REFERENCES admin_users(id),
  verified_at   timestamp,
  reject_reason text,
  created_at    timestamp NOT NULL DEFAULT now(),
  updated_at    timestamp NOT NULL DEFAULT now(),
  UNIQUE (maid_id, doc_type)
);

CREATE TABLE maid_availability (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  maid_id       uuid NOT NULL REFERENCES maids(id) ON DELETE CASCADE,
  slot_id       uuid NOT NULL REFERENCES time_slots(id),
  day_of_week   smallint NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  is_available  boolean NOT NULL DEFAULT true,
  UNIQUE (maid_id, day_of_week, slot_id)
);

CREATE TABLE maid_dispatch_preferences (
  maid_id               uuid PRIMARY KEY REFERENCES maids(id) ON DELETE CASCADE,
  auto_assign_enabled   boolean NOT NULL DEFAULT true,
  alert_new_jobs        boolean NOT NULL DEFAULT true,
  alert_sound_enabled   boolean NOT NULL DEFAULT true,
  max_concurrent_jobs   smallint NOT NULL DEFAULT 1,
  updated_at            timestamp NOT NULL DEFAULT now()
);

-- =============================================================================
-- CORPORATE B2B (before bookings — FK target)
-- =============================================================================

CREATE TABLE corporate_accounts (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name        varchar(200) NOT NULL,
  contact_name        varchar(150),
  contact_email       varchar(255),
  contact_phone       varchar(15),
  city_id             uuid REFERENCES cities(id),
  billing_gstin       varchar(20),
  contract_value_paise bigint,
  seats               int,
  mrr_paise           bigint,
  erp_external_id     varchar(50),
  trial_ends_at       date,
  status              varchar(20) DEFAULT 'active',
  notes               text,
  created_at          timestamp NOT NULL DEFAULT now(),
  updated_at          timestamp NOT NULL DEFAULT now()
);

CREATE INDEX idx_corporate_accounts_status ON corporate_accounts (status);
CREATE INDEX idx_corporate_accounts_city ON corporate_accounts (city_id);

CREATE TABLE corporate_account_users (
  corporate_account_id uuid NOT NULL REFERENCES corporate_accounts(id) ON DELETE CASCADE,
  customer_id          uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  role                 corporate_user_role NOT NULL DEFAULT 'employee',
  department           varchar(100),
  is_active            boolean NOT NULL DEFAULT true,
  created_at           timestamp NOT NULL DEFAULT now(),
  PRIMARY KEY (corporate_account_id, customer_id)
);

CREATE INDEX idx_corporate_users_customer ON corporate_account_users (customer_id);

CREATE TABLE corporate_booking_policies (
  corporate_account_id      uuid PRIMARY KEY REFERENCES corporate_accounts(id) ON DELETE CASCADE,
  approval_required         boolean NOT NULL DEFAULT false,
  spend_limit_paise         bigint,
  auto_approve_under_paise  int DEFAULT 0,
  allowed_zones             uuid[],
  updated_at                timestamp NOT NULL DEFAULT now()
);

-- =============================================================================
-- BOOKINGS
-- =============================================================================

CREATE TABLE bookings (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_ref           varchar(32) NOT NULL UNIQUE,
  customer_id           uuid NOT NULL REFERENCES customers(id),
  city_id               uuid NOT NULL REFERENCES cities(id),
  zone_id               uuid NOT NULL REFERENCES zones(id),
  address_id            uuid REFERENCES customer_addresses(id),
  address_snapshot      jsonb NOT NULL,
  status                booking_status NOT NULL DEFAULT 'draft',
  slot_id               uuid REFERENCES time_slots(id),
  slot_label            varchar(100),
  visit_date            date NOT NULL,
  visit_start_at        timestamp,
  visit_end_at          timestamp,
  instructions          text,
  subtotal_paise        int NOT NULL DEFAULT 0,
  plus_discount_paise   int NOT NULL DEFAULT 0,
  coupon_discount_paise int NOT NULL DEFAULT 0,
  wallet_used_paise     int NOT NULL DEFAULT 0,
  platform_fee_paise    int NOT NULL DEFAULT 0,
  total_paise           int NOT NULL DEFAULT 0,
  payable_paise         int NOT NULL DEFAULT 0,
  coupon_code           varchar(32),
  subscription_id       uuid,
  payment_mode          payment_method_type,
  payment_status        payment_status,
  assigned_maid_id      uuid REFERENCES maids(id),
  maid_assigned_at      timestamp,
  completion_otp_hash   varchar(128),
  otp_verified_at       timestamp,
  completed_at          timestamp,
  cancelled_at          timestamp,
  cancel_reason         cancel_reason,
  cancel_note           text,
  refund_amount_paise   int DEFAULT 0,
  refund_status         refund_status,
  corporate_account_id  uuid REFERENCES corporate_accounts(id),
  source                varchar(20) NOT NULL DEFAULT 'app',
  row_version           int NOT NULL DEFAULT 0,
  created_at            timestamp NOT NULL DEFAULT now(),
  updated_at            timestamp NOT NULL DEFAULT now()
);

CREATE INDEX idx_bookings_ref ON bookings (booking_ref);
CREATE INDEX idx_bookings_customer ON bookings (customer_id);
CREATE INDEX idx_bookings_status_date ON bookings (status, visit_date);
CREATE INDEX idx_bookings_assigned_maid ON bookings (assigned_maid_id);
CREATE INDEX idx_bookings_zone_status_date ON bookings (zone_id, status, visit_date);
CREATE INDEX idx_bookings_corporate ON bookings (corporate_account_id) WHERE corporate_account_id IS NOT NULL;
CREATE INDEX idx_bookings_created ON bookings (created_at DESC);
CREATE INDEX idx_bookings_customer_active ON bookings (customer_id, visit_date DESC)
  WHERE status NOT IN ('cancelled', 'completed', 'no_show');

CREATE TABLE booking_line_items (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id        uuid NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  service_id        uuid NOT NULL REFERENCES services(id),
  service_name      varchar(150) NOT NULL,
  unit_price_paise  int NOT NULL,
  quantity          int NOT NULL DEFAULT 1,
  duration_minutes  int,
  line_total_paise  int NOT NULL
);

CREATE INDEX idx_booking_line_items_booking ON booking_line_items (booking_id);

CREATE TABLE booking_status_events (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id      uuid NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  from_status     booking_status,
  to_status       booking_status NOT NULL,
  actor_user_id   uuid REFERENCES users(id),
  actor_type      varchar(20),
  note            text,
  created_at      timestamp NOT NULL DEFAULT now()
);

CREATE INDEX idx_booking_status_events ON booking_status_events (booking_id, created_at);

CREATE TABLE booking_assignments (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id        uuid NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  maid_id           uuid NOT NULL REFERENCES maids(id),
  assigned_by       uuid REFERENCES users(id),
  assignment_type   varchar(20) NOT NULL,
  response          assignment_response NOT NULL DEFAULT 'pending',
  responded_at      timestamp,
  decline_reason    varchar(100),
  expires_at        timestamp,
  offer_round       smallint NOT NULL DEFAULT 1,
  is_active         boolean NOT NULL DEFAULT true,
  assigned_at       timestamp NOT NULL DEFAULT now(),
  unassigned_at     timestamp
);

CREATE INDEX idx_assignments_booking ON booking_assignments (booking_id);
CREATE INDEX idx_assignments_maid_active ON booking_assignments (maid_id, is_active);
CREATE INDEX idx_assignments_maid_response ON booking_assignments (maid_id, response);
CREATE INDEX idx_assignments_maid_expiry ON booking_assignments (maid_id, expires_at);
CREATE UNIQUE INDEX uq_assignment_active_per_booking ON booking_assignments (booking_id)
  WHERE is_active = true AND response IN ('pending', 'accepted');
CREATE INDEX idx_assignments_pending_expiry ON booking_assignments (maid_id, expires_at)
  WHERE response = 'pending' AND is_active = true;

CREATE TABLE booking_reviews (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id  uuid NOT NULL UNIQUE REFERENCES bookings(id),
  customer_id uuid NOT NULL REFERENCES customers(id),
  maid_id     uuid NOT NULL REFERENCES maids(id),
  rating      smallint NOT NULL CHECK (rating BETWEEN 1 AND 5),
  review_text text,
  tags        varchar(255),
  created_at  timestamp NOT NULL DEFAULT now()
);

CREATE INDEX idx_booking_reviews_maid ON booking_reviews (maid_id);
CREATE INDEX idx_booking_reviews_customer ON booking_reviews (customer_id);
CREATE INDEX idx_booking_reviews_created ON booking_reviews (created_at DESC);

CREATE TABLE maid_location_pings (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  maid_id         uuid NOT NULL REFERENCES maids(id) ON DELETE CASCADE,
  booking_id      uuid REFERENCES bookings(id),
  latitude        decimal(10,7) NOT NULL,
  longitude       decimal(10,7) NOT NULL,
  accuracy_meters decimal(8,2),
  recorded_at     timestamp NOT NULL DEFAULT now()
);

CREATE INDEX idx_location_pings_maid_time ON maid_location_pings (maid_id, recorded_at DESC);
CREATE INDEX idx_location_pings_booking_time ON maid_location_pings (booking_id, recorded_at DESC);

-- =============================================================================
-- PAYMENTS & WALLET
-- =============================================================================

CREATE TABLE payment_orders (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id          uuid,
  subscription_id     uuid,
  customer_id         uuid NOT NULL REFERENCES customers(id),
  gateway             varchar(32) NOT NULL DEFAULT 'razorpay',
  gateway_order_id    varchar(100) UNIQUE,
  amount_paise        int NOT NULL,
  currency            char(3) NOT NULL DEFAULT 'INR',
  status              payment_status NOT NULL DEFAULT 'created',
  idempotency_key     varchar(64) UNIQUE,
  created_at          timestamp NOT NULL DEFAULT now(),
  updated_at          timestamp NOT NULL DEFAULT now()
);

CREATE INDEX idx_payment_orders_customer ON payment_orders (customer_id);
CREATE INDEX idx_payment_orders_booking ON payment_orders (booking_id);

CREATE TABLE payment_transactions (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_order_id    uuid NOT NULL REFERENCES payment_orders(id),
  gateway_payment_id  varchar(100) UNIQUE,
  method              payment_method_type NOT NULL,
  method_label        varchar(100),
  amount_paise        int NOT NULL,
  wallet_used_paise   int NOT NULL DEFAULT 0,
  status              payment_status NOT NULL,
  captured_at         timestamp,
  raw_gateway_payload jsonb,
  created_at          timestamp NOT NULL DEFAULT now()
);

CREATE TABLE refunds (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_transaction_id  uuid NOT NULL REFERENCES payment_transactions(id),
  booking_id              uuid REFERENCES bookings(id),
  refund_ref              varchar(32) UNIQUE,
  amount_paise            int NOT NULL,
  reason                  cancel_reason,
  reason_note             text,
  status                  refund_status NOT NULL DEFAULT 'requested',
  gateway_refund_id       varchar(100),
  initiated_by            uuid REFERENCES users(id),
  completed_at            timestamp,
  created_at              timestamp NOT NULL DEFAULT now()
);

CREATE TABLE wallet_accounts (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id     uuid NOT NULL UNIQUE REFERENCES customers(id) ON DELETE CASCADE,
  balance_paise   bigint NOT NULL DEFAULT 0 CHECK (balance_paise >= 0),
  version         int NOT NULL DEFAULT 0,
  updated_at      timestamp NOT NULL DEFAULT now()
);

CREATE TABLE wallet_ledger_entries (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_account_id   uuid NOT NULL REFERENCES wallet_accounts(id),
  entry_type          wallet_entry_type NOT NULL,
  source              wallet_entry_source NOT NULL,
  amount_paise        int NOT NULL CHECK (amount_paise > 0),
  balance_after_paise bigint NOT NULL,
  title               varchar(150) NOT NULL,
  subtitle            varchar(255),
  reference_type      varchar(32),
  reference_id        uuid,
  idempotency_key     varchar(64) UNIQUE,
  created_at          timestamp NOT NULL DEFAULT now()
);

CREATE INDEX idx_wallet_ledger_account_time ON wallet_ledger_entries (wallet_account_id, created_at DESC);
CREATE INDEX idx_wallet_ledger_reference ON wallet_ledger_entries (reference_id);

-- =============================================================================
-- SUBSCRIPTIONS
-- =============================================================================

CREATE TABLE customer_subscriptions (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id             uuid NOT NULL REFERENCES customers(id),
  plan_id                 uuid NOT NULL REFERENCES subscription_plans(id),
  status                  subscription_status NOT NULL DEFAULT 'active',
  visits_total            int,
  visits_remaining        int,
  amount_paid_paise       int NOT NULL,
  wallet_used_paise       int DEFAULT 0,
  payment_transaction_id  uuid,
  started_at              timestamp NOT NULL DEFAULT now(),
  renews_at               timestamp,
  paused_at               timestamp,
  paused_until            timestamp,
  cancelled_at            timestamp,
  created_at              timestamp NOT NULL DEFAULT now()
);

CREATE INDEX idx_customer_subscriptions_status ON customer_subscriptions (customer_id, status);

-- =============================================================================
-- COUPONS, REFERRALS, GROWTH
-- =============================================================================

CREATE TABLE coupon_campaigns (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code                varchar(32) NOT NULL UNIQUE,
  title               varchar(150) NOT NULL,
  description         text,
  discount_type       coupon_discount_type NOT NULL,
  discount_value      decimal(10,2) NOT NULL,
  min_order_paise     int,
  max_discount_paise  int,
  category            coupon_category NOT NULL DEFAULT 'all',
  channel             varchar(50),
  max_redemptions     int,
  used_count          int NOT NULL DEFAULT 0,
  status              coupon_status NOT NULL DEFAULT 'draft',
  valid_from          timestamp,
  valid_until         timestamp,
  created_by          uuid REFERENCES admin_users(id),
  created_at          timestamp NOT NULL DEFAULT now()
);

CREATE TABLE customer_coupons (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id         uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  campaign_id         uuid NOT NULL REFERENCES coupon_campaigns(id),
  status              customer_coupon_status NOT NULL DEFAULT 'active',
  saved_at            timestamp NOT NULL DEFAULT now(),
  expires_at          timestamp,
  used_at             timestamp,
  used_on_booking_id  uuid REFERENCES bookings(id),
  UNIQUE (customer_id, campaign_id)
);

CREATE INDEX idx_customer_coupons_status ON customer_coupons (customer_id, status);

CREATE TABLE coupon_redemptions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id     uuid NOT NULL REFERENCES coupon_campaigns(id),
  customer_id     uuid NOT NULL REFERENCES customers(id),
  booking_id      uuid REFERENCES bookings(id),
  discount_paise  int NOT NULL,
  redeemed_at     timestamp NOT NULL DEFAULT now()
);

CREATE TABLE referrals (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_customer_id    uuid NOT NULL REFERENCES customers(id),
  referee_customer_id     uuid REFERENCES customers(id),
  referee_phone           varchar(15),
  referee_name            varchar(150),
  status                  referral_status NOT NULL DEFAULT 'pending',
  reward_paise            int NOT NULL DEFAULT 10000,
  credited_ledger_id      uuid REFERENCES wallet_ledger_entries(id),
  created_at              timestamp NOT NULL DEFAULT now(),
  credited_at             timestamp
);

CREATE INDEX idx_referrals_referrer ON referrals (referrer_customer_id);

CREATE TABLE waitlist_entries (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city_name   varchar(100) NOT NULL,
  email       varchar(255) NOT NULL,
  source      varchar(32) DEFAULT 'landing',
  created_at  timestamp NOT NULL DEFAULT now(),
  UNIQUE (email, city_name)
);

-- =============================================================================
-- MAID PAYOUTS
-- =============================================================================

CREATE TABLE payout_batches (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_ref           varchar(32) NOT NULL UNIQUE,
  period_start        date NOT NULL,
  period_end          date NOT NULL,
  total_amount_paise  bigint NOT NULL DEFAULT 0,
  maid_count          int NOT NULL DEFAULT 0,
  status              payout_batch_status NOT NULL DEFAULT 'draft',
  processed_by        uuid REFERENCES admin_users(id),
  processed_at        timestamp,
  created_at          timestamp NOT NULL DEFAULT now()
);

CREATE TABLE maid_payout_lines (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id              uuid NOT NULL REFERENCES payout_batches(id) ON DELETE CASCADE,
  maid_id               uuid NOT NULL REFERENCES maids(id),
  bookings_count        int NOT NULL DEFAULT 0,
  gross_paise           int NOT NULL,
  deductions_paise      int NOT NULL DEFAULT 0,
  net_paise             int NOT NULL,
  upi_id                varchar(100),
  status                payout_line_status NOT NULL DEFAULT 'pending',
  risk_note             text,
  gateway_transfer_id   varchar(100),
  paid_at               timestamp,
  UNIQUE (batch_id, maid_id)
);

CREATE INDEX idx_maid_payout_lines_maid ON maid_payout_lines (maid_id);

CREATE TABLE maid_earnings_ledger (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  maid_id           uuid NOT NULL REFERENCES maids(id),
  booking_id        uuid REFERENCES bookings(id),
  gross_paise       int NOT NULL,
  platform_fee_paise int NOT NULL DEFAULT 0,
  net_paise         int NOT NULL,
  payout_line_id    uuid REFERENCES maid_payout_lines(id),
  created_at        timestamp NOT NULL DEFAULT now()
);

CREATE INDEX idx_maid_earnings_maid_time ON maid_earnings_ledger (maid_id, created_at DESC);
CREATE INDEX idx_maid_earnings_booking ON maid_earnings_ledger (booking_id);

-- =============================================================================
-- SUPPORT & DISPUTES
-- =============================================================================

CREATE TABLE support_tickets (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  public_id               varchar(20) NOT NULL UNIQUE,
  customer_id             uuid REFERENCES customers(id),
  maid_id                 uuid REFERENCES maids(id),
  topic                   ticket_topic NOT NULL,
  status                  ticket_status NOT NULL DEFAULT 'open',
  priority                varchar(10) DEFAULT 'med',
  subject                 varchar(255) NOT NULL,
  booking_id              uuid REFERENCES bookings(id),
  booking_ref             varchar(32),
  payment_transaction_id  uuid REFERENCES payment_transactions(id),
  assigned_agent_id       uuid REFERENCES admin_users(id),
  sla_due_at              timestamp,
  resolved_at             timestamp,
  created_at              timestamp NOT NULL DEFAULT now(),
  updated_at              timestamp NOT NULL DEFAULT now()
);

CREATE INDEX idx_support_tickets_status ON support_tickets (status, priority);
CREATE INDEX idx_support_tickets_customer ON support_tickets (customer_id);
CREATE INDEX idx_support_tickets_booking ON support_tickets (booking_id);

CREATE TABLE support_messages (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id       uuid NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  sender_type     message_sender NOT NULL,
  sender_user_id  uuid REFERENCES users(id),
  body            text NOT NULL,
  is_internal     boolean DEFAULT false,
  read_at         timestamp,
  created_at      timestamp NOT NULL DEFAULT now()
);

CREATE INDEX idx_support_messages_ticket ON support_messages (ticket_id, created_at);

CREATE TABLE support_attachments (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id  uuid NOT NULL REFERENCES support_messages(id) ON DELETE CASCADE,
  file_name   varchar(255) NOT NULL,
  file_url    text NOT NULL,
  mime_type   varchar(100),
  size_bytes  bigint,
  created_at  timestamp NOT NULL DEFAULT now()
);

CREATE TABLE booking_disputes (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  public_id         varchar(20) NOT NULL UNIQUE,
  ticket_id         uuid NOT NULL REFERENCES support_tickets(id),
  booking_id        uuid NOT NULL UNIQUE REFERENCES bookings(id),
  customer_id       uuid NOT NULL REFERENCES customers(id),
  reason            dispute_reason NOT NULL,
  reason_label      varchar(100) NOT NULL,
  description       text NOT NULL,
  refund_requested  boolean DEFAULT false,
  status            dispute_status NOT NULL DEFAULT 'submitted',
  resolution_note   text,
  resolved_by       uuid REFERENCES admin_users(id),
  created_at        timestamp NOT NULL DEFAULT now(),
  resolved_at       timestamp
);

-- =============================================================================
-- NOTIFICATIONS & PLATFORM OPS
-- =============================================================================

CREATE TABLE device_push_tokens (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token         text NOT NULL,
  platform      varchar(20) NOT NULL,
  app_client    varchar(20) NOT NULL,
  is_active     boolean DEFAULT true,
  created_at    timestamp NOT NULL DEFAULT now(),
  last_used_at  timestamp
);

CREATE INDEX idx_push_tokens_user_platform ON device_push_tokens (user_id, platform);
CREATE INDEX idx_push_tokens_token ON device_push_tokens (token);

CREATE TABLE notifications (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  app_client        varchar(20) NOT NULL,
  category          notification_category NOT NULL,
  title             varchar(200) NOT NULL,
  body              text NOT NULL,
  detail            text,
  action_type       varchar(32),
  action_target_id  uuid,
  channel           notification_channel NOT NULL DEFAULT 'in_app',
  is_read           boolean NOT NULL DEFAULT false,
  read_at           timestamp,
  sent_at           timestamp,
  created_at        timestamp NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_inbox ON notifications (user_id, app_client, is_read, created_at DESC);

CREATE TABLE api_idempotency_keys (
  key               varchar(64) PRIMARY KEY,
  user_id           uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  endpoint          varchar(120) NOT NULL,
  response_status   smallint NOT NULL,
  response_body     jsonb,
  created_at        timestamp NOT NULL DEFAULT now(),
  expires_at        timestamp NOT NULL
);

CREATE INDEX idx_idempotency_user ON api_idempotency_keys (user_id, created_at DESC);
CREATE INDEX idx_idempotency_expires ON api_idempotency_keys (expires_at);

CREATE TABLE domain_events (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  aggregate_type  varchar(50) NOT NULL,
  aggregate_id    uuid NOT NULL,
  event_type      varchar(100) NOT NULL,
  payload         jsonb NOT NULL,
  status          domain_event_status NOT NULL DEFAULT 'pending',
  published_at    timestamp,
  retry_count     int NOT NULL DEFAULT 0,
  last_error      text,
  created_at      timestamp NOT NULL DEFAULT now()
);

CREATE INDEX idx_domain_events_pending ON domain_events (status, created_at) WHERE status = 'pending';
CREATE INDEX idx_domain_events_aggregate ON domain_events (aggregate_type, aggregate_id);
CREATE INDEX idx_domain_events_type ON domain_events (event_type);

CREATE TABLE status_display_mappings (
  domain            varchar(32) NOT NULL,
  canonical_status  varchar(32) NOT NULL,
  display_status    varchar(32) NOT NULL,
  sort_order        smallint NOT NULL DEFAULT 0,
  PRIMARY KEY (domain, canonical_status)
);

CREATE TABLE admin_alert_rules (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        varchar(100) NOT NULL,
  severity    varchar(10) NOT NULL,
  channel     notification_channel NOT NULL,
  recipients  text NOT NULL,
  is_enabled  boolean DEFAULT true,
  created_at  timestamp NOT NULL DEFAULT now()
);

CREATE TABLE training_courses (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code              varchar(32) NOT NULL UNIQUE,
  title             varchar(200) NOT NULL,
  description       text,
  duration_minutes  int NOT NULL DEFAULT 15,
  is_mandatory      boolean NOT NULL DEFAULT false,
  is_active         boolean NOT NULL DEFAULT true,
  sort_order        int NOT NULL DEFAULT 0,
  created_at        timestamp NOT NULL DEFAULT now(),
  updated_at        timestamp NOT NULL DEFAULT now()
);

CREATE TABLE maid_training_completions (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  maid_id       uuid NOT NULL REFERENCES maids(id) ON DELETE CASCADE,
  course_id     uuid NOT NULL REFERENCES training_courses(id) ON DELETE CASCADE,
  score         smallint CHECK (score IS NULL OR (score >= 0 AND score <= 100)),
  completed_at  timestamp NOT NULL DEFAULT now(),
  expires_at    timestamp,
  UNIQUE (maid_id, course_id)
);

CREATE INDEX idx_maid_training_maid ON maid_training_completions (maid_id);

CREATE TABLE feature_flags (
  key           varchar(64) NOT NULL,
  environment   varchar(20) NOT NULL DEFAULT 'prod',
  value         jsonb NOT NULL DEFAULT 'true',
  description   varchar(255),
  is_enabled    boolean NOT NULL DEFAULT true,
  updated_by    uuid REFERENCES admin_users(id),
  updated_at    timestamp NOT NULL DEFAULT now(),
  PRIMARY KEY (key, environment)
);

CREATE TABLE integration_configs (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider          integration_provider NOT NULL,
  environment       varchar(20) NOT NULL DEFAULT 'prod',
  display_name      varchar(100) NOT NULL,
  config_encrypted  text NOT NULL,
  is_active         boolean NOT NULL DEFAULT true,
  last_verified_at  timestamp,
  updated_by        uuid REFERENCES admin_users(id),
  updated_at        timestamp NOT NULL DEFAULT now(),
  UNIQUE (provider, environment)
);

CREATE TABLE analytics_daily_snapshots (
  snapshot_date       date NOT NULL,
  city_id             uuid NOT NULL REFERENCES cities(id),
  bookings_created    int NOT NULL DEFAULT 0,
  bookings_completed  int NOT NULL DEFAULT 0,
  bookings_cancelled  int NOT NULL DEFAULT 0,
  gmv_paise           bigint NOT NULL DEFAULT 0,
  accept_rate_pct     decimal(5,2),
  cancel_rate_pct     decimal(5,2),
  active_maids        int NOT NULL DEFAULT 0,
  active_customers    int NOT NULL DEFAULT 0,
  refreshed_at        timestamp NOT NULL DEFAULT now(),
  PRIMARY KEY (snapshot_date, city_id)
);

CREATE INDEX idx_analytics_snapshots_date ON analytics_daily_snapshots (snapshot_date DESC);

CREATE TABLE schema_migrations (
  version     varchar(20) PRIMARY KEY,
  applied_at  timestamp NOT NULL DEFAULT now(),
  applied_by  varchar(100),
  checksum    varchar(64)
);

-- =============================================================================
-- ADMIN PLATFORM
-- =============================================================================

CREATE TABLE audit_logs (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id   uuid REFERENCES users(id),
  actor_type      varchar(20) NOT NULL,
  action          varchar(100) NOT NULL,
  target_type     varchar(50) NOT NULL,
  target_id       uuid,
  metadata        jsonb,
  ip_address      varchar(45),
  user_agent      text,
  created_at      timestamp NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_logs_created ON audit_logs (created_at DESC);
CREATE INDEX idx_audit_logs_target ON audit_logs (target_type, target_id);
CREATE INDEX idx_audit_logs_actor ON audit_logs (actor_user_id);

CREATE TABLE platform_settings (
  key         varchar(100) PRIMARY KEY,
  value       jsonb NOT NULL,
  updated_by  uuid REFERENCES admin_users(id),
  updated_at  timestamp NOT NULL DEFAULT now()
);

CREATE TABLE dsar_requests (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id   uuid REFERENCES customers(id),
  request_type  varchar(20) NOT NULL,
  status        varchar(20) NOT NULL DEFAULT 'pending',
  requested_at  timestamp NOT NULL DEFAULT now(),
  completed_at  timestamp,
  handled_by    uuid REFERENCES admin_users(id)
);

CREATE TABLE knowledge_base_articles (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          varchar(100) NOT NULL UNIQUE,
  title         varchar(200) NOT NULL,
  body          text NOT NULL,
  category      varchar(50),
  is_published  boolean DEFAULT false,
  updated_by    uuid REFERENCES admin_users(id),
  created_at    timestamp NOT NULL DEFAULT now(),
  updated_at    timestamp NOT NULL DEFAULT now()
);

CREATE TABLE report_schedules (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name            varchar(150) NOT NULL,
  cadence         varchar(50) NOT NULL,
  owner_role      admin_role_key,
  format          varchar(10) NOT NULL,
  recipient_email varchar(255),
  query_key       varchar(100) NOT NULL,
  next_run_at     timestamp,
  is_active       boolean DEFAULT true,
  created_at      timestamp NOT NULL DEFAULT now()
);

-- =============================================================================
-- DEFERRED FOREIGN KEYS (circular dependencies)
-- =============================================================================

ALTER TABLE maid_applications
  ADD CONSTRAINT fk_maid_applications_approved_maid
  FOREIGN KEY (approved_maid_id) REFERENCES maids(id);

ALTER TABLE bookings
  ADD CONSTRAINT fk_bookings_subscription
  FOREIGN KEY (subscription_id) REFERENCES customer_subscriptions(id);

ALTER TABLE customer_subscriptions
  ADD CONSTRAINT fk_customer_subscriptions_payment
  FOREIGN KEY (payment_transaction_id) REFERENCES payment_transactions(id);

ALTER TABLE payment_orders
  ADD CONSTRAINT fk_payment_orders_booking
  FOREIGN KEY (booking_id) REFERENCES bookings(id);

ALTER TABLE payment_orders
  ADD CONSTRAINT fk_payment_orders_subscription
  FOREIGN KEY (subscription_id) REFERENCES customer_subscriptions(id);

-- =============================================================================
-- UPDATED_AT TRIGGER
-- =============================================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_cities_updated_at
  BEFORE UPDATE ON cities FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_zones_updated_at
  BEFORE UPDATE ON zones FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_services_updated_at
  BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_customers_updated_at
  BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_customer_addresses_updated_at
  BEFORE UPDATE ON customer_addresses FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_maids_updated_at
  BEFORE UPDATE ON maids FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_maid_documents_updated_at
  BEFORE UPDATE ON maid_documents FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_maid_dispatch_prefs_updated_at
  BEFORE UPDATE ON maid_dispatch_preferences FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_bookings_updated_at
  BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_payment_orders_updated_at
  BEFORE UPDATE ON payment_orders FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_wallet_accounts_updated_at
  BEFORE UPDATE ON wallet_accounts FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_corporate_accounts_updated_at
  BEFORE UPDATE ON corporate_accounts FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_corporate_policies_updated_at
  BEFORE UPDATE ON corporate_booking_policies FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_support_tickets_updated_at
  BEFORE UPDATE ON support_tickets FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_training_courses_updated_at
  BEFORE UPDATE ON training_courses FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_feature_flags_updated_at
  BEFORE UPDATE ON feature_flags FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_integration_configs_updated_at
  BEFORE UPDATE ON integration_configs FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_platform_settings_updated_at
  BEFORE UPDATE ON platform_settings FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_knowledge_base_updated_at
  BEFORE UPDATE ON knowledge_base_articles FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =============================================================================
-- SEED DATA (core system setup)
-- =============================================================================

INSERT INTO schema_migrations (version, applied_by, checksum)
VALUES ('v1.2', 'quickmaid.schema.v1.2.final.sql', md5('v1.2-final'));

INSERT INTO admin_roles (role_key, name, description) VALUES
  ('super_admin', 'Super Admin', 'Full platform access'),
  ('ops_manager', 'Operations Manager', 'Dispatch, zones, maids'),
  ('support_l1', 'Support L1', 'Ticket triage'),
  ('support_l2', 'Support L2', 'Escalations and disputes'),
  ('analyst', 'Analyst', 'Reports and analytics'),
  ('finance', 'Finance', 'Payouts and refunds')
ON CONFLICT (role_key) DO NOTHING;

INSERT INTO permissions (code, description) VALUES
  ('bookings.read', 'View bookings'),
  ('bookings.cancel', 'Cancel bookings'),
  ('bookings.assign', 'Manual maid assignment'),
  ('maids.read', 'View maids'),
  ('maids.suspend', 'Suspend maids'),
  ('maids.approve', 'Approve applications'),
  ('payouts.read', 'View payouts'),
  ('payouts.approve', 'Approve payout batches'),
  ('customers.read', 'View customers'),
  ('settings.write', 'Modify platform settings'),
  ('reports.export', 'Export reports')
ON CONFLICT (code) DO NOTHING;

INSERT INTO status_display_mappings (domain, canonical_status, display_status, sort_order) VALUES
  ('booking_customer', 'draft', 'upcoming', 1),
  ('booking_customer', 'pending_payment', 'upcoming', 2),
  ('booking_customer', 'confirmed', 'upcoming', 3),
  ('booking_customer', 'assigned', 'upcoming', 4),
  ('booking_customer', 'en_route', 'upcoming', 5),
  ('booking_customer', 'in_progress', 'upcoming', 6),
  ('booking_customer', 'completed', 'completed', 7),
  ('booking_customer', 'cancelled', 'cancelled', 8),
  ('booking_customer', 'no_show', 'cancelled', 9),
  ('booking_partner', 'pending', 'pending', 1),
  ('booking_partner', 'accepted', 'accepted', 2),
  ('booking_partner', 'assigned', 'accepted', 3),
  ('booking_partner', 'in_progress', 'in_progress', 4),
  ('booking_partner', 'completed', 'completed', 5),
  ('booking_partner', 'declined', 'declined', 6),
  ('booking_partner', 'expired', 'declined', 7),
  ('booking_admin', 'assigned', 'ongoing', 1),
  ('booking_admin', 'en_route', 'ongoing', 2),
  ('booking_admin', 'in_progress', 'ongoing', 3),
  ('booking_admin', 'completed', 'completed', 4),
  ('booking_admin', 'no_show', 'no-show', 5),
  ('booking_admin', 'cancelled', 'cancelled', 6),
  ('ticket_admin', 'open', 'open', 1),
  ('ticket_admin', 'in_review', 'progress', 2),
  ('ticket_admin', 'resolved', 'resolved', 3),
  ('ticket_admin', 'snoozed', 'snoozed', 4)
ON CONFLICT (domain, canonical_status) DO NOTHING;

INSERT INTO training_courses (code, title, description, duration_minutes, is_mandatory, sort_order) VALUES
  ('HYGIENE-101', 'Hygiene & Safety Basics', 'Hand washing, PPE, chemical safety', 20, true, 1),
  ('CUSTOMER-101', 'Customer Service Standards', 'Greeting, communication, complaint handling', 15, true, 2),
  ('APP-101', 'Partner App Walkthrough', 'Accept jobs, OTP, navigation, earnings', 10, true, 3)
ON CONFLICT (code) DO NOTHING;

INSERT INTO subscription_plans (code, plan_type, name, price_paise, visit_credits, validity_days, discount_pct) VALUES
  ('plus', 'plus', 'QuickMaid Plus', 49900, NULL, 365, 10.00),
  ('flex', 'flex', 'Flex Pack (5 visits)', 199900, 5, 90, 0),
  ('onetime', 'onetime', 'Pay Per Visit', 0, NULL, NULL, 0)
ON CONFLICT (code) DO NOTHING;

INSERT INTO time_slots (code, label, day_mask, start_time, end_time, sort_order) VALUES
  ('morning', 'Mon–Sat · 8–11 AM', 'weekday', '08:00', '11:00', 1),
  ('afternoon', 'Mon–Sat · 2–5 PM', 'weekday', '14:00', '17:00', 2),
  ('evening', 'Mon–Sat · 6–9 PM', 'weekday', '18:00', '21:00', 3),
  ('weekend_am', 'Sun · 9 AM–12 PM', 'weekend', '09:00', '12:00', 4)
ON CONFLICT (code) DO NOTHING;

INSERT INTO skills (code, label) VALUES
  ('cleaning', 'Home Cleaning'),
  ('deep_clean', 'Deep Cleaning'),
  ('kitchen', 'Kitchen Cleaning'),
  ('bathroom', 'Bathroom Cleaning'),
  ('laundry', 'Laundry & Ironing')
ON CONFLICT (code) DO NOTHING;

INSERT INTO service_categories (slug, name, sort_order) VALUES
  ('cleaning', 'Home Cleaning', 1),
  ('deep', 'Deep Cleaning', 2),
  ('packages', 'Packages', 3)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO cities (code, name, state, is_live) VALUES
  ('raipur', 'Raipur', 'Chhattisgarh', true)
ON CONFLICT (code) DO NOTHING;

INSERT INTO zones (city_id, slug, name, pincode, center_lat, center_lng, health, is_active)
SELECT c.id, 'shankar-nagar', 'Shankar Nagar', '492007', 21.2514000, 81.6296000, 'good', true
FROM cities c WHERE c.code = 'raipur'
ON CONFLICT (city_id, slug) DO NOTHING;

INSERT INTO services (slug, category_id, name, base_price_paise, duration_minutes, badge, sort_order)
SELECT 'regular', sc.id, 'Regular Cleaning', 49900, 120, 'Popular', 1
FROM service_categories sc WHERE sc.slug = 'cleaning'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO services (slug, category_id, name, base_price_paise, duration_minutes, sort_order)
SELECT 'deep', sc.id, 'Deep Cleaning', 149900, 240, 2
FROM service_categories sc WHERE sc.slug = 'deep'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO zone_services (zone_id, service_id, is_top_service)
SELECT z.id, s.id, true
FROM zones z
JOIN cities c ON c.id = z.city_id AND c.code = 'raipur'
JOIN services s ON s.slug IN ('regular', 'deep')
ON CONFLICT (zone_id, service_id) DO NOTHING;

INSERT INTO platform_settings (key, value) VALUES
  ('maintenance_mode', 'false'::jsonb),
  ('sms_otp_enabled', 'true'::jsonb),
  ('push_dispatch_enabled', 'true'::jsonb),
  ('default_city_code', '"raipur"'::jsonb),
  ('booking_cancel_window_hours', '24'::jsonb),
  ('partner_offer_ttl_seconds', '120'::jsonb)
ON CONFLICT (key) DO NOTHING;

INSERT INTO feature_flags (key, environment, value, description, is_enabled) VALUES
  ('dispatch.auto_assign', 'prod', 'true', 'Auto-dispatch job offers to nearby maids', true),
  ('payments.emi', 'prod', 'false', 'EMI payment method', false),
  ('maintenance_mode', 'prod', 'false', 'Platform maintenance banner', false)
ON CONFLICT (key, environment) DO NOTHING;

COMMIT;
