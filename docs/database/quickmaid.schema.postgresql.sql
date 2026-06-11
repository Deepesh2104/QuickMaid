-- SQL dump generated using DBML (dbml.dbdiagram.io)
-- Database: PostgreSQL
-- Generated at: 2026-06-09T11:21:20.952Z

CREATE TYPE "user_role" AS ENUM (
  'customer',
  'maid',
  'admin'
);

CREATE TYPE "assignment_response" AS ENUM (
  'pending',
  'accepted',
  'declined',
  'expired'
);

CREATE TYPE "user_status" AS ENUM (
  'active',
  'suspended',
  'pending_verification',
  'deleted'
);

CREATE TYPE "gender" AS ENUM (
  'female',
  'male',
  'other',
  'prefer_not_to_say'
);

CREATE TYPE "home_type" AS ENUM (
  'bhk_1',
  'bhk_2',
  'bhk_3',
  'villa',
  'other'
);

CREATE TYPE "address_label" AS ENUM (
  'home',
  'office',
  'other'
);

CREATE TYPE "payment_method_type" AS ENUM (
  'upi',
  'card',
  'netbanking',
  'wallet',
  'cash',
  'pay_later'
);

CREATE TYPE "booking_status" AS ENUM (
  'draft',
  'pending_payment',
  'confirmed',
  'assigned',
  'en_route',
  'in_progress',
  'completed',
  'cancelled',
  'no_show'
);

CREATE TYPE "payment_status" AS ENUM (
  'created',
  'authorized',
  'captured',
  'failed',
  'refunded',
  'partially_refunded'
);

CREATE TYPE "refund_status" AS ENUM (
  'requested',
  'processing',
  'completed',
  'failed'
);

CREATE TYPE "wallet_entry_type" AS ENUM (
  'credit',
  'debit',
  'refund',
  'bonus',
  'adjustment'
);

CREATE TYPE "wallet_entry_source" AS ENUM (
  'topup',
  'booking',
  'plus_subscription',
  'referral',
  'promo',
  'cancel_refund',
  'admin_adjustment'
);

CREATE TYPE "maid_status" AS ENUM (
  'pending_kyc',
  'active',
  'suspended',
  'rejected',
  'offboarded'
);

CREATE TYPE "kyc_doc_type" AS ENUM (
  'aadhaar',
  'pan',
  'police_verification',
  'bank_proof',
  'training_certificate',
  'profile_photo'
);

CREATE TYPE "kyc_doc_status" AS ENUM (
  'missing',
  'pending',
  'verified',
  'rejected'
);

CREATE TYPE "application_status" AS ENUM (
  'submitted',
  'under_review',
  'approved',
  'rejected'
);

CREATE TYPE "subscription_plan_type" AS ENUM (
  'instant',
  'monthly',
  'annual',
  'plus',
  'flex',
  'onetime'
);

CREATE TYPE "subscription_status" AS ENUM (
  'active',
  'paused',
  'cancelled',
  'expired'
);

CREATE TYPE "coupon_discount_type" AS ENUM (
  'percent',
  'flat'
);

CREATE TYPE "coupon_category" AS ENUM (
  'booking',
  'plus',
  'all'
);

CREATE TYPE "coupon_status" AS ENUM (
  'draft',
  'live',
  'ended'
);

CREATE TYPE "customer_coupon_status" AS ENUM (
  'active',
  'used',
  'expired'
);

CREATE TYPE "referral_status" AS ENUM (
  'pending',
  'credited',
  'expired'
);

CREATE TYPE "ticket_topic" AS ENUM (
  'booking',
  'payment',
  'plus',
  'partner',
  'dispute',
  'other'
);

CREATE TYPE "ticket_status" AS ENUM (
  'open',
  'in_review',
  'resolved',
  'snoozed'
);

CREATE TYPE "dispute_reason" AS ENUM (
  'quality',
  'incomplete',
  'damage',
  'behavior',
  'billing',
  'other'
);

CREATE TYPE "dispute_status" AS ENUM (
  'submitted',
  'in_review',
  'resolved',
  'rejected'
);

CREATE TYPE "message_sender" AS ENUM (
  'customer',
  'maid',
  'agent',
  'system'
);

CREATE TYPE "notification_channel" AS ENUM (
  'push',
  'sms',
  'whatsapp',
  'email',
  'in_app'
);

CREATE TYPE "notification_category" AS ENUM (
  'booking',
  'pro',
  'payment',
  'offer',
  'system'
);

CREATE TYPE "payout_batch_status" AS ENUM (
  'draft',
  'processing',
  'paid',
  'failed',
  'held'
);

CREATE TYPE "payout_line_status" AS ENUM (
  'pending',
  'ready',
  'held',
  'paid',
  'failed'
);

CREATE TYPE "admin_role_key" AS ENUM (
  'super_admin',
  'ops_manager',
  'support_l1',
  'support_l2',
  'analyst',
  'finance'
);

CREATE TYPE "cancel_reason" AS ENUM (
  'schedule',
  'alternative',
  'maid',
  'price',
  'no_show',
  'admin',
  'other'
);

CREATE TYPE "preferred_channel" AS ENUM (
  'whatsapp',
  'sms',
  'call'
);

CREATE TYPE "customer_health" AS ENUM (
  'vip',
  'active',
  'at_risk',
  'churned'
);

CREATE TYPE "zone_health" AS ENUM (
  'optimal',
  'good',
  'needs_supply',
  'under_served',
  'critical'
);

CREATE TABLE "cities" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "code" varchar(32) UNIQUE NOT NULL,
  "name" varchar(100) NOT NULL,
  "state" varchar(100) NOT NULL,
  "country_code" char(2) NOT NULL DEFAULT 'IN',
  "is_live" boolean NOT NULL DEFAULT false,
  "timezone" varchar(64) NOT NULL DEFAULT 'Asia/Kolkata',
  "created_at" timestamp NOT NULL DEFAULT (now()),
  "updated_at" timestamp NOT NULL DEFAULT (now())
);

CREATE TABLE "zones" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "city_id" uuid NOT NULL,
  "slug" varchar(64) NOT NULL,
  "name" varchar(100) NOT NULL,
  "pincode" varchar(10),
  "center_lat" decimal(10,7),
  "center_lng" decimal(10,7),
  "radius_km" decimal(6,2) DEFAULT 5,
  "demand_score" int DEFAULT 0,
  "supply_score" int DEFAULT 0,
  "coverage_pct" decimal(5,2) DEFAULT 0,
  "avg_eta_minutes" int,
  "health" zone_health DEFAULT 'good',
  "surge_active" boolean NOT NULL DEFAULT false,
  "surge_pct" decimal(5,2) DEFAULT 0,
  "peak_hours" varchar(100),
  "is_active" boolean NOT NULL DEFAULT true,
  "created_at" timestamp NOT NULL DEFAULT (now()),
  "updated_at" timestamp NOT NULL DEFAULT (now())
);

CREATE TABLE "service_categories" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "slug" varchar(64) UNIQUE NOT NULL,
  "name" varchar(100) NOT NULL,
  "sort_order" int NOT NULL DEFAULT 0,
  "is_active" boolean NOT NULL DEFAULT true
);

CREATE TABLE "services" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "slug" varchar(64) UNIQUE NOT NULL,
  "category_id" uuid NOT NULL,
  "name" varchar(150) NOT NULL,
  "description" text,
  "base_price_paise" int NOT NULL,
  "duration_minutes" int,
  "badge" varchar(32),
  "perks" jsonb,
  "icon_key" varchar(64),
  "tint_hex" char(7),
  "avg_rating" decimal(3,2) DEFAULT 0,
  "review_count" int DEFAULT 0,
  "is_active" boolean NOT NULL DEFAULT true,
  "sort_order" int DEFAULT 0,
  "created_at" timestamp NOT NULL DEFAULT (now()),
  "updated_at" timestamp NOT NULL DEFAULT (now())
);

CREATE TABLE "zone_services" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "zone_id" uuid NOT NULL,
  "service_id" uuid NOT NULL,
  "is_top_service" boolean DEFAULT false,
  "price_override_paise" int
);

CREATE TABLE "skills" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "code" varchar(64) UNIQUE NOT NULL,
  "label" varchar(100) NOT NULL,
  "is_active" boolean DEFAULT true
);

CREATE TABLE "time_slots" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "code" varchar(32) UNIQUE NOT NULL,
  "label" varchar(100) NOT NULL,
  "day_mask" varchar(20),
  "start_time" time,
  "end_time" time,
  "sort_order" int DEFAULT 0,
  "is_active" boolean DEFAULT true
);

CREATE TABLE "subscription_plans" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "code" varchar(32) UNIQUE NOT NULL,
  "plan_type" subscription_plan_type NOT NULL,
  "name" varchar(100) NOT NULL,
  "price_paise" int NOT NULL,
  "visit_credits" int,
  "validity_days" int,
  "discount_pct" decimal(5,2) DEFAULT 0,
  "is_active" boolean DEFAULT true,
  "created_at" timestamp NOT NULL DEFAULT (now())
);

CREATE TABLE "users" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "phone" varchar(15) UNIQUE NOT NULL,
  "email" varchar(255),
  "phone_verified_at" timestamp,
  "email_verified_at" timestamp,
  "status" user_status NOT NULL DEFAULT 'pending_verification',
  "last_login_at" timestamp,
  "created_at" timestamp NOT NULL DEFAULT (now()),
  "updated_at" timestamp NOT NULL DEFAULT (now()),
  "deleted_at" timestamp
);

CREATE TABLE "user_roles" (
  "user_id" uuid NOT NULL,
  "role" user_role NOT NULL,
  "granted_at" timestamp NOT NULL DEFAULT (now()),
  PRIMARY KEY ("user_id", "role")
);

CREATE TABLE "otp_verifications" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "phone" varchar(15) NOT NULL,
  "otp_hash" varchar(128) NOT NULL,
  "purpose" varchar(32) NOT NULL,
  "attempts" int NOT NULL DEFAULT 0,
  "expires_at" timestamp NOT NULL,
  "verified_at" timestamp,
  "ip_address" varchar(45),
  "created_at" timestamp NOT NULL DEFAULT (now())
);

CREATE TABLE "auth_sessions" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "user_id" uuid NOT NULL,
  "refresh_token_hash" varchar(128) NOT NULL,
  "device_id" varchar(128),
  "device_name" varchar(100),
  "app_client" varchar(32) NOT NULL,
  "ip_address" varchar(45),
  "user_agent" text,
  "expires_at" timestamp NOT NULL,
  "revoked_at" timestamp,
  "created_at" timestamp NOT NULL DEFAULT (now())
);

CREATE TABLE "customers" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "user_id" uuid UNIQUE NOT NULL,
  "city_id" uuid,
  "name" varchar(150) NOT NULL,
  "gender" gender,
  "home_type" home_type,
  "locality" varchar(150),
  "default_zone_id" uuid,
  "avatar_url" text,
  "language" char(2) NOT NULL DEFAULT 'en',
  "referral_code" varchar(20) UNIQUE NOT NULL,
  "referred_by_customer_id" uuid,
  "member_since" date NOT NULL DEFAULT (CURRENT_DATE),
  "health_segment" customer_health DEFAULT 'active',
  "total_visits" int NOT NULL DEFAULT 0,
  "total_spent_paise" bigint NOT NULL DEFAULT 0,
  "avg_csat" decimal(3,2),
  "created_at" timestamp NOT NULL DEFAULT (now()),
  "updated_at" timestamp NOT NULL DEFAULT (now()),
  "deleted_at" timestamp
);

CREATE TABLE "customer_addresses" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "customer_id" uuid NOT NULL,
  "label" address_label NOT NULL,
  "label_note" varchar(100),
  "flat_no" varchar(50),
  "building" varchar(150),
  "street" varchar(255) NOT NULL,
  "landmark" varchar(150),
  "zone_id" uuid NOT NULL,
  "pincode" varchar(10) NOT NULL,
  "city_id" uuid NOT NULL,
  "gate_code" varchar(50),
  "contact_phone" varchar(15),
  "latitude" decimal(10,7),
  "longitude" decimal(10,7),
  "formatted_line" text NOT NULL,
  "is_default" boolean NOT NULL DEFAULT false,
  "created_at" timestamp NOT NULL DEFAULT (now()),
  "updated_at" timestamp NOT NULL DEFAULT (now()),
  "deleted_at" timestamp
);

CREATE TABLE "customer_preferences" (
  "customer_id" uuid PRIMARY KEY,
  "preferred_slot_id" uuid,
  "favorite_maid_id" uuid,
  "notify_booking" boolean DEFAULT true,
  "notify_offers" boolean DEFAULT true,
  "notify_pro" boolean DEFAULT true,
  "notify_sms" boolean DEFAULT true,
  "whatsapp_opt_in" boolean DEFAULT true,
  "preferred_channel" preferred_channel DEFAULT 'whatsapp',
  "gate_code" varchar(50),
  "has_pets" boolean DEFAULT false,
  "pet_notes" text,
  "parking_notes" text,
  "visit_instructions" text,
  "emergency_name" varchar(100),
  "emergency_phone" varchar(15),
  "emergency_relation" varchar(50),
  "location_permission" boolean DEFAULT false,
  "push_permission" boolean DEFAULT false,
  "updated_at" timestamp NOT NULL DEFAULT (now())
);

CREATE TABLE "customer_payment_methods" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "customer_id" uuid NOT NULL,
  "method_type" payment_method_type NOT NULL,
  "label" varchar(100) NOT NULL,
  "masked_detail" varchar(100) NOT NULL,
  "gateway_token" varchar(255),
  "is_default" boolean DEFAULT false,
  "created_at" timestamp NOT NULL DEFAULT (now()),
  "deleted_at" timestamp
);

CREATE TABLE "customer_saved_services" (
  "customer_id" uuid NOT NULL,
  "service_id" uuid NOT NULL,
  "saved_at" timestamp NOT NULL DEFAULT (now()),
  PRIMARY KEY ("customer_id", "service_id")
);

CREATE TABLE "maid_applications" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "public_id" varchar(20) UNIQUE NOT NULL,
  "user_id" uuid,
  "existing_customer_id" uuid,
  "full_name" varchar(150) NOT NULL,
  "phone" varchar(15) NOT NULL,
  "city_id" uuid,
  "zone_id" uuid,
  "skills_text" varchar(255),
  "age" int,
  "aadhaar_number_encrypted" text,
  "bank_name" varchar(100),
  "bank_account_encrypted" text,
  "ifsc" varchar(20),
  "upi_id" varchar(100),
  "emergency_contact" varchar(100),
  "notes" text,
  "status" application_status NOT NULL DEFAULT 'submitted',
  "submitted_at" timestamp NOT NULL DEFAULT (now()),
  "reviewed_by" uuid,
  "reviewed_at" timestamp,
  "reject_reason" text,
  "approved_maid_id" uuid
);

CREATE TABLE "maids" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "user_id" uuid UNIQUE NOT NULL,
  "linked_customer_id" uuid UNIQUE,
  "public_id" varchar(20) UNIQUE NOT NULL,
  "application_id" uuid,
  "display_name" varchar(150) NOT NULL,
  "bio" text,
  "age" int,
  "gender" gender,
  "city_id" uuid NOT NULL,
  "primary_zone_id" uuid,
  "address_line" text,
  "emergency_contact" varchar(100),
  "upi_id" varchar(100),
  "bank_name" varchar(100),
  "bank_account_masked" varchar(30),
  "ifsc" varchar(20),
  "status" maid_status NOT NULL DEFAULT 'pending_kyc',
  "police_verified" boolean DEFAULT false,
  "training_verified" boolean DEFAULT false,
  "experience_years" int DEFAULT 0,
  "languages" varchar(255),
  "avg_rating" decimal(3,2) DEFAULT 0,
  "total_jobs" int DEFAULT 0,
  "on_time_pct" decimal(5,2) DEFAULT 0,
  "repeat_rate_pct" decimal(5,2) DEFAULT 0,
  "no_show_count" int DEFAULT 0,
  "total_earnings_paise" bigint DEFAULT 0,
  "is_online" boolean NOT NULL DEFAULT false,
  "last_active_at" timestamp,
  "joined_at" date NOT NULL DEFAULT (CURRENT_DATE),
  "suspended_at" timestamp,
  "suspend_reason" text,
  "created_at" timestamp NOT NULL DEFAULT (now()),
  "updated_at" timestamp NOT NULL DEFAULT (now()),
  "deleted_at" timestamp
);

CREATE TABLE "maid_skills_map" (
  "maid_id" uuid NOT NULL,
  "skill_id" uuid NOT NULL,
  PRIMARY KEY ("maid_id", "skill_id")
);

CREATE TABLE "maid_zones_map" (
  "maid_id" uuid NOT NULL,
  "zone_id" uuid NOT NULL,
  PRIMARY KEY ("maid_id", "zone_id")
);

CREATE TABLE "maid_documents" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "maid_id" uuid NOT NULL,
  "doc_type" kyc_doc_type NOT NULL,
  "status" kyc_doc_status NOT NULL DEFAULT 'missing',
  "file_url" text,
  "file_hash" varchar(64),
  "verified_by" uuid,
  "verified_at" timestamp,
  "reject_reason" text,
  "created_at" timestamp NOT NULL DEFAULT (now()),
  "updated_at" timestamp NOT NULL DEFAULT (now())
);

CREATE TABLE "maid_availability" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "maid_id" uuid NOT NULL,
  "slot_id" uuid NOT NULL,
  "day_of_week" smallint NOT NULL,
  "is_available" boolean NOT NULL DEFAULT true
);

CREATE TABLE "maid_location_pings" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "maid_id" uuid NOT NULL,
  "booking_id" uuid,
  "latitude" decimal(10,7) NOT NULL,
  "longitude" decimal(10,7) NOT NULL,
  "accuracy_meters" decimal(8,2),
  "recorded_at" timestamp NOT NULL DEFAULT (now())
);

CREATE TABLE "bookings" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "booking_ref" varchar(32) UNIQUE NOT NULL,
  "customer_id" uuid NOT NULL,
  "city_id" uuid NOT NULL,
  "zone_id" uuid NOT NULL,
  "address_id" uuid,
  "address_snapshot" jsonb NOT NULL,
  "status" booking_status NOT NULL DEFAULT 'draft',
  "slot_id" uuid,
  "slot_label" varchar(100),
  "visit_date" date NOT NULL,
  "visit_start_at" timestamp,
  "visit_end_at" timestamp,
  "instructions" text,
  "subtotal_paise" int NOT NULL DEFAULT 0,
  "plus_discount_paise" int NOT NULL DEFAULT 0,
  "coupon_discount_paise" int NOT NULL DEFAULT 0,
  "wallet_used_paise" int NOT NULL DEFAULT 0,
  "platform_fee_paise" int NOT NULL DEFAULT 0,
  "total_paise" int NOT NULL DEFAULT 0,
  "payable_paise" int NOT NULL DEFAULT 0,
  "coupon_code" varchar(32),
  "subscription_id" uuid,
  "payment_mode" payment_method_type,
  "payment_status" payment_status,
  "assigned_maid_id" uuid,
  "maid_assigned_at" timestamp,
  "completion_otp_hash" varchar(128),
  "otp_verified_at" timestamp,
  "completed_at" timestamp,
  "cancelled_at" timestamp,
  "cancel_reason" cancel_reason,
  "cancel_note" text,
  "refund_amount_paise" int DEFAULT 0,
  "refund_status" refund_status,
  "source" varchar(20) NOT NULL DEFAULT 'app',
  "created_at" timestamp NOT NULL DEFAULT (now()),
  "updated_at" timestamp NOT NULL DEFAULT (now())
);

CREATE TABLE "booking_line_items" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "booking_id" uuid NOT NULL,
  "service_id" uuid NOT NULL,
  "service_name" varchar(150) NOT NULL,
  "unit_price_paise" int NOT NULL,
  "quantity" int NOT NULL DEFAULT 1,
  "duration_minutes" int,
  "line_total_paise" int NOT NULL
);

CREATE TABLE "booking_status_events" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "booking_id" uuid NOT NULL,
  "from_status" booking_status,
  "to_status" booking_status NOT NULL,
  "actor_user_id" uuid,
  "actor_type" varchar(20),
  "note" text,
  "created_at" timestamp NOT NULL DEFAULT (now())
);

CREATE TABLE "booking_assignments" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "booking_id" uuid NOT NULL,
  "maid_id" uuid NOT NULL,
  "assigned_by" uuid,
  "assignment_type" varchar(20) NOT NULL,
  "response" assignment_response NOT NULL DEFAULT 'pending',
  "responded_at" timestamp,
  "decline_reason" varchar(100),
  "is_active" boolean NOT NULL DEFAULT true,
  "assigned_at" timestamp NOT NULL DEFAULT (now()),
  "unassigned_at" timestamp
);

CREATE TABLE "booking_reviews" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "booking_id" uuid UNIQUE NOT NULL,
  "customer_id" uuid NOT NULL,
  "maid_id" uuid NOT NULL,
  "rating" smallint NOT NULL,
  "review_text" text,
  "tags" varchar(255),
  "created_at" timestamp NOT NULL DEFAULT (now())
);

CREATE TABLE "payment_orders" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "booking_id" uuid,
  "subscription_id" uuid,
  "customer_id" uuid NOT NULL,
  "gateway" varchar(32) NOT NULL DEFAULT 'razorpay',
  "gateway_order_id" varchar(100) UNIQUE,
  "amount_paise" int NOT NULL,
  "currency" char(3) NOT NULL DEFAULT 'INR',
  "status" payment_status NOT NULL DEFAULT 'created',
  "idempotency_key" varchar(64) UNIQUE,
  "created_at" timestamp NOT NULL DEFAULT (now()),
  "updated_at" timestamp NOT NULL DEFAULT (now())
);

CREATE TABLE "payment_transactions" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "payment_order_id" uuid NOT NULL,
  "gateway_payment_id" varchar(100) UNIQUE,
  "method" payment_method_type NOT NULL,
  "method_label" varchar(100),
  "amount_paise" int NOT NULL,
  "wallet_used_paise" int NOT NULL DEFAULT 0,
  "status" payment_status NOT NULL,
  "captured_at" timestamp,
  "raw_gateway_payload" jsonb,
  "created_at" timestamp NOT NULL DEFAULT (now())
);

CREATE TABLE "refunds" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "payment_transaction_id" uuid NOT NULL,
  "booking_id" uuid,
  "refund_ref" varchar(32) UNIQUE,
  "amount_paise" int NOT NULL,
  "reason" cancel_reason,
  "reason_note" text,
  "status" refund_status NOT NULL DEFAULT 'requested',
  "gateway_refund_id" varchar(100),
  "initiated_by" uuid,
  "completed_at" timestamp,
  "created_at" timestamp NOT NULL DEFAULT (now())
);

CREATE TABLE "wallet_accounts" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "customer_id" uuid UNIQUE NOT NULL,
  "balance_paise" bigint NOT NULL DEFAULT 0,
  "version" int NOT NULL DEFAULT 0,
  "updated_at" timestamp NOT NULL DEFAULT (now())
);

CREATE TABLE "wallet_ledger_entries" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "wallet_account_id" uuid NOT NULL,
  "entry_type" wallet_entry_type NOT NULL,
  "source" wallet_entry_source NOT NULL,
  "amount_paise" int NOT NULL,
  "balance_after_paise" bigint NOT NULL,
  "title" varchar(150) NOT NULL,
  "subtitle" varchar(255),
  "reference_type" varchar(32),
  "reference_id" uuid,
  "idempotency_key" varchar(64) UNIQUE,
  "created_at" timestamp NOT NULL DEFAULT (now())
);

CREATE TABLE "customer_subscriptions" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "customer_id" uuid NOT NULL,
  "plan_id" uuid NOT NULL,
  "status" subscription_status NOT NULL DEFAULT 'active',
  "visits_total" int,
  "visits_remaining" int,
  "amount_paid_paise" int NOT NULL,
  "wallet_used_paise" int DEFAULT 0,
  "payment_transaction_id" uuid,
  "started_at" timestamp NOT NULL DEFAULT (now()),
  "renews_at" timestamp,
  "paused_at" timestamp,
  "paused_until" timestamp,
  "cancelled_at" timestamp,
  "created_at" timestamp NOT NULL DEFAULT (now())
);

CREATE TABLE "coupon_campaigns" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "code" varchar(32) UNIQUE NOT NULL,
  "title" varchar(150) NOT NULL,
  "description" text,
  "discount_type" coupon_discount_type NOT NULL,
  "discount_value" decimal(10,2) NOT NULL,
  "min_order_paise" int,
  "max_discount_paise" int,
  "category" coupon_category NOT NULL DEFAULT 'all',
  "channel" varchar(50),
  "max_redemptions" int,
  "used_count" int NOT NULL DEFAULT 0,
  "status" coupon_status NOT NULL DEFAULT 'draft',
  "valid_from" timestamp,
  "valid_until" timestamp,
  "created_by" uuid,
  "created_at" timestamp NOT NULL DEFAULT (now())
);

CREATE TABLE "customer_coupons" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "customer_id" uuid NOT NULL,
  "campaign_id" uuid NOT NULL,
  "status" customer_coupon_status NOT NULL DEFAULT 'active',
  "saved_at" timestamp NOT NULL DEFAULT (now()),
  "expires_at" timestamp,
  "used_at" timestamp,
  "used_on_booking_id" uuid
);

CREATE TABLE "coupon_redemptions" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "campaign_id" uuid NOT NULL,
  "customer_id" uuid NOT NULL,
  "booking_id" uuid,
  "discount_paise" int NOT NULL,
  "redeemed_at" timestamp NOT NULL DEFAULT (now())
);

CREATE TABLE "referrals" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "referrer_customer_id" uuid NOT NULL,
  "referee_customer_id" uuid,
  "referee_phone" varchar(15),
  "referee_name" varchar(150),
  "status" referral_status NOT NULL DEFAULT 'pending',
  "reward_paise" int NOT NULL DEFAULT 10000,
  "credited_ledger_id" uuid,
  "created_at" timestamp NOT NULL DEFAULT (now()),
  "credited_at" timestamp
);

CREATE TABLE "waitlist_entries" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "city_name" varchar(100) NOT NULL,
  "email" varchar(255) NOT NULL,
  "source" varchar(32) DEFAULT 'landing',
  "created_at" timestamp NOT NULL DEFAULT (now())
);

CREATE TABLE "corporate_accounts" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "company_name" varchar(200) NOT NULL,
  "contact_name" varchar(150),
  "contact_email" varchar(255),
  "contact_phone" varchar(15),
  "city_id" uuid,
  "billing_gstin" varchar(20),
  "contract_value_paise" bigint,
  "status" varchar(20) DEFAULT 'active',
  "notes" text,
  "created_at" timestamp NOT NULL DEFAULT (now())
);

CREATE TABLE "payout_batches" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "batch_ref" varchar(32) UNIQUE NOT NULL,
  "period_start" date NOT NULL,
  "period_end" date NOT NULL,
  "total_amount_paise" bigint NOT NULL DEFAULT 0,
  "maid_count" int NOT NULL DEFAULT 0,
  "status" payout_batch_status NOT NULL DEFAULT 'draft',
  "processed_by" uuid,
  "processed_at" timestamp,
  "created_at" timestamp NOT NULL DEFAULT (now())
);

CREATE TABLE "maid_payout_lines" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "batch_id" uuid NOT NULL,
  "maid_id" uuid NOT NULL,
  "bookings_count" int NOT NULL DEFAULT 0,
  "gross_paise" int NOT NULL,
  "deductions_paise" int NOT NULL DEFAULT 0,
  "net_paise" int NOT NULL,
  "upi_id" varchar(100),
  "status" payout_line_status NOT NULL DEFAULT 'pending',
  "risk_note" text,
  "gateway_transfer_id" varchar(100),
  "paid_at" timestamp
);

CREATE TABLE "maid_earnings_ledger" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "maid_id" uuid NOT NULL,
  "booking_id" uuid,
  "gross_paise" int NOT NULL,
  "platform_fee_paise" int NOT NULL DEFAULT 0,
  "net_paise" int NOT NULL,
  "payout_line_id" uuid,
  "created_at" timestamp NOT NULL DEFAULT (now())
);

CREATE TABLE "support_tickets" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "public_id" varchar(20) UNIQUE NOT NULL,
  "customer_id" uuid,
  "maid_id" uuid,
  "topic" ticket_topic NOT NULL,
  "status" ticket_status NOT NULL DEFAULT 'open',
  "priority" varchar(10) DEFAULT 'med',
  "subject" varchar(255) NOT NULL,
  "booking_id" uuid,
  "booking_ref" varchar(32),
  "payment_transaction_id" uuid,
  "assigned_agent_id" uuid,
  "sla_due_at" timestamp,
  "resolved_at" timestamp,
  "created_at" timestamp NOT NULL DEFAULT (now()),
  "updated_at" timestamp NOT NULL DEFAULT (now())
);

CREATE TABLE "support_messages" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "ticket_id" uuid NOT NULL,
  "sender_type" message_sender NOT NULL,
  "sender_user_id" uuid,
  "body" text NOT NULL,
  "is_internal" boolean DEFAULT false,
  "read_at" timestamp,
  "created_at" timestamp NOT NULL DEFAULT (now())
);

CREATE TABLE "support_attachments" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "message_id" uuid NOT NULL,
  "file_name" varchar(255) NOT NULL,
  "file_url" text NOT NULL,
  "mime_type" varchar(100),
  "size_bytes" bigint,
  "created_at" timestamp NOT NULL DEFAULT (now())
);

CREATE TABLE "booking_disputes" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "public_id" varchar(20) UNIQUE NOT NULL,
  "ticket_id" uuid NOT NULL,
  "booking_id" uuid NOT NULL,
  "customer_id" uuid NOT NULL,
  "reason" dispute_reason NOT NULL,
  "reason_label" varchar(100) NOT NULL,
  "description" text NOT NULL,
  "refund_requested" boolean DEFAULT false,
  "status" dispute_status NOT NULL DEFAULT 'submitted',
  "resolution_note" text,
  "resolved_by" uuid,
  "created_at" timestamp NOT NULL DEFAULT (now()),
  "resolved_at" timestamp
);

CREATE TABLE "device_push_tokens" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "user_id" uuid NOT NULL,
  "token" text NOT NULL,
  "platform" varchar(20) NOT NULL,
  "app_client" varchar(20) NOT NULL,
  "is_active" boolean DEFAULT true,
  "created_at" timestamp NOT NULL DEFAULT (now()),
  "last_used_at" timestamp
);

CREATE TABLE "notifications" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "user_id" uuid NOT NULL,
  "category" notification_category NOT NULL,
  "title" varchar(200) NOT NULL,
  "body" text NOT NULL,
  "detail" text,
  "action_type" varchar(32),
  "action_target_id" uuid,
  "channel" notification_channel NOT NULL DEFAULT 'in_app',
  "is_read" boolean NOT NULL DEFAULT false,
  "read_at" timestamp,
  "sent_at" timestamp,
  "created_at" timestamp NOT NULL DEFAULT (now())
);

CREATE TABLE "admin_alert_rules" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "name" varchar(100) NOT NULL,
  "severity" varchar(10) NOT NULL,
  "channel" notification_channel NOT NULL,
  "recipients" text NOT NULL,
  "is_enabled" boolean DEFAULT true,
  "created_at" timestamp NOT NULL DEFAULT (now())
);

CREATE TABLE "permissions" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "code" varchar(64) UNIQUE NOT NULL,
  "description" varchar(255)
);

CREATE TABLE "admin_roles" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "role_key" admin_role_key UNIQUE NOT NULL,
  "name" varchar(100) NOT NULL,
  "description" text
);

CREATE TABLE "admin_role_permissions" (
  "role_id" uuid NOT NULL,
  "permission_id" uuid NOT NULL,
  PRIMARY KEY ("role_id", "permission_id")
);

CREATE TABLE "admin_users" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "user_id" uuid UNIQUE NOT NULL,
  "role_id" uuid NOT NULL,
  "display_name" varchar(150) NOT NULL,
  "login_id" varchar(100) UNIQUE NOT NULL,
  "status" varchar(20) NOT NULL DEFAULT 'active',
  "last_active_at" timestamp,
  "invited_by" uuid,
  "created_at" timestamp NOT NULL DEFAULT (now())
);

CREATE TABLE "audit_logs" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "actor_user_id" uuid,
  "actor_type" varchar(20) NOT NULL,
  "action" varchar(100) NOT NULL,
  "target_type" varchar(50) NOT NULL,
  "target_id" uuid,
  "metadata" jsonb,
  "ip_address" varchar(45),
  "user_agent" text,
  "created_at" timestamp NOT NULL DEFAULT (now())
);

CREATE TABLE "platform_settings" (
  "key" varchar(100) PRIMARY KEY,
  "value" jsonb NOT NULL,
  "updated_by" uuid,
  "updated_at" timestamp NOT NULL DEFAULT (now())
);

CREATE TABLE "dsar_requests" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "customer_id" uuid,
  "request_type" varchar(20) NOT NULL,
  "status" varchar(20) NOT NULL DEFAULT 'pending',
  "requested_at" timestamp NOT NULL DEFAULT (now()),
  "completed_at" timestamp,
  "handled_by" uuid
);

CREATE TABLE "knowledge_base_articles" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "slug" varchar(100) UNIQUE NOT NULL,
  "title" varchar(200) NOT NULL,
  "body" text NOT NULL,
  "category" varchar(50),
  "is_published" boolean DEFAULT false,
  "updated_by" uuid,
  "created_at" timestamp NOT NULL DEFAULT (now()),
  "updated_at" timestamp NOT NULL DEFAULT (now())
);

CREATE TABLE "report_schedules" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "name" varchar(150) NOT NULL,
  "cadence" varchar(50) NOT NULL,
  "owner_role" admin_role_key,
  "format" varchar(10) NOT NULL,
  "recipient_email" varchar(255),
  "query_key" varchar(100) NOT NULL,
  "next_run_at" timestamp,
  "is_active" boolean DEFAULT true,
  "created_at" timestamp NOT NULL DEFAULT (now())
);

CREATE UNIQUE INDEX ON "zones" ("city_id", "slug");

CREATE INDEX ON "zones" ("city_id");

CREATE INDEX ON "services" ("category_id");

CREATE INDEX ON "services" ("is_active");

CREATE UNIQUE INDEX ON "zone_services" ("zone_id", "service_id");

CREATE INDEX ON "users" ("phone");

CREATE INDEX ON "users" ("status");

CREATE INDEX ON "otp_verifications" ("phone", "purpose", "created_at");

CREATE INDEX ON "auth_sessions" ("user_id");

CREATE INDEX ON "auth_sessions" ("expires_at");

CREATE INDEX ON "customers" ("referral_code");

CREATE INDEX ON "customers" ("city_id");

CREATE INDEX ON "customers" ("health_segment");

CREATE INDEX ON "customer_addresses" ("customer_id");

CREATE INDEX ON "customer_addresses" ("customer_id", "is_default");

CREATE INDEX ON "customer_payment_methods" ("customer_id");

CREATE INDEX ON "maid_applications" ("phone", "status");

CREATE INDEX ON "maid_applications" ("user_id");

CREATE INDEX ON "maid_applications" ("status");

CREATE INDEX ON "maids" ("public_id");

CREATE INDEX ON "maids" ("city_id", "status");

CREATE INDEX ON "maids" ("primary_zone_id");

CREATE INDEX ON "maids" ("status");

CREATE UNIQUE INDEX ON "maid_documents" ("maid_id", "doc_type");

CREATE UNIQUE INDEX ON "maid_availability" ("maid_id", "day_of_week", "slot_id");

CREATE INDEX ON "maid_location_pings" ("maid_id", "recorded_at");

CREATE INDEX ON "maid_location_pings" ("booking_id");

CREATE INDEX ON "bookings" ("booking_ref");

CREATE INDEX ON "bookings" ("customer_id");

CREATE INDEX ON "bookings" ("status", "visit_date");

CREATE INDEX ON "bookings" ("assigned_maid_id");

CREATE INDEX ON "bookings" ("zone_id", "status", "visit_date");

CREATE INDEX ON "bookings" ("created_at");

CREATE INDEX ON "booking_line_items" ("booking_id");

CREATE INDEX ON "booking_status_events" ("booking_id", "created_at");

CREATE INDEX ON "booking_assignments" ("booking_id");

CREATE INDEX ON "booking_assignments" ("maid_id", "is_active");

CREATE INDEX ON "booking_assignments" ("maid_id", "response");

CREATE INDEX ON "booking_reviews" ("maid_id");

CREATE INDEX ON "payment_orders" ("customer_id");

CREATE INDEX ON "payment_orders" ("booking_id");

CREATE INDEX ON "wallet_ledger_entries" ("wallet_account_id", "created_at");

CREATE INDEX ON "wallet_ledger_entries" ("reference_id");

CREATE INDEX ON "customer_subscriptions" ("customer_id", "status");

CREATE INDEX ON "customer_coupons" ("customer_id", "status");

CREATE UNIQUE INDEX ON "customer_coupons" ("customer_id", "campaign_id");

CREATE INDEX ON "referrals" ("referrer_customer_id");

CREATE UNIQUE INDEX ON "waitlist_entries" ("email", "city_name");

CREATE UNIQUE INDEX ON "maid_payout_lines" ("batch_id", "maid_id");

CREATE INDEX ON "maid_payout_lines" ("maid_id");

CREATE INDEX ON "maid_earnings_ledger" ("maid_id", "created_at");

CREATE INDEX ON "maid_earnings_ledger" ("booking_id");

CREATE INDEX ON "support_tickets" ("status", "priority");

CREATE INDEX ON "support_tickets" ("customer_id");

CREATE INDEX ON "support_tickets" ("booking_id");

CREATE INDEX ON "support_messages" ("ticket_id", "created_at");

CREATE UNIQUE INDEX ON "booking_disputes" ("booking_id");

CREATE INDEX ON "device_push_tokens" ("user_id", "platform");

CREATE INDEX ON "device_push_tokens" ("token");

CREATE INDEX ON "notifications" ("user_id", "is_read", "created_at");

CREATE INDEX ON "audit_logs" ("created_at");

CREATE INDEX ON "audit_logs" ("target_type", "target_id");

CREATE INDEX ON "audit_logs" ("actor_user_id");

COMMENT ON TABLE "cities" IS 'Expansion cities from waitlist drive `is_live` flips';

COMMENT ON COLUMN "cities"."code" IS 'raipur';

COMMENT ON COLUMN "zones"."slug" IS 'shankar-nagar';

COMMENT ON COLUMN "service_categories"."slug" IS 'deep, kitchen, packages';

COMMENT ON COLUMN "services"."slug" IS 'deep, regular, bhk2deep';

COMMENT ON COLUMN "services"."base_price_paise" IS 'INR × 100';

COMMENT ON COLUMN "services"."badge" IS 'Popular, Best value';

COMMENT ON COLUMN "services"."perks" IS 'string[]';

COMMENT ON COLUMN "zone_services"."price_override_paise" IS 'null = use services.base_price_paise';

COMMENT ON COLUMN "skills"."code" IS 'cleaning, cooking, deep_clean';

COMMENT ON COLUMN "time_slots"."code" IS 'morning, afternoon, weekend_am';

COMMENT ON COLUMN "time_slots"."label" IS 'Mon–Sat · 8–11 AM';

COMMENT ON COLUMN "time_slots"."day_mask" IS 'weekday|weekend|all';

COMMENT ON COLUMN "subscription_plans"."code" IS 'plus, flex, onetime';

COMMENT ON COLUMN "subscription_plans"."visit_credits" IS 'null = pay per visit';

COMMENT ON COLUMN "subscription_plans"."discount_pct" IS 'Plus 10% on bookings';

COMMENT ON TABLE "users" IS 'No single user_type — use user_roles. Same person can be maid AND customer.';

COMMENT ON COLUMN "users"."phone" IS 'E.164 +91… — one identity per person';

COMMENT ON TABLE "user_roles" IS 'Bidirectional: customer can become maid, maid can book as customer — same user_id, both roles';

COMMENT ON COLUMN "otp_verifications"."purpose" IS 'login, signup, payout_verify';

COMMENT ON COLUMN "auth_sessions"."app_client" IS 'customer|maid|admin_web';

COMMENT ON TABLE "customers" IS 'Existing customer can apply to become maid via maid_applications — same user_id kept';

COMMENT ON COLUMN "customers"."language" IS 'en|hi';

COMMENT ON COLUMN "customer_addresses"."label_note" IS 'Required when label is other e.g. Moms home';

COMMENT ON COLUMN "customer_payment_methods"."masked_detail" IS 'UPI VPA / card last4';

COMMENT ON COLUMN "customer_payment_methods"."gateway_token" IS 'Razorpay customer/payment method id';

COMMENT ON TABLE "maid_applications" IS 'Customer App Become a Partner CTA creates row with user_id + existing_customer_id';

COMMENT ON COLUMN "maid_applications"."public_id" IS 'MD-1104';

COMMENT ON COLUMN "maid_applications"."user_id" IS 'Set when applicant is already a customer — same phone account';

COMMENT ON COLUMN "maid_applications"."existing_customer_id" IS 'Pre-filled from customer profile on upgrade path';

COMMENT ON COLUMN "maid_applications"."aadhaar_number_encrypted" IS 'AES encrypted at rest - bytea in PostgreSQL';

COMMENT ON COLUMN "maid_applications"."bank_account_encrypted" IS 'bytea in PostgreSQL';

COMMENT ON COLUMN "maid_applications"."approved_maid_id" IS 'Set on approve';

COMMENT ON COLUMN "maids"."linked_customer_id" IS 'Personal customer profile when maid books for own home';

COMMENT ON COLUMN "maids"."public_id" IS 'MD-1042';

COMMENT ON COLUMN "maids"."languages" IS 'comma-separated';

COMMENT ON COLUMN "maids"."is_online" IS 'Partner app go-online toggle';

COMMENT ON COLUMN "maid_documents"."file_url" IS 'S3 pre-signed upload URL stored';

COMMENT ON COLUMN "maid_availability"."day_of_week" IS '0=Sun … 6=Sat';

COMMENT ON TABLE "maid_location_pings" IS 'High-volume — partition by month; hot ETA in Redis';

COMMENT ON TABLE "bookings" IS 'Rule: assigned_maid_id must not equal customers linked via maids.linked_customer_id (no self-job). Enforced in API dispatch.';

COMMENT ON COLUMN "bookings"."booking_ref" IS 'QM-8JUN-499';

COMMENT ON COLUMN "bookings"."address_id" IS 'Source address FK';

COMMENT ON COLUMN "bookings"."address_snapshot" IS 'Frozen address at booking time';

COMMENT ON COLUMN "bookings"."completion_otp_hash" IS 'Hashed 6-digit OTP for visit complete';

COMMENT ON COLUMN "bookings"."source" IS 'app|web|admin|b2b';

COMMENT ON COLUMN "booking_line_items"."service_name" IS 'Snapshot';

COMMENT ON TABLE "booking_status_events" IS 'Append-only state machine audit';

COMMENT ON COLUMN "booking_status_events"."actor_type" IS 'customer|maid|admin|system';

COMMENT ON TABLE "booking_assignments" IS 'Partner app job inbox — pending until accepted';

COMMENT ON COLUMN "booking_assignments"."assigned_by" IS 'admin or dispatch engine';

COMMENT ON COLUMN "booking_assignments"."assignment_type" IS 'auto|manual|favorite|reassign';

COMMENT ON COLUMN "booking_assignments"."response" IS 'Partner accept or decline job';

COMMENT ON COLUMN "booking_reviews"."rating" IS '1-5';

COMMENT ON COLUMN "booking_reviews"."tags" IS 'comma-separated tags';

COMMENT ON TABLE "payment_transactions" IS 'Immutable after capture — never UPDATE amount/status; use refunds';

COMMENT ON COLUMN "refunds"."refund_ref" IS 'RFND-…';

COMMENT ON COLUMN "wallet_accounts"."balance_paise" IS 'Cached — source of truth is ledger';

COMMENT ON COLUMN "wallet_accounts"."version" IS 'Optimistic locking';

COMMENT ON TABLE "wallet_ledger_entries" IS 'Append-only financial ledger — never delete rows';

COMMENT ON COLUMN "wallet_ledger_entries"."amount_paise" IS 'Always positive; type determines sign';

COMMENT ON COLUMN "wallet_ledger_entries"."reference_type" IS 'booking|subscription|referral|topup';

COMMENT ON COLUMN "coupon_campaigns"."channel" IS 'WhatsApp, App, Sales';

COMMENT ON COLUMN "referrals"."reward_paise" IS '₹100';

COMMENT ON COLUMN "payout_batches"."batch_ref" IS 'PW-2025-W24';

COMMENT ON COLUMN "support_tickets"."public_id" IS 'TKT-089';

COMMENT ON COLUMN "support_tickets"."priority" IS 'high|med|low';

COMMENT ON COLUMN "support_messages"."is_internal" IS 'Agent-only notes';

COMMENT ON TABLE "booking_disputes" IS 'One open dispute per booking — enforce in app layer or partial unique index';

COMMENT ON COLUMN "booking_disputes"."public_id" IS 'DSP-…';

COMMENT ON COLUMN "device_push_tokens"."platform" IS 'ios|android|web';

COMMENT ON COLUMN "notifications"."action_type" IS 'booking|pro|profile|none';

COMMENT ON COLUMN "admin_alert_rules"."severity" IS 'info|warn|crit|any';

COMMENT ON COLUMN "admin_alert_rules"."recipients" IS 'emails or slack channel';

COMMENT ON COLUMN "permissions"."code" IS 'bookings.cancel, payouts.approve';

COMMENT ON COLUMN "admin_users"."status" IS 'active|invited|suspended';

COMMENT ON TABLE "audit_logs" IS 'Append-only — partition by month in production';

COMMENT ON COLUMN "audit_logs"."action" IS 'booking.cancel, maid.suspend';

COMMENT ON TABLE "platform_settings" IS 'email_bookings, sms_otp, push_dispatch, maintenance_mode, two_factor_enforce';

COMMENT ON COLUMN "dsar_requests"."request_type" IS 'export|delete';

COMMENT ON COLUMN "report_schedules"."format" IS 'csv|xlsx|pdf';

ALTER TABLE "zones" ADD FOREIGN KEY ("city_id") REFERENCES "cities" ("id");

ALTER TABLE "services" ADD FOREIGN KEY ("category_id") REFERENCES "service_categories" ("id");

ALTER TABLE "zone_services" ADD FOREIGN KEY ("zone_id") REFERENCES "zones" ("id");

ALTER TABLE "zone_services" ADD FOREIGN KEY ("service_id") REFERENCES "services" ("id");

ALTER TABLE "user_roles" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");

ALTER TABLE "auth_sessions" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");

ALTER TABLE "customers" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");

ALTER TABLE "customers" ADD FOREIGN KEY ("city_id") REFERENCES "cities" ("id");

ALTER TABLE "customers" ADD FOREIGN KEY ("default_zone_id") REFERENCES "zones" ("id");

ALTER TABLE "customers" ADD FOREIGN KEY ("referred_by_customer_id") REFERENCES "customers" ("id");

ALTER TABLE "customer_addresses" ADD FOREIGN KEY ("customer_id") REFERENCES "customers" ("id");

ALTER TABLE "customer_addresses" ADD FOREIGN KEY ("zone_id") REFERENCES "zones" ("id");

ALTER TABLE "customer_addresses" ADD FOREIGN KEY ("city_id") REFERENCES "cities" ("id");

ALTER TABLE "customer_preferences" ADD FOREIGN KEY ("customer_id") REFERENCES "customers" ("id");

ALTER TABLE "customer_preferences" ADD FOREIGN KEY ("preferred_slot_id") REFERENCES "time_slots" ("id");

ALTER TABLE "customer_preferences" ADD FOREIGN KEY ("favorite_maid_id") REFERENCES "maids" ("id");

ALTER TABLE "customer_payment_methods" ADD FOREIGN KEY ("customer_id") REFERENCES "customers" ("id");

ALTER TABLE "customer_saved_services" ADD FOREIGN KEY ("customer_id") REFERENCES "customers" ("id");

ALTER TABLE "customer_saved_services" ADD FOREIGN KEY ("service_id") REFERENCES "services" ("id");

ALTER TABLE "maid_applications" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");

ALTER TABLE "maid_applications" ADD FOREIGN KEY ("existing_customer_id") REFERENCES "customers" ("id");

ALTER TABLE "maid_applications" ADD FOREIGN KEY ("city_id") REFERENCES "cities" ("id");

ALTER TABLE "maid_applications" ADD FOREIGN KEY ("zone_id") REFERENCES "zones" ("id");

ALTER TABLE "maid_applications" ADD FOREIGN KEY ("reviewed_by") REFERENCES "admin_users" ("id");

ALTER TABLE "maid_applications" ADD FOREIGN KEY ("approved_maid_id") REFERENCES "maids" ("id");

ALTER TABLE "maids" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");

ALTER TABLE "maids" ADD FOREIGN KEY ("linked_customer_id") REFERENCES "customers" ("id");

ALTER TABLE "maids" ADD FOREIGN KEY ("application_id") REFERENCES "maid_applications" ("id");

ALTER TABLE "maids" ADD FOREIGN KEY ("city_id") REFERENCES "cities" ("id");

ALTER TABLE "maids" ADD FOREIGN KEY ("primary_zone_id") REFERENCES "zones" ("id");

ALTER TABLE "maid_skills_map" ADD FOREIGN KEY ("maid_id") REFERENCES "maids" ("id");

ALTER TABLE "maid_skills_map" ADD FOREIGN KEY ("skill_id") REFERENCES "skills" ("id");

ALTER TABLE "maid_zones_map" ADD FOREIGN KEY ("maid_id") REFERENCES "maids" ("id");

ALTER TABLE "maid_zones_map" ADD FOREIGN KEY ("zone_id") REFERENCES "zones" ("id");

ALTER TABLE "maid_documents" ADD FOREIGN KEY ("maid_id") REFERENCES "maids" ("id");

ALTER TABLE "maid_documents" ADD FOREIGN KEY ("verified_by") REFERENCES "admin_users" ("id");

ALTER TABLE "maid_availability" ADD FOREIGN KEY ("maid_id") REFERENCES "maids" ("id");

ALTER TABLE "maid_availability" ADD FOREIGN KEY ("slot_id") REFERENCES "time_slots" ("id");

ALTER TABLE "maid_location_pings" ADD FOREIGN KEY ("maid_id") REFERENCES "maids" ("id");

ALTER TABLE "maid_location_pings" ADD FOREIGN KEY ("booking_id") REFERENCES "bookings" ("id");

ALTER TABLE "bookings" ADD FOREIGN KEY ("customer_id") REFERENCES "customers" ("id");

ALTER TABLE "bookings" ADD FOREIGN KEY ("city_id") REFERENCES "cities" ("id");

ALTER TABLE "bookings" ADD FOREIGN KEY ("zone_id") REFERENCES "zones" ("id");

ALTER TABLE "bookings" ADD FOREIGN KEY ("address_id") REFERENCES "customer_addresses" ("id");

ALTER TABLE "bookings" ADD FOREIGN KEY ("slot_id") REFERENCES "time_slots" ("id");

ALTER TABLE "bookings" ADD FOREIGN KEY ("subscription_id") REFERENCES "customer_subscriptions" ("id");

ALTER TABLE "bookings" ADD FOREIGN KEY ("assigned_maid_id") REFERENCES "maids" ("id");

ALTER TABLE "booking_line_items" ADD FOREIGN KEY ("booking_id") REFERENCES "bookings" ("id");

ALTER TABLE "booking_line_items" ADD FOREIGN KEY ("service_id") REFERENCES "services" ("id");

ALTER TABLE "booking_status_events" ADD FOREIGN KEY ("booking_id") REFERENCES "bookings" ("id");

ALTER TABLE "booking_status_events" ADD FOREIGN KEY ("actor_user_id") REFERENCES "users" ("id");

ALTER TABLE "booking_assignments" ADD FOREIGN KEY ("booking_id") REFERENCES "bookings" ("id");

ALTER TABLE "booking_assignments" ADD FOREIGN KEY ("maid_id") REFERENCES "maids" ("id");

ALTER TABLE "booking_assignments" ADD FOREIGN KEY ("assigned_by") REFERENCES "users" ("id");

ALTER TABLE "booking_reviews" ADD FOREIGN KEY ("booking_id") REFERENCES "bookings" ("id");

ALTER TABLE "booking_reviews" ADD FOREIGN KEY ("customer_id") REFERENCES "customers" ("id");

ALTER TABLE "booking_reviews" ADD FOREIGN KEY ("maid_id") REFERENCES "maids" ("id");

ALTER TABLE "payment_orders" ADD FOREIGN KEY ("booking_id") REFERENCES "bookings" ("id");

ALTER TABLE "payment_orders" ADD FOREIGN KEY ("subscription_id") REFERENCES "customer_subscriptions" ("id");

ALTER TABLE "payment_orders" ADD FOREIGN KEY ("customer_id") REFERENCES "customers" ("id");

ALTER TABLE "payment_transactions" ADD FOREIGN KEY ("payment_order_id") REFERENCES "payment_orders" ("id");

ALTER TABLE "refunds" ADD FOREIGN KEY ("payment_transaction_id") REFERENCES "payment_transactions" ("id");

ALTER TABLE "refunds" ADD FOREIGN KEY ("booking_id") REFERENCES "bookings" ("id");

ALTER TABLE "refunds" ADD FOREIGN KEY ("initiated_by") REFERENCES "users" ("id");

ALTER TABLE "wallet_accounts" ADD FOREIGN KEY ("customer_id") REFERENCES "customers" ("id");

ALTER TABLE "wallet_ledger_entries" ADD FOREIGN KEY ("wallet_account_id") REFERENCES "wallet_accounts" ("id");

ALTER TABLE "customer_subscriptions" ADD FOREIGN KEY ("customer_id") REFERENCES "customers" ("id");

ALTER TABLE "customer_subscriptions" ADD FOREIGN KEY ("plan_id") REFERENCES "subscription_plans" ("id");

ALTER TABLE "customer_subscriptions" ADD FOREIGN KEY ("payment_transaction_id") REFERENCES "payment_transactions" ("id");

ALTER TABLE "coupon_campaigns" ADD FOREIGN KEY ("created_by") REFERENCES "admin_users" ("id");

ALTER TABLE "customer_coupons" ADD FOREIGN KEY ("customer_id") REFERENCES "customers" ("id");

ALTER TABLE "customer_coupons" ADD FOREIGN KEY ("campaign_id") REFERENCES "coupon_campaigns" ("id");

ALTER TABLE "customer_coupons" ADD FOREIGN KEY ("used_on_booking_id") REFERENCES "bookings" ("id");

ALTER TABLE "coupon_redemptions" ADD FOREIGN KEY ("campaign_id") REFERENCES "coupon_campaigns" ("id");

ALTER TABLE "coupon_redemptions" ADD FOREIGN KEY ("customer_id") REFERENCES "customers" ("id");

ALTER TABLE "coupon_redemptions" ADD FOREIGN KEY ("booking_id") REFERENCES "bookings" ("id");

ALTER TABLE "referrals" ADD FOREIGN KEY ("referrer_customer_id") REFERENCES "customers" ("id");

ALTER TABLE "referrals" ADD FOREIGN KEY ("referee_customer_id") REFERENCES "customers" ("id");

ALTER TABLE "referrals" ADD FOREIGN KEY ("credited_ledger_id") REFERENCES "wallet_ledger_entries" ("id");

ALTER TABLE "corporate_accounts" ADD FOREIGN KEY ("city_id") REFERENCES "cities" ("id");

ALTER TABLE "payout_batches" ADD FOREIGN KEY ("processed_by") REFERENCES "admin_users" ("id");

ALTER TABLE "maid_payout_lines" ADD FOREIGN KEY ("batch_id") REFERENCES "payout_batches" ("id");

ALTER TABLE "maid_payout_lines" ADD FOREIGN KEY ("maid_id") REFERENCES "maids" ("id");

ALTER TABLE "maid_earnings_ledger" ADD FOREIGN KEY ("maid_id") REFERENCES "maids" ("id");

ALTER TABLE "maid_earnings_ledger" ADD FOREIGN KEY ("booking_id") REFERENCES "bookings" ("id");

ALTER TABLE "maid_earnings_ledger" ADD FOREIGN KEY ("payout_line_id") REFERENCES "maid_payout_lines" ("id");

ALTER TABLE "support_tickets" ADD FOREIGN KEY ("customer_id") REFERENCES "customers" ("id");

ALTER TABLE "support_tickets" ADD FOREIGN KEY ("maid_id") REFERENCES "maids" ("id");

ALTER TABLE "support_tickets" ADD FOREIGN KEY ("booking_id") REFERENCES "bookings" ("id");

ALTER TABLE "support_tickets" ADD FOREIGN KEY ("payment_transaction_id") REFERENCES "payment_transactions" ("id");

ALTER TABLE "support_tickets" ADD FOREIGN KEY ("assigned_agent_id") REFERENCES "admin_users" ("id");

ALTER TABLE "support_messages" ADD FOREIGN KEY ("ticket_id") REFERENCES "support_tickets" ("id");

ALTER TABLE "support_messages" ADD FOREIGN KEY ("sender_user_id") REFERENCES "users" ("id");

ALTER TABLE "support_attachments" ADD FOREIGN KEY ("message_id") REFERENCES "support_messages" ("id");

ALTER TABLE "booking_disputes" ADD FOREIGN KEY ("ticket_id") REFERENCES "support_tickets" ("id");

ALTER TABLE "booking_disputes" ADD FOREIGN KEY ("booking_id") REFERENCES "bookings" ("id");

ALTER TABLE "booking_disputes" ADD FOREIGN KEY ("customer_id") REFERENCES "customers" ("id");

ALTER TABLE "booking_disputes" ADD FOREIGN KEY ("resolved_by") REFERENCES "admin_users" ("id");

ALTER TABLE "device_push_tokens" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");

ALTER TABLE "notifications" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");

ALTER TABLE "admin_role_permissions" ADD FOREIGN KEY ("role_id") REFERENCES "admin_roles" ("id");

ALTER TABLE "admin_role_permissions" ADD FOREIGN KEY ("permission_id") REFERENCES "permissions" ("id");

ALTER TABLE "admin_users" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");

ALTER TABLE "admin_users" ADD FOREIGN KEY ("role_id") REFERENCES "admin_roles" ("id");

ALTER TABLE "admin_users" ADD FOREIGN KEY ("invited_by") REFERENCES "admin_users" ("id");

ALTER TABLE "audit_logs" ADD FOREIGN KEY ("actor_user_id") REFERENCES "users" ("id");

ALTER TABLE "platform_settings" ADD FOREIGN KEY ("updated_by") REFERENCES "admin_users" ("id");

ALTER TABLE "dsar_requests" ADD FOREIGN KEY ("customer_id") REFERENCES "customers" ("id");

ALTER TABLE "dsar_requests" ADD FOREIGN KEY ("handled_by") REFERENCES "admin_users" ("id");

ALTER TABLE "knowledge_base_articles" ADD FOREIGN KEY ("updated_by") REFERENCES "admin_users" ("id");
