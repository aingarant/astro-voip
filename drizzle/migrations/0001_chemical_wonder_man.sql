ALTER TABLE "subscriber" DROP CONSTRAINT "subscriber_default_did_fkey";
--> statement-breakpoint
ALTER TABLE "acc" ADD PRIMARY KEY ("id");--> statement-breakpoint
ALTER TABLE "acc_cdrs" ADD PRIMARY KEY ("id");--> statement-breakpoint
ALTER TABLE "accounts" ADD PRIMARY KEY ("id");--> statement-breakpoint
ALTER TABLE "address" ADD PRIMARY KEY ("id");--> statement-breakpoint
ALTER TABLE "aliases" ADD PRIMARY KEY ("id");--> statement-breakpoint
ALTER TABLE "dbaliases" ADD PRIMARY KEY ("id");--> statement-breakpoint
ALTER TABLE "dialog" ADD PRIMARY KEY ("id");--> statement-breakpoint
ALTER TABLE "dialog_vars" ADD PRIMARY KEY ("id");--> statement-breakpoint
ALTER TABLE "dialplan" ADD PRIMARY KEY ("id");--> statement-breakpoint
ALTER TABLE "dids" ADD PRIMARY KEY ("id");--> statement-breakpoint
ALTER TABLE "dispatcher" ADD PRIMARY KEY ("id");--> statement-breakpoint
ALTER TABLE "domain" ADD PRIMARY KEY ("id");--> statement-breakpoint
ALTER TABLE "domain_attrs" ADD PRIMARY KEY ("id");--> statement-breakpoint
ALTER TABLE "extensions" ADD PRIMARY KEY ("id");--> statement-breakpoint
ALTER TABLE "grp" ADD PRIMARY KEY ("id");--> statement-breakpoint
ALTER TABLE "lcr_gw" ADD PRIMARY KEY ("id");--> statement-breakpoint
ALTER TABLE "lcr_rule" ADD PRIMARY KEY ("id");--> statement-breakpoint
ALTER TABLE "lcr_rule_target" ADD PRIMARY KEY ("id");--> statement-breakpoint
ALTER TABLE "location" ADD PRIMARY KEY ("id");--> statement-breakpoint
ALTER TABLE "location_attrs" ADD PRIMARY KEY ("id");--> statement-breakpoint
ALTER TABLE "missed_calls" ADD PRIMARY KEY ("id");--> statement-breakpoint
ALTER TABLE "pdt" ADD PRIMARY KEY ("id");--> statement-breakpoint
ALTER TABLE "re_grp" ADD PRIMARY KEY ("id");--> statement-breakpoint
ALTER TABLE "silo" ADD PRIMARY KEY ("id");--> statement-breakpoint
ALTER TABLE "subscriber" ADD PRIMARY KEY ("id");--> statement-breakpoint
ALTER TABLE "trusted" ADD PRIMARY KEY ("id");--> statement-breakpoint
ALTER TABLE "usr_preferences" ADD PRIMARY KEY ("id");--> statement-breakpoint
ALTER TABLE "version" ADD PRIMARY KEY ("id");--> statement-breakpoint
ALTER TABLE "voicemail_boxes" ADD PRIMARY KEY ("id");--> statement-breakpoint
ALTER TABLE "voicemail_messages" ADD PRIMARY KEY ("id");