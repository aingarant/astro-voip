CREATE TABLE "acc" (
	"id" serial NOT NULL,
	"method" varchar(16) DEFAULT '' NOT NULL,
	"from_tag" varchar(128) DEFAULT '' NOT NULL,
	"to_tag" varchar(128) DEFAULT '' NOT NULL,
	"callid" varchar(255) DEFAULT '' NOT NULL,
	"sip_code" varchar(3) DEFAULT '' NOT NULL,
	"sip_reason" varchar(128) DEFAULT '' NOT NULL,
	"time" timestamp NOT NULL,
	"src_user" varchar(64) DEFAULT '' NOT NULL,
	"src_domain" varchar(128) DEFAULT '' NOT NULL,
	"src_ip" varchar(64) DEFAULT '' NOT NULL,
	"dst_ouser" varchar(64) DEFAULT '' NOT NULL,
	"dst_user" varchar(64) DEFAULT '' NOT NULL,
	"dst_domain" varchar(128) DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "acc_cdrs" (
	"id" serial NOT NULL,
	"start_time" timestamp DEFAULT '2000-01-01 00:00:00' NOT NULL,
	"end_time" timestamp DEFAULT '2000-01-01 00:00:00' NOT NULL,
	"duration" real DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "accounts" (
	"id" serial NOT NULL,
	"ext_account_id" varchar(64) DEFAULT '' NOT NULL,
	"domain" varchar(64) DEFAULT '' NOT NULL,
	"is_active" integer DEFAULT 1 NOT NULL,
	"create_date" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "address" (
	"id" serial NOT NULL,
	"grp" integer DEFAULT 1 NOT NULL,
	"ip_addr" varchar(50) NOT NULL,
	"mask" integer DEFAULT 32 NOT NULL,
	"port" smallint DEFAULT 0 NOT NULL,
	"tag" varchar(64)
);
--> statement-breakpoint
CREATE TABLE "aliases" (
	"id" serial NOT NULL,
	"ruid" varchar(64) DEFAULT '' NOT NULL,
	"username" varchar(64) DEFAULT '' NOT NULL,
	"domain" varchar(64) DEFAULT NULL,
	"contact" varchar(255) DEFAULT '' NOT NULL,
	"received" varchar(255) DEFAULT NULL,
	"path" varchar(512) DEFAULT NULL,
	"expires" timestamp DEFAULT '2030-05-28 21:32:15' NOT NULL,
	"q" real DEFAULT 1 NOT NULL,
	"callid" varchar(255) DEFAULT 'Default-Call-ID' NOT NULL,
	"cseq" integer DEFAULT 1 NOT NULL,
	"last_modified" timestamp DEFAULT '2000-01-01 00:00:01' NOT NULL,
	"flags" integer DEFAULT 0 NOT NULL,
	"cflags" integer DEFAULT 0 NOT NULL,
	"user_agent" varchar(255) DEFAULT '' NOT NULL,
	"socket" varchar(64) DEFAULT NULL,
	"methods" integer,
	"instance" varchar(255) DEFAULT NULL,
	"reg_id" integer DEFAULT 0 NOT NULL,
	"server_id" integer DEFAULT 0 NOT NULL,
	"connection_id" integer DEFAULT 0 NOT NULL,
	"keepalive" integer DEFAULT 0 NOT NULL,
	"partition" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dbaliases" (
	"id" serial NOT NULL,
	"alias_username" varchar(64) DEFAULT '' NOT NULL,
	"alias_domain" varchar(64) DEFAULT '' NOT NULL,
	"username" varchar(64) DEFAULT '' NOT NULL,
	"domain" varchar(64) DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dialog" (
	"id" serial NOT NULL,
	"hash_entry" integer NOT NULL,
	"hash_id" integer NOT NULL,
	"callid" varchar(255) NOT NULL,
	"from_uri" varchar(255) NOT NULL,
	"from_tag" varchar(128) NOT NULL,
	"to_uri" varchar(255) NOT NULL,
	"to_tag" varchar(128) NOT NULL,
	"caller_cseq" varchar(20) NOT NULL,
	"callee_cseq" varchar(20) NOT NULL,
	"caller_route_set" varchar(512),
	"callee_route_set" varchar(512),
	"caller_contact" varchar(255) NOT NULL,
	"callee_contact" varchar(255) NOT NULL,
	"caller_sock" varchar(64) NOT NULL,
	"callee_sock" varchar(64) NOT NULL,
	"state" integer NOT NULL,
	"start_time" integer NOT NULL,
	"timeout" integer DEFAULT 0 NOT NULL,
	"sflags" integer DEFAULT 0 NOT NULL,
	"iflags" integer DEFAULT 0 NOT NULL,
	"toroute_name" varchar(32),
	"req_uri" varchar(255) NOT NULL,
	"xdata" varchar(512)
);
--> statement-breakpoint
CREATE TABLE "dialog_vars" (
	"id" serial NOT NULL,
	"hash_entry" integer NOT NULL,
	"hash_id" integer NOT NULL,
	"dialog_key" varchar(128) NOT NULL,
	"dialog_value" varchar(512) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dialplan" (
	"id" serial NOT NULL,
	"dpid" integer NOT NULL,
	"pr" integer NOT NULL,
	"match_op" integer NOT NULL,
	"match_exp" varchar(64) NOT NULL,
	"match_len" integer NOT NULL,
	"subst_exp" varchar(64) NOT NULL,
	"repl_exp" varchar(256) NOT NULL,
	"attrs" varchar(64) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dids" (
	"id" serial NOT NULL,
	"did" varchar(64) DEFAULT '' NOT NULL,
	"account_id" integer DEFAULT 0 NOT NULL,
	"domain" varchar(64) DEFAULT '' NOT NULL,
	"is_active" integer DEFAULT 1 NOT NULL,
	"create_date" timestamp DEFAULT '2000-01-01 00:00:01' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dispatcher" (
	"id" serial NOT NULL,
	"setid" integer DEFAULT 0 NOT NULL,
	"destination" varchar(192) DEFAULT '' NOT NULL,
	"flags" integer DEFAULT 0 NOT NULL,
	"priority" integer DEFAULT 0 NOT NULL,
	"attrs" varchar(128) DEFAULT '' NOT NULL,
	"description" varchar(64) DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "domain" (
	"id" serial NOT NULL,
	"domain" varchar(64) NOT NULL,
	"did" varchar(64) DEFAULT NULL,
	"last_modified" timestamp DEFAULT '2000-01-01 00:00:01' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "domain_attrs" (
	"id" serial NOT NULL,
	"did" varchar(64) NOT NULL,
	"name" varchar(32) NOT NULL,
	"type" integer NOT NULL,
	"value" varchar(255) NOT NULL,
	"last_modified" timestamp DEFAULT '2000-01-01 00:00:01' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "extensions" (
	"id" serial NOT NULL,
	"account_id" integer DEFAULT 0 NOT NULL,
	"extension_id" varchar(64) DEFAULT '' NOT NULL,
	"domain" varchar(64) DEFAULT '' NOT NULL,
	"is_active" integer DEFAULT 1 NOT NULL,
	"voicemail_enabled" integer DEFAULT 0 NOT NULL,
	"voicemail_id" integer,
	"create_date" timestamp DEFAULT '2000-01-01 00:00:01' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "grp" (
	"id" serial NOT NULL,
	"username" varchar(64) DEFAULT '' NOT NULL,
	"domain" varchar(64) DEFAULT '' NOT NULL,
	"grp" varchar(64) DEFAULT '' NOT NULL,
	"last_modified" timestamp DEFAULT '2000-01-01 00:00:01' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lcr_gw" (
	"id" serial NOT NULL,
	"lcr_id" smallint NOT NULL,
	"gw_name" varchar(128),
	"ip_addr" varchar(50),
	"hostname" varchar(64),
	"port" smallint,
	"params" varchar(64),
	"uri_scheme" smallint,
	"transport" smallint,
	"strip" smallint,
	"prefix" varchar(16) DEFAULT NULL,
	"tag" varchar(64) DEFAULT NULL,
	"flags" integer DEFAULT 0 NOT NULL,
	"defunct" integer
);
--> statement-breakpoint
CREATE TABLE "lcr_rule" (
	"id" serial NOT NULL,
	"lcr_id" smallint NOT NULL,
	"prefix" varchar(16) DEFAULT NULL,
	"from_uri" varchar(64) DEFAULT NULL,
	"request_uri" varchar(64) DEFAULT NULL,
	"mt_tvalue" varchar(128) DEFAULT NULL,
	"stopper" integer DEFAULT 0 NOT NULL,
	"enabled" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lcr_rule_target" (
	"id" serial NOT NULL,
	"lcr_id" smallint NOT NULL,
	"rule_id" integer NOT NULL,
	"gw_id" integer NOT NULL,
	"priority" smallint NOT NULL,
	"weight" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "location" (
	"id" serial NOT NULL,
	"ruid" varchar(64) DEFAULT '' NOT NULL,
	"username" varchar(64) DEFAULT '' NOT NULL,
	"domain" varchar(64) DEFAULT NULL,
	"contact" varchar(512) DEFAULT '' NOT NULL,
	"received" varchar(128) DEFAULT NULL,
	"path" varchar(512) DEFAULT NULL,
	"expires" timestamp DEFAULT '2030-05-28 21:32:15' NOT NULL,
	"q" real DEFAULT 1 NOT NULL,
	"callid" varchar(255) DEFAULT 'Default-Call-ID' NOT NULL,
	"cseq" integer DEFAULT 1 NOT NULL,
	"last_modified" timestamp DEFAULT '2000-01-01 00:00:01' NOT NULL,
	"flags" integer DEFAULT 0 NOT NULL,
	"cflags" integer DEFAULT 0 NOT NULL,
	"user_agent" varchar(255) DEFAULT '' NOT NULL,
	"socket" varchar(64) DEFAULT NULL,
	"methods" integer,
	"instance" varchar(255) DEFAULT NULL,
	"reg_id" integer DEFAULT 0 NOT NULL,
	"server_id" integer DEFAULT 0 NOT NULL,
	"connection_id" integer DEFAULT 0 NOT NULL,
	"keepalive" integer DEFAULT 0 NOT NULL,
	"partition" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "location_attrs" (
	"id" serial NOT NULL,
	"ruid" varchar(64) DEFAULT '' NOT NULL,
	"username" varchar(64) DEFAULT '' NOT NULL,
	"domain" varchar(64) DEFAULT NULL,
	"aname" varchar(64) DEFAULT '' NOT NULL,
	"atype" integer DEFAULT 0 NOT NULL,
	"avalue" varchar(512) DEFAULT '' NOT NULL,
	"last_modified" timestamp DEFAULT '2000-01-01 00:00:01' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "missed_calls" (
	"id" serial NOT NULL,
	"method" varchar(16) DEFAULT '' NOT NULL,
	"from_tag" varchar(128) DEFAULT '' NOT NULL,
	"to_tag" varchar(128) DEFAULT '' NOT NULL,
	"callid" varchar(255) DEFAULT '' NOT NULL,
	"sip_code" varchar(3) DEFAULT '' NOT NULL,
	"sip_reason" varchar(128) DEFAULT '' NOT NULL,
	"time" timestamp NOT NULL,
	"src_user" varchar(64) DEFAULT '' NOT NULL,
	"src_domain" varchar(128) DEFAULT '' NOT NULL,
	"src_ip" varchar(64) DEFAULT '' NOT NULL,
	"dst_ouser" varchar(64) DEFAULT '' NOT NULL,
	"dst_user" varchar(64) DEFAULT '' NOT NULL,
	"dst_domain" varchar(128) DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pdt" (
	"id" serial NOT NULL,
	"sdomain" varchar(255) NOT NULL,
	"prefix" varchar(32) NOT NULL,
	"domain" varchar(255) DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "re_grp" (
	"id" serial NOT NULL,
	"reg_exp" varchar(128) DEFAULT '' NOT NULL,
	"group_id" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "silo" (
	"id" serial NOT NULL,
	"src_addr" varchar(255) DEFAULT '' NOT NULL,
	"dst_addr" varchar(255) DEFAULT '' NOT NULL,
	"username" varchar(64) DEFAULT '' NOT NULL,
	"domain" varchar(64) DEFAULT '' NOT NULL,
	"inc_time" integer DEFAULT 0 NOT NULL,
	"exp_time" integer DEFAULT 0 NOT NULL,
	"snd_time" integer DEFAULT 0 NOT NULL,
	"ctype" varchar(32) DEFAULT 'text/plain' NOT NULL,
	"body" text,
	"extra_hdrs" text,
	"callid" varchar(128) DEFAULT '' NOT NULL,
	"status" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscriber" (
	"id" serial NOT NULL,
	"account_id" integer DEFAULT 0 NOT NULL,
	"extension_id" varchar(64),
	"default_did" varchar(64),
	"username" varchar(64) DEFAULT '' NOT NULL,
	"domain" varchar(64) DEFAULT '' NOT NULL,
	"password" varchar(64) DEFAULT '' NOT NULL,
	"ha1" varchar(128) DEFAULT '' NOT NULL,
	"ha1b" varchar(128) DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trusted" (
	"id" serial NOT NULL,
	"src_ip" varchar(50) NOT NULL,
	"proto" varchar(4) NOT NULL,
	"from_pattern" varchar(64) DEFAULT NULL,
	"ruri_pattern" varchar(64) DEFAULT NULL,
	"tag" varchar(64),
	"priority" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "usr_preferences" (
	"id" serial NOT NULL,
	"uuid" varchar(64) DEFAULT '' NOT NULL,
	"username" varchar(255) DEFAULT '' NOT NULL,
	"domain" varchar(64) DEFAULT '' NOT NULL,
	"attribute" varchar(32) DEFAULT '' NOT NULL,
	"type" integer DEFAULT 0 NOT NULL,
	"value" varchar(128) DEFAULT '' NOT NULL,
	"last_modified" timestamp DEFAULT '2000-01-01 00:00:01' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "version" (
	"id" serial NOT NULL,
	"table_name" varchar(32) NOT NULL,
	"table_version" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "voicemail_boxes" (
	"id" serial NOT NULL,
	"account_id" integer DEFAULT 0 NOT NULL,
	"domain" varchar(64) DEFAULT '' NOT NULL,
	"voicemail_box_id" varchar(64) DEFAULT '' NOT NULL,
	"password" varchar(64) DEFAULT '' NOT NULL,
	"email" varchar(255) DEFAULT '' NOT NULL,
	"send_email" integer DEFAULT 0 NOT NULL,
	"message_count" integer DEFAULT 0 NOT NULL,
	"message_capacity" integer DEFAULT 1000 NOT NULL,
	"message_size_limit" integer DEFAULT 10240 NOT NULL,
	"create_date" timestamp DEFAULT '2000-01-01 00:00:01' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "voicemail_messages" (
	"id" serial NOT NULL,
	"account_id" integer DEFAULT 0 NOT NULL,
	"voicemail_box_id" integer NOT NULL,
	"domain" varchar(64) DEFAULT '' NOT NULL,
	"caller_id" varchar(255) DEFAULT '' NOT NULL,
	"timestamp" timestamp DEFAULT '2000-01-01 00:00:01' NOT NULL,
	"duration" integer DEFAULT 0 NOT NULL,
	"is_new" integer DEFAULT 1 NOT NULL,
	"file_path" varchar(255) DEFAULT '' NOT NULL
);
--> statement-breakpoint
ALTER TABLE "dids" ADD CONSTRAINT "dids_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "extensions" ADD CONSTRAINT "extensions_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "extensions" ADD CONSTRAINT "extensions_voicemail_id_fkey" FOREIGN KEY ("voicemail_id") REFERENCES "public"."voicemail_boxes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriber" ADD CONSTRAINT "subscriber_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriber" ADD CONSTRAINT "subscriber_default_did_fkey" FOREIGN KEY ("default_did") REFERENCES "public"."dids"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "voicemail_boxes" ADD CONSTRAINT "voicemail_boxes_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "voicemail_messages" ADD CONSTRAINT "voicemail_messages_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "voicemail_messages" ADD CONSTRAINT "voicemail_messages_voicemail_box_id_fkey" FOREIGN KEY ("voicemail_box_id") REFERENCES "public"."voicemail_boxes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "acc_callid_idx" ON "acc" USING btree ("callid" text_ops);--> statement-breakpoint
CREATE INDEX "acc_cdrs_start_time_idx" ON "acc_cdrs" USING btree ("start_time" timestamp_ops);--> statement-breakpoint
CREATE INDEX "accounts_ext_account_id_domain_idx" ON "accounts" USING btree ("ext_account_id" text_ops,"domain" text_ops);--> statement-breakpoint
CREATE INDEX "aliases_account_contact_idx" ON "aliases" USING btree ("username" text_ops,"domain" text_ops,"contact" text_ops);--> statement-breakpoint
CREATE INDEX "aliases_expires_idx" ON "aliases" USING btree ("expires" timestamp_ops);--> statement-breakpoint
CREATE INDEX "dbaliases_alias_idx" ON "dbaliases" USING btree ("alias_username" text_ops,"alias_domain" text_ops);--> statement-breakpoint
CREATE INDEX "dbaliases_alias_user_idx" ON "dbaliases" USING btree ("alias_username" text_ops);--> statement-breakpoint
CREATE INDEX "dbaliases_target_idx" ON "dbaliases" USING btree ("username" text_ops,"domain" text_ops);--> statement-breakpoint
CREATE INDEX "dialog_hash_idx" ON "dialog" USING btree ("hash_entry" int4_ops,"hash_id" int4_ops);--> statement-breakpoint
CREATE INDEX "dialog_vars_hash_idx" ON "dialog_vars" USING btree ("hash_entry" int4_ops,"hash_id" int4_ops);--> statement-breakpoint
CREATE INDEX "domain_attrs_domain_attrs_idx" ON "domain_attrs" USING btree ("did" text_ops,"name" text_ops);--> statement-breakpoint
CREATE INDEX "extensions_extension_id_idx" ON "extensions" USING btree ("extension_id" text_ops);--> statement-breakpoint
CREATE INDEX "lcr_gw_lcr_id_idx" ON "lcr_gw" USING btree ("lcr_id" int2_ops);--> statement-breakpoint
CREATE INDEX "lcr_rule_target_lcr_id_idx" ON "lcr_rule_target" USING btree ("lcr_id" int2_ops);--> statement-breakpoint
CREATE INDEX "location_account_contact_idx" ON "location" USING btree ("username" text_ops,"domain" text_ops,"contact" text_ops);--> statement-breakpoint
CREATE INDEX "location_connection_idx" ON "location" USING btree ("server_id" int4_ops,"connection_id" int4_ops);--> statement-breakpoint
CREATE INDEX "location_expires_idx" ON "location" USING btree ("expires" timestamp_ops);--> statement-breakpoint
CREATE INDEX "location_tcpcon_idx" ON "location" USING btree ("connection_id" int4_ops);--> statement-breakpoint
CREATE INDEX "location_attrs_account_record_idx" ON "location_attrs" USING btree ("username" text_ops,"domain" text_ops,"ruid" text_ops);--> statement-breakpoint
CREATE INDEX "location_attrs_last_modified_idx" ON "location_attrs" USING btree ("last_modified" timestamp_ops);--> statement-breakpoint
CREATE INDEX "missed_calls_callid_idx" ON "missed_calls" USING btree ("callid" text_ops);--> statement-breakpoint
CREATE INDEX "re_grp_group_idx" ON "re_grp" USING btree ("group_id" int4_ops);--> statement-breakpoint
CREATE INDEX "silo_account_idx" ON "silo" USING btree ("username" text_ops,"domain" text_ops);--> statement-breakpoint
CREATE INDEX "subscriber_username_idx" ON "subscriber" USING btree ("username" text_ops);--> statement-breakpoint
CREATE INDEX "trusted_peer_idx" ON "trusted" USING btree ("src_ip" text_ops);--> statement-breakpoint
CREATE INDEX "usr_preferences_ua_idx" ON "usr_preferences" USING btree ("uuid" text_ops,"attribute" text_ops);--> statement-breakpoint
CREATE INDEX "usr_preferences_uda_idx" ON "usr_preferences" USING btree ("username" text_ops,"domain" text_ops,"attribute" text_ops);--> statement-breakpoint
CREATE INDEX "voicemail_boxes_voicemail_box_id_idx" ON "voicemail_boxes" USING btree ("voicemail_box_id" text_ops);--> statement-breakpoint
CREATE INDEX "voicemail_messages_voicemail_box_id_idx" ON "voicemail_messages" USING btree ("voicemail_box_id" int4_ops);