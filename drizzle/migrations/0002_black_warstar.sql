CREATE TABLE "holiday_calendars" (
	"id" serial PRIMARY KEY NOT NULL,
	"account_id" integer DEFAULT 0 NOT NULL,
	"domain" varchar(64) DEFAULT '' NOT NULL,
	"name" varchar(128) DEFAULT '' NOT NULL,
	"timezone" varchar(64) DEFAULT 'UTC' NOT NULL,
	"is_active" integer DEFAULT 1 NOT NULL,
	"create_date" timestamp DEFAULT '2000-01-01 00:00:01' NOT NULL,
	"updated_at" timestamp DEFAULT '2000-01-01 00:00:01' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "holiday_entries" (
	"id" serial PRIMARY KEY NOT NULL,
	"account_id" integer DEFAULT 0 NOT NULL,
	"domain" varchar(64) DEFAULT '' NOT NULL,
	"holiday_calendar_id" integer NOT NULL,
	"name" varchar(128) DEFAULT '' NOT NULL,
	"start_date" varchar(10) DEFAULT '' NOT NULL,
	"end_date" varchar(10) DEFAULT '' NOT NULL,
	"is_closed" integer DEFAULT 1 NOT NULL,
	"override_action_type" varchar(32) DEFAULT 'ivr' NOT NULL,
	"override_action_target" varchar(255) DEFAULT '' NOT NULL,
	"is_active" integer DEFAULT 1 NOT NULL,
	"create_date" timestamp DEFAULT '2000-01-01 00:00:01' NOT NULL,
	"updated_at" timestamp DEFAULT '2000-01-01 00:00:01' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inbound_routes" (
	"id" serial PRIMARY KEY NOT NULL,
	"account_id" integer DEFAULT 0 NOT NULL,
	"domain" varchar(64) DEFAULT '' NOT NULL,
	"did" varchar(64) DEFAULT '' NOT NULL,
	"priority" integer DEFAULT 0 NOT NULL,
	"time_condition_id" integer,
	"holiday_calendar_id" integer,
	"routing_policy_id" integer,
	"recording_policy_id" integer,
	"ivr_profile_id" integer,
	"target_type" varchar(32) DEFAULT 'ivr' NOT NULL,
	"target_value" varchar(255) DEFAULT '' NOT NULL,
	"fallback_target_type" varchar(32) DEFAULT 'voicemail' NOT NULL,
	"fallback_target_value" varchar(255) DEFAULT '' NOT NULL,
	"is_emergency" integer DEFAULT 0 NOT NULL,
	"is_active" integer DEFAULT 1 NOT NULL,
	"create_date" timestamp DEFAULT '2000-01-01 00:00:01' NOT NULL,
	"updated_at" timestamp DEFAULT '2000-01-01 00:00:01' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ivr_flows" (
	"id" serial PRIMARY KEY NOT NULL,
	"account_id" integer DEFAULT 0 NOT NULL,
	"domain" varchar(64) DEFAULT '' NOT NULL,
	"ivr_profile_id" integer NOT NULL,
	"from_menu_id" integer NOT NULL,
	"option_id" integer,
	"queue_handoff_id" integer,
	"condition_type" varchar(32) DEFAULT 'always' NOT NULL,
	"action_type" varchar(32) DEFAULT 'hangup' NOT NULL,
	"action_target" varchar(255) DEFAULT '' NOT NULL,
	"fail_action_type" varchar(32) DEFAULT 'hangup' NOT NULL,
	"fail_action_target" varchar(255) DEFAULT '' NOT NULL,
	"priority" integer DEFAULT 0 NOT NULL,
	"is_active" integer DEFAULT 1 NOT NULL,
	"create_date" timestamp DEFAULT '2000-01-01 00:00:01' NOT NULL,
	"updated_at" timestamp DEFAULT '2000-01-01 00:00:01' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ivr_menu_options" (
	"id" serial PRIMARY KEY NOT NULL,
	"account_id" integer DEFAULT 0 NOT NULL,
	"domain" varchar(64) DEFAULT '' NOT NULL,
	"ivr_menu_id" integer NOT NULL,
	"input_type" varchar(16) DEFAULT 'dtmf' NOT NULL,
	"digit" varchar(8) DEFAULT '' NOT NULL,
	"speech_pattern" varchar(128) DEFAULT '' NOT NULL,
	"action_type" varchar(32) DEFAULT 'hangup' NOT NULL,
	"action_target" varchar(255) DEFAULT '' NOT NULL,
	"priority" integer DEFAULT 0 NOT NULL,
	"is_default" integer DEFAULT 0 NOT NULL,
	"is_active" integer DEFAULT 1 NOT NULL,
	"create_date" timestamp DEFAULT '2000-01-01 00:00:01' NOT NULL,
	"updated_at" timestamp DEFAULT '2000-01-01 00:00:01' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ivr_menus" (
	"id" serial PRIMARY KEY NOT NULL,
	"account_id" integer DEFAULT 0 NOT NULL,
	"domain" varchar(64) DEFAULT '' NOT NULL,
	"ivr_profile_id" integer NOT NULL,
	"ivr_version_id" integer,
	"name" varchar(128) DEFAULT '' NOT NULL,
	"is_root" integer DEFAULT 0 NOT NULL,
	"max_retries" integer DEFAULT 3 NOT NULL,
	"timeout_ms" integer DEFAULT 5000 NOT NULL,
	"timeout_prompt_id" integer,
	"invalid_prompt_id" integer,
	"fallback_action_type" varchar(32) DEFAULT 'hangup' NOT NULL,
	"fallback_action_target" varchar(255) DEFAULT '' NOT NULL,
	"is_active" integer DEFAULT 1 NOT NULL,
	"create_date" timestamp DEFAULT '2000-01-01 00:00:01' NOT NULL,
	"updated_at" timestamp DEFAULT '2000-01-01 00:00:01' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ivr_profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"account_id" integer DEFAULT 0 NOT NULL,
	"domain" varchar(64) DEFAULT '' NOT NULL,
	"name" varchar(128) DEFAULT '' NOT NULL,
	"active_version_id" integer,
	"description" varchar(255) DEFAULT '' NOT NULL,
	"default_language" varchar(16) DEFAULT 'en-US' NOT NULL,
	"timezone" varchar(64) DEFAULT 'UTC' NOT NULL,
	"is_active" integer DEFAULT 1 NOT NULL,
	"create_date" timestamp DEFAULT '2000-01-01 00:00:01' NOT NULL,
	"updated_at" timestamp DEFAULT '2000-01-01 00:00:01' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ivr_prompts" (
	"id" serial PRIMARY KEY NOT NULL,
	"account_id" integer DEFAULT 0 NOT NULL,
	"domain" varchar(64) DEFAULT '' NOT NULL,
	"ivr_profile_id" integer NOT NULL,
	"prompt_key" varchar(128) DEFAULT '' NOT NULL,
	"prompt_type" varchar(16) DEFAULT 'tts' NOT NULL,
	"language" varchar(16) DEFAULT 'en-US' NOT NULL,
	"voice" varchar(64) DEFAULT '' NOT NULL,
	"text_body" text,
	"media_uri" varchar(255) DEFAULT '' NOT NULL,
	"checksum" varchar(64) DEFAULT '' NOT NULL,
	"is_active" integer DEFAULT 1 NOT NULL,
	"create_date" timestamp DEFAULT '2000-01-01 00:00:01' NOT NULL,
	"updated_at" timestamp DEFAULT '2000-01-01 00:00:01' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ivr_test_calls" (
	"id" serial PRIMARY KEY NOT NULL,
	"account_id" integer DEFAULT 0 NOT NULL,
	"domain" varchar(64) DEFAULT '' NOT NULL,
	"name" varchar(128) DEFAULT '' NOT NULL,
	"entry_did" varchar(64) DEFAULT '' NOT NULL,
	"test_input" varchar(255) DEFAULT '' NOT NULL,
	"expected_target_type" varchar(32) DEFAULT '' NOT NULL,
	"expected_target_value" varchar(255) DEFAULT '' NOT NULL,
	"last_run_at" timestamp DEFAULT NULL,
	"last_result" varchar(32) DEFAULT '' NOT NULL,
	"is_active" integer DEFAULT 1 NOT NULL,
	"create_date" timestamp DEFAULT '2000-01-01 00:00:01' NOT NULL,
	"updated_at" timestamp DEFAULT '2000-01-01 00:00:01' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ivr_versions" (
	"id" serial PRIMARY KEY NOT NULL,
	"account_id" integer DEFAULT 0 NOT NULL,
	"domain" varchar(64) DEFAULT '' NOT NULL,
	"ivr_profile_id" integer NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"status" varchar(16) DEFAULT 'draft' NOT NULL,
	"definition_hash" varchar(64) DEFAULT '' NOT NULL,
	"notes" text,
	"is_active" integer DEFAULT 0 NOT NULL,
	"published_at" timestamp DEFAULT NULL,
	"create_date" timestamp DEFAULT '2000-01-01 00:00:01' NOT NULL,
	"updated_at" timestamp DEFAULT '2000-01-01 00:00:01' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "queue_handoffs" (
	"id" serial PRIMARY KEY NOT NULL,
	"account_id" integer DEFAULT 0 NOT NULL,
	"domain" varchar(64) DEFAULT '' NOT NULL,
	"name" varchar(128) DEFAULT '' NOT NULL,
	"queue_id" varchar(64) DEFAULT '' NOT NULL,
	"strategy" varchar(32) DEFAULT 'ring-all' NOT NULL,
	"priority" integer DEFAULT 0 NOT NULL,
	"skill_tag" varchar(64) DEFAULT '' NOT NULL,
	"max_wait_seconds" integer DEFAULT 60 NOT NULL,
	"overflow_action_type" varchar(32) DEFAULT 'voicemail' NOT NULL,
	"overflow_action_target" varchar(255) DEFAULT '' NOT NULL,
	"is_active" integer DEFAULT 1 NOT NULL,
	"create_date" timestamp DEFAULT '2000-01-01 00:00:01' NOT NULL,
	"updated_at" timestamp DEFAULT '2000-01-01 00:00:01' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "recording_policies" (
	"id" serial PRIMARY KEY NOT NULL,
	"account_id" integer DEFAULT 0 NOT NULL,
	"domain" varchar(64) DEFAULT '' NOT NULL,
	"name" varchar(128) DEFAULT '' NOT NULL,
	"scope_type" varchar(32) DEFAULT 'tenant' NOT NULL,
	"scope_value" varchar(128) DEFAULT '' NOT NULL,
	"record_inbound" integer DEFAULT 1 NOT NULL,
	"record_outbound" integer DEFAULT 1 NOT NULL,
	"record_internal" integer DEFAULT 0 NOT NULL,
	"file_format" varchar(16) DEFAULT 'wav' NOT NULL,
	"max_duration_seconds" integer DEFAULT 0 NOT NULL,
	"retention_days" integer DEFAULT 30 NOT NULL,
	"pause_digits" varchar(16) DEFAULT '' NOT NULL,
	"resume_digits" varchar(16) DEFAULT '' NOT NULL,
	"is_active" integer DEFAULT 1 NOT NULL,
	"create_date" timestamp DEFAULT '2000-01-01 00:00:01' NOT NULL,
	"updated_at" timestamp DEFAULT '2000-01-01 00:00:01' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "routing_policies" (
	"id" serial PRIMARY KEY NOT NULL,
	"account_id" integer DEFAULT 0 NOT NULL,
	"domain" varchar(64) DEFAULT '' NOT NULL,
	"name" varchar(128) DEFAULT '' NOT NULL,
	"max_attempts" integer DEFAULT 3 NOT NULL,
	"retry_delay_ms" integer DEFAULT 250 NOT NULL,
	"sip_4xx_action" varchar(32) DEFAULT 'next-target' NOT NULL,
	"sip_5xx_action" varchar(32) DEFAULT 'next-target' NOT NULL,
	"sip_6xx_action" varchar(32) DEFAULT 'stop' NOT NULL,
	"failover_action_type" varchar(32) DEFAULT 'voicemail' NOT NULL,
	"failover_action_target" varchar(255) DEFAULT '' NOT NULL,
	"is_active" integer DEFAULT 1 NOT NULL,
	"create_date" timestamp DEFAULT '2000-01-01 00:00:01' NOT NULL,
	"updated_at" timestamp DEFAULT '2000-01-01 00:00:01' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tenant_audit_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"account_id" integer DEFAULT 0 NOT NULL,
	"domain" varchar(64) DEFAULT '' NOT NULL,
	"entity_type" varchar(64) DEFAULT '' NOT NULL,
	"entity_id" integer DEFAULT 0 NOT NULL,
	"action" varchar(32) DEFAULT '' NOT NULL,
	"actor" varchar(128) DEFAULT '' NOT NULL,
	"request_id" varchar(128) DEFAULT '' NOT NULL,
	"before_payload" text,
	"after_payload" text,
	"create_date" timestamp DEFAULT '2000-01-01 00:00:01' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "time_condition_rules" (
	"id" serial PRIMARY KEY NOT NULL,
	"account_id" integer DEFAULT 0 NOT NULL,
	"domain" varchar(64) DEFAULT '' NOT NULL,
	"time_condition_id" integer NOT NULL,
	"day_of_week" smallint,
	"start_time" varchar(8) DEFAULT NULL,
	"end_time" varchar(8) DEFAULT NULL,
	"start_date" varchar(10) DEFAULT NULL,
	"end_date" varchar(10) DEFAULT NULL,
	"match_type" varchar(16) DEFAULT 'include' NOT NULL,
	"priority" integer DEFAULT 0 NOT NULL,
	"is_active" integer DEFAULT 1 NOT NULL,
	"create_date" timestamp DEFAULT '2000-01-01 00:00:01' NOT NULL,
	"updated_at" timestamp DEFAULT '2000-01-01 00:00:01' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "time_conditions" (
	"id" serial PRIMARY KEY NOT NULL,
	"account_id" integer DEFAULT 0 NOT NULL,
	"domain" varchar(64) DEFAULT '' NOT NULL,
	"name" varchar(128) DEFAULT '' NOT NULL,
	"timezone" varchar(64) DEFAULT 'UTC' NOT NULL,
	"match_action_type" varchar(32) DEFAULT 'allow' NOT NULL,
	"no_match_action_type" varchar(32) DEFAULT 'deny' NOT NULL,
	"no_match_action_target" varchar(255) DEFAULT '' NOT NULL,
	"is_active" integer DEFAULT 1 NOT NULL,
	"create_date" timestamp DEFAULT '2000-01-01 00:00:01' NOT NULL,
	"updated_at" timestamp DEFAULT '2000-01-01 00:00:01' NOT NULL
);
--> statement-breakpoint
ALTER TABLE "holiday_calendars" ADD CONSTRAINT "holiday_calendars_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "holiday_entries" ADD CONSTRAINT "holiday_entries_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "holiday_entries" ADD CONSTRAINT "holiday_entries_holiday_calendar_id_fkey" FOREIGN KEY ("holiday_calendar_id") REFERENCES "public"."holiday_calendars"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inbound_routes" ADD CONSTRAINT "inbound_routes_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inbound_routes" ADD CONSTRAINT "inbound_routes_time_condition_id_fkey" FOREIGN KEY ("time_condition_id") REFERENCES "public"."time_conditions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inbound_routes" ADD CONSTRAINT "inbound_routes_holiday_calendar_id_fkey" FOREIGN KEY ("holiday_calendar_id") REFERENCES "public"."holiday_calendars"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inbound_routes" ADD CONSTRAINT "inbound_routes_routing_policy_id_fkey" FOREIGN KEY ("routing_policy_id") REFERENCES "public"."routing_policies"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inbound_routes" ADD CONSTRAINT "inbound_routes_recording_policy_id_fkey" FOREIGN KEY ("recording_policy_id") REFERENCES "public"."recording_policies"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inbound_routes" ADD CONSTRAINT "inbound_routes_ivr_profile_id_fkey" FOREIGN KEY ("ivr_profile_id") REFERENCES "public"."ivr_profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ivr_flows" ADD CONSTRAINT "ivr_flows_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ivr_flows" ADD CONSTRAINT "ivr_flows_ivr_profile_id_fkey" FOREIGN KEY ("ivr_profile_id") REFERENCES "public"."ivr_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ivr_flows" ADD CONSTRAINT "ivr_flows_from_menu_id_fkey" FOREIGN KEY ("from_menu_id") REFERENCES "public"."ivr_menus"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ivr_flows" ADD CONSTRAINT "ivr_flows_option_id_fkey" FOREIGN KEY ("option_id") REFERENCES "public"."ivr_menu_options"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ivr_flows" ADD CONSTRAINT "ivr_flows_queue_handoff_id_fkey" FOREIGN KEY ("queue_handoff_id") REFERENCES "public"."queue_handoffs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ivr_menu_options" ADD CONSTRAINT "ivr_menu_options_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ivr_menu_options" ADD CONSTRAINT "ivr_menu_options_ivr_menu_id_fkey" FOREIGN KEY ("ivr_menu_id") REFERENCES "public"."ivr_menus"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ivr_menus" ADD CONSTRAINT "ivr_menus_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ivr_menus" ADD CONSTRAINT "ivr_menus_ivr_profile_id_fkey" FOREIGN KEY ("ivr_profile_id") REFERENCES "public"."ivr_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ivr_menus" ADD CONSTRAINT "ivr_menus_ivr_version_id_fkey" FOREIGN KEY ("ivr_version_id") REFERENCES "public"."ivr_versions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ivr_menus" ADD CONSTRAINT "ivr_menus_timeout_prompt_id_fkey" FOREIGN KEY ("timeout_prompt_id") REFERENCES "public"."ivr_prompts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ivr_menus" ADD CONSTRAINT "ivr_menus_invalid_prompt_id_fkey" FOREIGN KEY ("invalid_prompt_id") REFERENCES "public"."ivr_prompts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ivr_profiles" ADD CONSTRAINT "ivr_profiles_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ivr_prompts" ADD CONSTRAINT "ivr_prompts_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ivr_prompts" ADD CONSTRAINT "ivr_prompts_ivr_profile_id_fkey" FOREIGN KEY ("ivr_profile_id") REFERENCES "public"."ivr_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ivr_test_calls" ADD CONSTRAINT "ivr_test_calls_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ivr_versions" ADD CONSTRAINT "ivr_versions_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ivr_versions" ADD CONSTRAINT "ivr_versions_ivr_profile_id_fkey" FOREIGN KEY ("ivr_profile_id") REFERENCES "public"."ivr_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "queue_handoffs" ADD CONSTRAINT "queue_handoffs_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recording_policies" ADD CONSTRAINT "recording_policies_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "routing_policies" ADD CONSTRAINT "routing_policies_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tenant_audit_log" ADD CONSTRAINT "tenant_audit_log_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "time_condition_rules" ADD CONSTRAINT "time_condition_rules_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "time_condition_rules" ADD CONSTRAINT "time_condition_rules_time_condition_id_fkey" FOREIGN KEY ("time_condition_id") REFERENCES "public"."time_conditions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "time_conditions" ADD CONSTRAINT "time_conditions_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "holiday_calendars_account_domain_name_idx" ON "holiday_calendars" USING btree ("account_id" int4_ops,"domain" text_ops,"name" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "holiday_calendars_account_domain_name_unq" ON "holiday_calendars" USING btree ("account_id","domain","name");--> statement-breakpoint
CREATE INDEX "holiday_entries_calendar_start_end_idx" ON "holiday_entries" USING btree ("holiday_calendar_id" int4_ops,"start_date" text_ops,"end_date" text_ops);--> statement-breakpoint
CREATE INDEX "inbound_routes_account_domain_did_idx" ON "inbound_routes" USING btree ("account_id" int4_ops,"domain" text_ops,"did" text_ops);--> statement-breakpoint
CREATE INDEX "inbound_routes_priority_idx" ON "inbound_routes" USING btree ("account_id" int4_ops,"priority" int4_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "inbound_routes_account_domain_did_priority_unq" ON "inbound_routes" USING btree ("account_id","domain","did","priority");--> statement-breakpoint
CREATE INDEX "ivr_flows_profile_menu_priority_idx" ON "ivr_flows" USING btree ("ivr_profile_id" int4_ops,"from_menu_id" int4_ops,"priority" int4_ops);--> statement-breakpoint
CREATE INDEX "ivr_menu_options_menu_digit_idx" ON "ivr_menu_options" USING btree ("ivr_menu_id" int4_ops,"digit" text_ops);--> statement-breakpoint
CREATE INDEX "ivr_menu_options_menu_priority_idx" ON "ivr_menu_options" USING btree ("ivr_menu_id" int4_ops,"priority" int4_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "ivr_menu_options_menu_digit_unq" ON "ivr_menu_options" USING btree ("ivr_menu_id","digit");--> statement-breakpoint
CREATE INDEX "ivr_menus_account_profile_name_idx" ON "ivr_menus" USING btree ("account_id" int4_ops,"ivr_profile_id" int4_ops,"name" text_ops);--> statement-breakpoint
CREATE INDEX "ivr_menus_profile_root_idx" ON "ivr_menus" USING btree ("ivr_profile_id" int4_ops,"is_root" int4_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "ivr_menus_profile_name_unq" ON "ivr_menus" USING btree ("ivr_profile_id","name");--> statement-breakpoint
CREATE INDEX "ivr_profiles_account_domain_name_idx" ON "ivr_profiles" USING btree ("account_id" int4_ops,"domain" text_ops,"name" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "ivr_profiles_account_domain_name_unq" ON "ivr_profiles" USING btree ("account_id","domain","name");--> statement-breakpoint
CREATE INDEX "ivr_prompts_account_profile_key_idx" ON "ivr_prompts" USING btree ("account_id" int4_ops,"ivr_profile_id" int4_ops,"prompt_key" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "ivr_prompts_profile_key_language_unq" ON "ivr_prompts" USING btree ("ivr_profile_id","prompt_key","language");--> statement-breakpoint
CREATE INDEX "ivr_test_calls_account_domain_name_idx" ON "ivr_test_calls" USING btree ("account_id" int4_ops,"domain" text_ops,"name" text_ops);--> statement-breakpoint
CREATE INDEX "ivr_versions_account_profile_version_idx" ON "ivr_versions" USING btree ("account_id" int4_ops,"ivr_profile_id" int4_ops,"version" int4_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "ivr_versions_profile_version_unq" ON "ivr_versions" USING btree ("ivr_profile_id","version");--> statement-breakpoint
CREATE INDEX "queue_handoffs_account_domain_name_idx" ON "queue_handoffs" USING btree ("account_id" int4_ops,"domain" text_ops,"name" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "queue_handoffs_account_domain_name_unq" ON "queue_handoffs" USING btree ("account_id","domain","name");--> statement-breakpoint
CREATE INDEX "recording_policies_account_domain_scope_idx" ON "recording_policies" USING btree ("account_id" int4_ops,"domain" text_ops,"scope_type" text_ops,"scope_value" text_ops);--> statement-breakpoint
CREATE INDEX "routing_policies_account_domain_name_idx" ON "routing_policies" USING btree ("account_id" int4_ops,"domain" text_ops,"name" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "routing_policies_account_domain_name_unq" ON "routing_policies" USING btree ("account_id","domain","name");--> statement-breakpoint
CREATE INDEX "tenant_audit_log_account_entity_idx" ON "tenant_audit_log" USING btree ("account_id" int4_ops,"entity_type" text_ops,"entity_id" int4_ops);--> statement-breakpoint
CREATE INDEX "time_condition_rules_condition_priority_idx" ON "time_condition_rules" USING btree ("time_condition_id" int4_ops,"priority" int4_ops);--> statement-breakpoint
CREATE INDEX "time_conditions_account_domain_name_idx" ON "time_conditions" USING btree ("account_id" int4_ops,"domain" text_ops,"name" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "time_conditions_account_domain_name_unq" ON "time_conditions" USING btree ("account_id","domain","name");