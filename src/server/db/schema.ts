import { pgTable, serial, varchar, integer, timestamp, foreignKey, index, uniqueIndex, real, smallint, text } from "drizzle-orm/pg-core"
import { relations, sql } from "drizzle-orm"



export const version = pgTable("version", {
	id: serial().primaryKey().notNull(),
	tableName: varchar("table_name", { length: 32 }).notNull(),
	tableVersion: integer("table_version").default(0).notNull(),
});

export const accounts = pgTable("accounts", {
	id: serial().primaryKey().notNull(),
	extAccountId: varchar("ext_account_id", { length: 64 }).default('').notNull(),
	domain: varchar({ length: 64 }).default('').notNull(),
	isActive: integer("is_active").default(1).notNull(),
	createDate: timestamp("create_date").default(sql`CURRENT_TIMESTAMP`).notNull().$onUpdate(() => sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("accounts_ext_account_id_domain_idx").using("btree", table.extAccountId.asc().nullsLast().op("text_ops"), table.domain.asc().nullsLast().op("text_ops")),
]);

export const accountsRelations = relations(accounts, ({ many }) => ({
	dids: many(dids),
	voicemailBoxes: many(voicemailBoxes),
	subscriber: many(subscriber),
	extensions: many(extensions),
	voicemailMessages: many(voicemailMessages),
}));

export const dids = pgTable("dids", {
	id: serial().primaryKey().notNull(),
	did: varchar({ length: 64 }).default('').notNull(),
	accountId: integer("account_id").default(0).notNull(),
	domain: varchar({ length: 64 }).default('').notNull(),
	isActive: integer("is_active").default(1).notNull(),
	createDate: timestamp("create_date", { mode: 'string' }).default('2000-01-01 00:00:01').notNull(),
}, (table) => [
	foreignKey({
		columns: [table.accountId],
		foreignColumns: [accounts.id],
		name: "dids_account_id_fkey"
	}).onDelete("cascade"),
]);

export const voicemailBoxes = pgTable("voicemail_boxes", {
	id: serial().primaryKey().notNull(),
	accountId: integer("account_id").default(0).notNull(),
	domain: varchar({ length: 64 }).default('').notNull(),
	voicemailBoxId: varchar("voicemail_box_id", { length: 64 }).default('').notNull(),
	password: varchar({ length: 64 }).default('').notNull(),
	email: varchar({ length: 255 }).default('').notNull(),
	sendEmail: integer("send_email").default(0).notNull(),
	messageCount: integer("message_count").default(0).notNull(),
	messageCapacity: integer("message_capacity").default(1000).notNull(),
	messageSizeLimit: integer("message_size_limit").default(10240).notNull(),
	createDate: timestamp("create_date", { mode: 'string' }).default('2000-01-01 00:00:01').notNull(),
}, (table) => [
	index("voicemail_boxes_voicemail_box_id_idx").using("btree", table.voicemailBoxId.asc().nullsLast().op("text_ops")),
	foreignKey({
		columns: [table.accountId],
		foreignColumns: [accounts.id],
		name: "voicemail_boxes_account_id_fkey"
	}).onDelete("cascade"),
]);

export const subscriber = pgTable("subscriber", {
	id: serial().primaryKey().notNull(),
	accountId: integer("account_id").default(0).notNull(),
	extensionId: varchar("extension_id", { length: 64 }),
	defaultDid: varchar("default_did", { length: 64 }),
	username: varchar({ length: 64 }).default('').notNull(),
	domain: varchar({ length: 64 }).default('').notNull(),
	password: varchar({ length: 64 }).default('').notNull(),
	ha1: varchar({ length: 128 }).default('').notNull(),
	ha1b: varchar({ length: 128 }).default('').notNull(),
}, (table) => [
	index("subscriber_username_idx").using("btree", table.username.asc().nullsLast().op("text_ops")),
	foreignKey({
		columns: [table.accountId],
		foreignColumns: [accounts.id],
		name: "subscriber_account_id_fkey"
	}).onDelete("cascade"),
]);

export const extensions = pgTable("extensions", {
	id: serial().primaryKey().notNull(),
	accountId: integer("account_id").default(0).notNull(),
	extensionId: varchar("extension_id", { length: 64 }).default('').notNull(),
	domain: varchar({ length: 64 }).default('').notNull(),
	isActive: integer("is_active").default(1).notNull(),
	voicemailEnabled: integer("voicemail_enabled").default(0).notNull(),
	voicemailId: integer("voicemail_id"),
	createDate: timestamp("create_date", { mode: 'string' }).default('2000-01-01 00:00:01').notNull(),
}, (table) => [
	index("extensions_extension_id_idx").using("btree", table.extensionId.asc().nullsLast().op("text_ops")),
	foreignKey({
		columns: [table.accountId],
		foreignColumns: [accounts.id],
		name: "extensions_account_id_fkey"
	}).onDelete("cascade"),
	foreignKey({
		columns: [table.voicemailId],
		foreignColumns: [voicemailBoxes.id],
		name: "extensions_voicemail_id_fkey"
	}).onDelete("set null"),
]);

export const voicemailMessages = pgTable("voicemail_messages", {
	id: serial().primaryKey().notNull(),
	accountId: integer("account_id").default(0).notNull(),
	voicemailBoxId: integer("voicemail_box_id").notNull(),
	domain: varchar({ length: 64 }).default('').notNull(),
	callerId: varchar("caller_id", { length: 255 }).default('').notNull(),
	timestamp: timestamp({ mode: 'string' }).default('2000-01-01 00:00:01').notNull(),
	duration: integer().default(0).notNull(),
	isNew: integer("is_new").default(1).notNull(),
	filePath: varchar("file_path", { length: 255 }).default('').notNull(),
}, (table) => [
	index("voicemail_messages_voicemail_box_id_idx").using("btree", table.voicemailBoxId.asc().nullsLast().op("int4_ops")),
	foreignKey({
		columns: [table.accountId],
		foreignColumns: [accounts.id],
		name: "voicemail_messages_account_id_fkey"
	}).onDelete("cascade"),
	foreignKey({
		columns: [table.voicemailBoxId],
		foreignColumns: [voicemailBoxes.id],
		name: "voicemail_messages_voicemail_box_id_fkey"
	}).onDelete("cascade"),
]);

export const accCdrs = pgTable("acc_cdrs", {
	id: serial().primaryKey().notNull(),
	startTime: timestamp("start_time", { mode: 'string' }).default('2000-01-01 00:00:00').notNull(),
	endTime: timestamp("end_time", { mode: 'string' }).default('2000-01-01 00:00:00').notNull(),
	duration: real().default(0).notNull(),
}, (table) => [
	index("acc_cdrs_start_time_idx").using("btree", table.startTime.asc().nullsLast().op("timestamp_ops")),
]);

export const dbaliases = pgTable("dbaliases", {
	id: serial().primaryKey().notNull(),
	aliasUsername: varchar("alias_username", { length: 64 }).default('').notNull(),
	aliasDomain: varchar("alias_domain", { length: 64 }).default('').notNull(),
	username: varchar({ length: 64 }).default('').notNull(),
	domain: varchar({ length: 64 }).default('').notNull(),
}, (table) => [
	index("dbaliases_alias_idx").using("btree", table.aliasUsername.asc().nullsLast().op("text_ops"), table.aliasDomain.asc().nullsLast().op("text_ops")),
	index("dbaliases_alias_user_idx").using("btree", table.aliasUsername.asc().nullsLast().op("text_ops")),
	index("dbaliases_target_idx").using("btree", table.username.asc().nullsLast().op("text_ops"), table.domain.asc().nullsLast().op("text_ops")),
]);

export const dispatcher = pgTable("dispatcher", {
	id: serial().primaryKey().notNull(),
	setid: integer().default(0).notNull(),
	destination: varchar({ length: 192 }).default('').notNull(),
	flags: integer().default(0).notNull(),
	priority: integer().default(0).notNull(),
	attrs: varchar({ length: 128 }).default('').notNull(),
	description: varchar({ length: 64 }).default('').notNull(),
});

export const dialog = pgTable("dialog", {
	id: serial().primaryKey().notNull(),
	hashEntry: integer("hash_entry").notNull(),
	hashId: integer("hash_id").notNull(),
	callid: varchar({ length: 255 }).notNull(),
	fromUri: varchar("from_uri", { length: 255 }).notNull(),
	fromTag: varchar("from_tag", { length: 128 }).notNull(),
	toUri: varchar("to_uri", { length: 255 }).notNull(),
	toTag: varchar("to_tag", { length: 128 }).notNull(),
	callerCseq: varchar("caller_cseq", { length: 20 }).notNull(),
	calleeCseq: varchar("callee_cseq", { length: 20 }).notNull(),
	callerRouteSet: varchar("caller_route_set", { length: 512 }),
	calleeRouteSet: varchar("callee_route_set", { length: 512 }),
	callerContact: varchar("caller_contact", { length: 255 }).notNull(),
	calleeContact: varchar("callee_contact", { length: 255 }).notNull(),
	callerSock: varchar("caller_sock", { length: 64 }).notNull(),
	calleeSock: varchar("callee_sock", { length: 64 }).notNull(),
	state: integer().notNull(),
	startTime: integer("start_time").notNull(),
	timeout: integer().default(0).notNull(),
	sflags: integer().default(0).notNull(),
	iflags: integer().default(0).notNull(),
	torouteName: varchar("toroute_name", { length: 32 }),
	reqUri: varchar("req_uri", { length: 255 }).notNull(),
	xdata: varchar({ length: 512 }),
}, (table) => [
	index("dialog_hash_idx").using("btree", table.hashEntry.asc().nullsLast().op("int4_ops"), table.hashId.asc().nullsLast().op("int4_ops")),
]);

export const dialogVars = pgTable("dialog_vars", {
	id: serial().primaryKey().notNull(),
	hashEntry: integer("hash_entry").notNull(),
	hashId: integer("hash_id").notNull(),
	dialogKey: varchar("dialog_key", { length: 128 }).notNull(),
	dialogValue: varchar("dialog_value", { length: 512 }).notNull(),
}, (table) => [
	index("dialog_vars_hash_idx").using("btree", table.hashEntry.asc().nullsLast().op("int4_ops"), table.hashId.asc().nullsLast().op("int4_ops")),
]);

export const location = pgTable("location", {
	id: serial().primaryKey().notNull(),
	ruid: varchar({ length: 64 }).default('').notNull(),
	username: varchar({ length: 64 }).default('').notNull(),
	domain: varchar({ length: 64 }).default(sql`NULL`),
	contact: varchar({ length: 512 }).default('').notNull(),
	received: varchar({ length: 128 }).default(sql`NULL`),
	path: varchar({ length: 512 }).default(sql`NULL`),
	expires: timestamp({ mode: 'string' }).default('2030-05-28 21:32:15').notNull(),
	q: real().default(1).notNull(),
	callid: varchar({ length: 255 }).default('Default-Call-ID').notNull(),
	cseq: integer().default(1).notNull(),
	lastModified: timestamp("last_modified", { mode: 'string' }).default('2000-01-01 00:00:01').notNull(),
	flags: integer().default(0).notNull(),
	cflags: integer().default(0).notNull(),
	userAgent: varchar("user_agent", { length: 255 }).default('').notNull(),
	socket: varchar({ length: 64 }).default(sql`NULL`),
	methods: integer(),
	instance: varchar({ length: 255 }).default(sql`NULL`),
	regId: integer("reg_id").default(0).notNull(),
	serverId: integer("server_id").default(0).notNull(),
	connectionId: integer("connection_id").default(0).notNull(),
	keepalive: integer().default(0).notNull(),
	partition: integer().default(0).notNull(),
}, (table) => [
	index("location_account_contact_idx").using("btree", table.username.asc().nullsLast().op("text_ops"), table.domain.asc().nullsLast().op("text_ops"), table.contact.asc().nullsLast().op("text_ops")),
	index("location_connection_idx").using("btree", table.serverId.asc().nullsLast().op("int4_ops"), table.connectionId.asc().nullsLast().op("int4_ops")),
	index("location_expires_idx").using("btree", table.expires.asc().nullsLast().op("timestamp_ops")),
	index("location_tcpcon_idx").using("btree", table.connectionId.asc().nullsLast().op("int4_ops")),
]);

export const locationAttrs = pgTable("location_attrs", {
	id: serial().primaryKey().notNull(),
	ruid: varchar({ length: 64 }).default('').notNull(),
	username: varchar({ length: 64 }).default('').notNull(),
	domain: varchar({ length: 64 }).default(sql`NULL`),
	aname: varchar({ length: 64 }).default('').notNull(),
	atype: integer().default(0).notNull(),
	avalue: varchar({ length: 512 }).default('').notNull(),
	lastModified: timestamp("last_modified", { mode: 'string' }).default('2000-01-01 00:00:01').notNull(),
}, (table) => [
	index("location_attrs_account_record_idx").using("btree", table.username.asc().nullsLast().op("text_ops"), table.domain.asc().nullsLast().op("text_ops"), table.ruid.asc().nullsLast().op("text_ops")),
	index("location_attrs_last_modified_idx").using("btree", table.lastModified.asc().nullsLast().op("timestamp_ops")),
]);

export const lcrGw = pgTable("lcr_gw", {
	id: serial().primaryKey().notNull(),
	lcrId: smallint("lcr_id").notNull(),
	gwName: varchar("gw_name", { length: 128 }),
	ipAddr: varchar("ip_addr", { length: 50 }),
	hostname: varchar({ length: 64 }),
	port: smallint(),
	params: varchar({ length: 64 }),
	uriScheme: smallint("uri_scheme"),
	transport: smallint(),
	strip: smallint(),
	prefix: varchar({ length: 16 }).default(sql`NULL`),
	tag: varchar({ length: 64 }).default(sql`NULL`),
	flags: integer().default(0).notNull(),
	defunct: integer(),
}, (table) => [
	index("lcr_gw_lcr_id_idx").using("btree", table.lcrId.asc().nullsLast().op("int2_ops")),
]);

export const lcrRuleTarget = pgTable("lcr_rule_target", {
	id: serial().primaryKey().notNull(),
	lcrId: smallint("lcr_id").notNull(),
	ruleId: integer("rule_id").notNull(),
	gwId: integer("gw_id").notNull(),
	priority: smallint().notNull(),
	weight: integer().default(1).notNull(),
}, (table) => [
	index("lcr_rule_target_lcr_id_idx").using("btree", table.lcrId.asc().nullsLast().op("int2_ops")),
]);

export const lcrRule = pgTable("lcr_rule", {
	id: serial().primaryKey().notNull(),
	lcrId: smallint("lcr_id").notNull(),
	prefix: varchar({ length: 16 }).default(sql`NULL`),
	fromUri: varchar("from_uri", { length: 64 }).default(sql`NULL`),
	requestUri: varchar("request_uri", { length: 64 }).default(sql`NULL`),
	mtTvalue: varchar("mt_tvalue", { length: 128 }).default(sql`NULL`),
	stopper: integer().default(0).notNull(),
	enabled: integer().default(1).notNull(),
});

export const domain = pgTable("domain", {
	id: serial().primaryKey().notNull(),
	domain: varchar({ length: 64 }).notNull(),
	did: varchar({ length: 64 }).default(sql`NULL`),
	lastModified: timestamp("last_modified", { mode: 'string' }).default('2000-01-01 00:00:01').notNull(),
});

export const domainAttrs = pgTable("domain_attrs", {
	id: serial().primaryKey().notNull(),
	did: varchar({ length: 64 }).notNull(),
	name: varchar({ length: 32 }).notNull(),
	type: integer().notNull(),
	value: varchar({ length: 255 }).notNull(),
	lastModified: timestamp("last_modified", { mode: 'string' }).default('2000-01-01 00:00:01').notNull(),
}, (table) => [
	index("domain_attrs_domain_attrs_idx").using("btree", table.did.asc().nullsLast().op("text_ops"), table.name.asc().nullsLast().op("text_ops")),
]);

export const grp = pgTable("grp", {
	id: serial().primaryKey().notNull(),
	username: varchar({ length: 64 }).default('').notNull(),
	domain: varchar({ length: 64 }).default('').notNull(),
	grp: varchar({ length: 64 }).default('').notNull(),
	lastModified: timestamp("last_modified", { mode: 'string' }).default('2000-01-01 00:00:01').notNull(),
});

export const reGrp = pgTable("re_grp", {
	id: serial().primaryKey().notNull(),
	regExp: varchar("reg_exp", { length: 128 }).default('').notNull(),
	groupId: integer("group_id").default(0).notNull(),
}, (table) => [
	index("re_grp_group_idx").using("btree", table.groupId.asc().nullsLast().op("int4_ops")),
]);

export const trusted = pgTable("trusted", {
	id: serial().primaryKey().notNull(),
	srcIp: varchar("src_ip", { length: 50 }).notNull(),
	proto: varchar({ length: 4 }).notNull(),
	fromPattern: varchar("from_pattern", { length: 64 }).default(sql`NULL`),
	ruriPattern: varchar("ruri_pattern", { length: 64 }).default(sql`NULL`),
	tag: varchar({ length: 64 }),
	priority: integer().default(0).notNull(),
}, (table) => [
	index("trusted_peer_idx").using("btree", table.srcIp.asc().nullsLast().op("text_ops")),
]);

export const address = pgTable("address", {
	id: serial().primaryKey().notNull(),
	grp: integer().default(1).notNull(),
	ipAddr: varchar("ip_addr", { length: 50 }).notNull(),
	mask: integer().default(32).notNull(),
	port: smallint().default(0).notNull(),
	tag: varchar({ length: 64 }),
});

export const aliases = pgTable("aliases", {
	id: serial().primaryKey().notNull(),
	ruid: varchar({ length: 64 }).default('').notNull(),
	username: varchar({ length: 64 }).default('').notNull(),
	domain: varchar({ length: 64 }).default(sql`NULL`),
	contact: varchar({ length: 255 }).default('').notNull(),
	received: varchar({ length: 255 }).default(sql`NULL`),
	path: varchar({ length: 512 }).default(sql`NULL`),
	expires: timestamp({ mode: 'string' }).default('2030-05-28 21:32:15').notNull(),
	q: real().default(1).notNull(),
	callid: varchar({ length: 255 }).default('Default-Call-ID').notNull(),
	cseq: integer().default(1).notNull(),
	lastModified: timestamp("last_modified", { mode: 'string' }).default('2000-01-01 00:00:01').notNull(),
	flags: integer().default(0).notNull(),
	cflags: integer().default(0).notNull(),
	userAgent: varchar("user_agent", { length: 255 }).default('').notNull(),
	socket: varchar({ length: 64 }).default(sql`NULL`),
	methods: integer(),
	instance: varchar({ length: 255 }).default(sql`NULL`),
	regId: integer("reg_id").default(0).notNull(),
	serverId: integer("server_id").default(0).notNull(),
	connectionId: integer("connection_id").default(0).notNull(),
	keepalive: integer().default(0).notNull(),
	partition: integer().default(0).notNull(),
}, (table) => [
	index("aliases_account_contact_idx").using("btree", table.username.asc().nullsLast().op("text_ops"), table.domain.asc().nullsLast().op("text_ops"), table.contact.asc().nullsLast().op("text_ops")),
	index("aliases_expires_idx").using("btree", table.expires.asc().nullsLast().op("timestamp_ops")),
]);

export const usrPreferences = pgTable("usr_preferences", {
	id: serial().primaryKey().notNull(),
	uuid: varchar({ length: 64 }).default('').notNull(),
	username: varchar({ length: 255 }).default('').notNull(),
	domain: varchar({ length: 64 }).default('').notNull(),
	attribute: varchar({ length: 32 }).default('').notNull(),
	type: integer().default(0).notNull(),
	value: varchar({ length: 128 }).default('').notNull(),
	lastModified: timestamp("last_modified", { mode: 'string' }).default('2000-01-01 00:00:01').notNull(),
}, (table) => [
	index("usr_preferences_ua_idx").using("btree", table.uuid.asc().nullsLast().op("text_ops"), table.attribute.asc().nullsLast().op("text_ops")),
	index("usr_preferences_uda_idx").using("btree", table.username.asc().nullsLast().op("text_ops"), table.domain.asc().nullsLast().op("text_ops"), table.attribute.asc().nullsLast().op("text_ops")),
]);

export const silo = pgTable("silo", {
	id: serial().primaryKey().notNull(),
	srcAddr: varchar("src_addr", { length: 255 }).default('').notNull(),
	dstAddr: varchar("dst_addr", { length: 255 }).default('').notNull(),
	username: varchar({ length: 64 }).default('').notNull(),
	domain: varchar({ length: 64 }).default('').notNull(),
	incTime: integer("inc_time").default(0).notNull(),
	expTime: integer("exp_time").default(0).notNull(),
	sndTime: integer("snd_time").default(0).notNull(),
	ctype: varchar({ length: 32 }).default('text/plain').notNull(),
	// NOTE: source column is BYTEA; mapped to text for now to keep schema compilable.
	body: text("body"),
	extraHdrs: text("extra_hdrs"),
	callid: varchar({ length: 128 }).default('').notNull(),
	status: integer().default(0).notNull(),
}, (table) => [
	index("silo_account_idx").using("btree", table.username.asc().nullsLast().op("text_ops"), table.domain.asc().nullsLast().op("text_ops")),
]);

export const pdt = pgTable("pdt", {
	id: serial().primaryKey().notNull(),
	sdomain: varchar({ length: 255 }).notNull(),
	prefix: varchar({ length: 32 }).notNull(),
	domain: varchar({ length: 255 }).default('').notNull(),
});

export const dialplan = pgTable("dialplan", {
	id: serial().primaryKey().notNull(),
	dpid: integer().notNull(),
	pr: integer().notNull(),
	matchOp: integer("match_op").notNull(),
	matchExp: varchar("match_exp", { length: 64 }).notNull(),
	matchLen: integer("match_len").notNull(),
	substExp: varchar("subst_exp", { length: 64 }).notNull(),
	replExp: varchar("repl_exp", { length: 256 }).notNull(),
	attrs: varchar({ length: 64 }).notNull(),
});

export const acc = pgTable("acc", {
	id: serial().primaryKey().notNull(),
	method: varchar({ length: 16 }).default('').notNull(),
	fromTag: varchar("from_tag", { length: 128 }).default('').notNull(),
	toTag: varchar("to_tag", { length: 128 }).default('').notNull(),
	callid: varchar({ length: 255 }).default('').notNull(),
	sipCode: varchar("sip_code", { length: 3 }).default('').notNull(),
	sipReason: varchar("sip_reason", { length: 128 }).default('').notNull(),
	time: timestamp({ mode: 'string' }).notNull(),
	srcUser: varchar("src_user", { length: 64 }).default('').notNull(),
	srcDomain: varchar("src_domain", { length: 128 }).default('').notNull(),
	srcIp: varchar("src_ip", { length: 64 }).default('').notNull(),
	dstOuser: varchar("dst_ouser", { length: 64 }).default('').notNull(),
	dstUser: varchar("dst_user", { length: 64 }).default('').notNull(),
	dstDomain: varchar("dst_domain", { length: 128 }).default('').notNull(),
}, (table) => [
	index("acc_callid_idx").using("btree", table.callid.asc().nullsLast().op("text_ops")),
]);

export const missedCalls = pgTable("missed_calls", {
	id: serial().primaryKey().notNull(),
	method: varchar({ length: 16 }).default('').notNull(),
	fromTag: varchar("from_tag", { length: 128 }).default('').notNull(),
	toTag: varchar("to_tag", { length: 128 }).default('').notNull(),
	callid: varchar({ length: 255 }).default('').notNull(),
	sipCode: varchar("sip_code", { length: 3 }).default('').notNull(),
	sipReason: varchar("sip_reason", { length: 128 }).default('').notNull(),
	time: timestamp({ mode: 'string' }).notNull(),
	srcUser: varchar("src_user", { length: 64 }).default('').notNull(),
	srcDomain: varchar("src_domain", { length: 128 }).default('').notNull(),
	srcIp: varchar("src_ip", { length: 64 }).default('').notNull(),
	dstOuser: varchar("dst_ouser", { length: 64 }).default('').notNull(),
	dstUser: varchar("dst_user", { length: 64 }).default('').notNull(),
	dstDomain: varchar("dst_domain", { length: 128 }).default('').notNull(),
}, (table) => [
	index("missed_calls_callid_idx").using("btree", table.callid.asc().nullsLast().op("text_ops")),
]);

export const ivrProfiles = pgTable("ivr_profiles", {
	id: serial().primaryKey().notNull(),
	accountId: integer("account_id").default(0).notNull(),
	domain: varchar({ length: 64 }).default('').notNull(),
	name: varchar({ length: 128 }).default('').notNull(),
	activeVersionId: integer("active_version_id"),
	description: varchar({ length: 255 }).default('').notNull(),
	defaultLanguage: varchar("default_language", { length: 16 }).default('en-US').notNull(),
	timezone: varchar({ length: 64 }).default('UTC').notNull(),
	isActive: integer("is_active").default(1).notNull(),
	createDate: timestamp("create_date", { mode: 'string' }).default('2000-01-01 00:00:01').notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default('2000-01-01 00:00:01').notNull(),
}, (table) => [
	index("ivr_profiles_account_domain_name_idx").using("btree", table.accountId.asc().nullsLast().op("int4_ops"), table.domain.asc().nullsLast().op("text_ops"), table.name.asc().nullsLast().op("text_ops")),
	uniqueIndex("ivr_profiles_account_domain_name_unq").on(table.accountId, table.domain, table.name),
	foreignKey({
		columns: [table.accountId],
		foreignColumns: [accounts.id],
		name: "ivr_profiles_account_id_fkey"
	}).onDelete("cascade"),
]);

export const ivrPrompts = pgTable("ivr_prompts", {
	id: serial().primaryKey().notNull(),
	accountId: integer("account_id").default(0).notNull(),
	domain: varchar({ length: 64 }).default('').notNull(),
	ivrProfileId: integer("ivr_profile_id").notNull(),
	promptKey: varchar("prompt_key", { length: 128 }).default('').notNull(),
	promptType: varchar("prompt_type", { length: 16 }).default('tts').notNull(),
	language: varchar({ length: 16 }).default('en-US').notNull(),
	voice: varchar({ length: 64 }).default('').notNull(),
	textBody: text("text_body"),
	mediaUri: varchar("media_uri", { length: 255 }).default('').notNull(),
	checksum: varchar({ length: 64 }).default('').notNull(),
	isActive: integer("is_active").default(1).notNull(),
	createDate: timestamp("create_date", { mode: 'string' }).default('2000-01-01 00:00:01').notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default('2000-01-01 00:00:01').notNull(),
}, (table) => [
	index("ivr_prompts_account_profile_key_idx").using("btree", table.accountId.asc().nullsLast().op("int4_ops"), table.ivrProfileId.asc().nullsLast().op("int4_ops"), table.promptKey.asc().nullsLast().op("text_ops")),
	uniqueIndex("ivr_prompts_profile_key_language_unq").on(table.ivrProfileId, table.promptKey, table.language),
	foreignKey({
		columns: [table.accountId],
		foreignColumns: [accounts.id],
		name: "ivr_prompts_account_id_fkey"
	}).onDelete("cascade"),
	foreignKey({
		columns: [table.ivrProfileId],
		foreignColumns: [ivrProfiles.id],
		name: "ivr_prompts_ivr_profile_id_fkey"
	}).onDelete("cascade"),
]);

export const ivrVersions = pgTable("ivr_versions", {
	id: serial().primaryKey().notNull(),
	accountId: integer("account_id").default(0).notNull(),
	domain: varchar({ length: 64 }).default('').notNull(),
	ivrProfileId: integer("ivr_profile_id").notNull(),
	version: integer().default(1).notNull(),
	status: varchar({ length: 16 }).default('draft').notNull(),
	definitionHash: varchar("definition_hash", { length: 64 }).default('').notNull(),
	notes: text(),
	isActive: integer("is_active").default(0).notNull(),
	publishedAt: timestamp("published_at", { mode: 'string' }).default(sql`NULL`),
	createDate: timestamp("create_date", { mode: 'string' }).default('2000-01-01 00:00:01').notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default('2000-01-01 00:00:01').notNull(),
}, (table) => [
	index("ivr_versions_account_profile_version_idx").using("btree", table.accountId.asc().nullsLast().op("int4_ops"), table.ivrProfileId.asc().nullsLast().op("int4_ops"), table.version.asc().nullsLast().op("int4_ops")),
	uniqueIndex("ivr_versions_profile_version_unq").on(table.ivrProfileId, table.version),
	foreignKey({
		columns: [table.accountId],
		foreignColumns: [accounts.id],
		name: "ivr_versions_account_id_fkey"
	}).onDelete("cascade"),
	foreignKey({
		columns: [table.ivrProfileId],
		foreignColumns: [ivrProfiles.id],
		name: "ivr_versions_ivr_profile_id_fkey"
	}).onDelete("cascade"),
]);

export const ivrMenus = pgTable("ivr_menus", {
	id: serial().primaryKey().notNull(),
	accountId: integer("account_id").default(0).notNull(),
	domain: varchar({ length: 64 }).default('').notNull(),
	ivrProfileId: integer("ivr_profile_id").notNull(),
	ivrVersionId: integer("ivr_version_id"),
	name: varchar({ length: 128 }).default('').notNull(),
	isRoot: integer("is_root").default(0).notNull(),
	maxRetries: integer("max_retries").default(3).notNull(),
	timeoutMs: integer("timeout_ms").default(5000).notNull(),
	timeoutPromptId: integer("timeout_prompt_id"),
	invalidPromptId: integer("invalid_prompt_id"),
	fallbackActionType: varchar("fallback_action_type", { length: 32 }).default('hangup').notNull(),
	fallbackActionTarget: varchar("fallback_action_target", { length: 255 }).default('').notNull(),
	isActive: integer("is_active").default(1).notNull(),
	createDate: timestamp("create_date", { mode: 'string' }).default('2000-01-01 00:00:01').notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default('2000-01-01 00:00:01').notNull(),
}, (table) => [
	index("ivr_menus_account_profile_name_idx").using("btree", table.accountId.asc().nullsLast().op("int4_ops"), table.ivrProfileId.asc().nullsLast().op("int4_ops"), table.name.asc().nullsLast().op("text_ops")),
	index("ivr_menus_profile_root_idx").using("btree", table.ivrProfileId.asc().nullsLast().op("int4_ops"), table.isRoot.asc().nullsLast().op("int4_ops")),
	uniqueIndex("ivr_menus_profile_name_unq").on(table.ivrProfileId, table.name),
	foreignKey({
		columns: [table.accountId],
		foreignColumns: [accounts.id],
		name: "ivr_menus_account_id_fkey"
	}).onDelete("cascade"),
	foreignKey({
		columns: [table.ivrProfileId],
		foreignColumns: [ivrProfiles.id],
		name: "ivr_menus_ivr_profile_id_fkey"
	}).onDelete("cascade"),
	foreignKey({
		columns: [table.ivrVersionId],
		foreignColumns: [ivrVersions.id],
		name: "ivr_menus_ivr_version_id_fkey"
	}).onDelete("set null"),
	foreignKey({
		columns: [table.timeoutPromptId],
		foreignColumns: [ivrPrompts.id],
		name: "ivr_menus_timeout_prompt_id_fkey"
	}).onDelete("set null"),
	foreignKey({
		columns: [table.invalidPromptId],
		foreignColumns: [ivrPrompts.id],
		name: "ivr_menus_invalid_prompt_id_fkey"
	}).onDelete("set null"),
]);

export const ivrMenuOptions = pgTable("ivr_menu_options", {
	id: serial().primaryKey().notNull(),
	accountId: integer("account_id").default(0).notNull(),
	domain: varchar({ length: 64 }).default('').notNull(),
	ivrMenuId: integer("ivr_menu_id").notNull(),
	inputType: varchar("input_type", { length: 16 }).default('dtmf').notNull(),
	digit: varchar({ length: 8 }).default('').notNull(),
	speechPattern: varchar("speech_pattern", { length: 128 }).default('').notNull(),
	actionType: varchar("action_type", { length: 32 }).default('hangup').notNull(),
	actionTarget: varchar("action_target", { length: 255 }).default('').notNull(),
	priority: integer().default(0).notNull(),
	isDefault: integer("is_default").default(0).notNull(),
	isActive: integer("is_active").default(1).notNull(),
	createDate: timestamp("create_date", { mode: 'string' }).default('2000-01-01 00:00:01').notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default('2000-01-01 00:00:01').notNull(),
}, (table) => [
	index("ivr_menu_options_menu_digit_idx").using("btree", table.ivrMenuId.asc().nullsLast().op("int4_ops"), table.digit.asc().nullsLast().op("text_ops")),
	index("ivr_menu_options_menu_priority_idx").using("btree", table.ivrMenuId.asc().nullsLast().op("int4_ops"), table.priority.asc().nullsLast().op("int4_ops")),
	uniqueIndex("ivr_menu_options_menu_digit_unq").on(table.ivrMenuId, table.digit),
	foreignKey({
		columns: [table.accountId],
		foreignColumns: [accounts.id],
		name: "ivr_menu_options_account_id_fkey"
	}).onDelete("cascade"),
	foreignKey({
		columns: [table.ivrMenuId],
		foreignColumns: [ivrMenus.id],
		name: "ivr_menu_options_ivr_menu_id_fkey"
	}).onDelete("cascade"),
]);

export const queueHandoffs = pgTable("queue_handoffs", {
	id: serial().primaryKey().notNull(),
	accountId: integer("account_id").default(0).notNull(),
	domain: varchar({ length: 64 }).default('').notNull(),
	name: varchar({ length: 128 }).default('').notNull(),
	queueId: varchar("queue_id", { length: 64 }).default('').notNull(),
	strategy: varchar({ length: 32 }).default('ring-all').notNull(),
	priority: integer().default(0).notNull(),
	skillTag: varchar("skill_tag", { length: 64 }).default('').notNull(),
	maxWaitSeconds: integer("max_wait_seconds").default(60).notNull(),
	overflowActionType: varchar("overflow_action_type", { length: 32 }).default('voicemail').notNull(),
	overflowActionTarget: varchar("overflow_action_target", { length: 255 }).default('').notNull(),
	isActive: integer("is_active").default(1).notNull(),
	createDate: timestamp("create_date", { mode: 'string' }).default('2000-01-01 00:00:01').notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default('2000-01-01 00:00:01').notNull(),
}, (table) => [
	index("queue_handoffs_account_domain_name_idx").using("btree", table.accountId.asc().nullsLast().op("int4_ops"), table.domain.asc().nullsLast().op("text_ops"), table.name.asc().nullsLast().op("text_ops")),
	uniqueIndex("queue_handoffs_account_domain_name_unq").on(table.accountId, table.domain, table.name),
	foreignKey({
		columns: [table.accountId],
		foreignColumns: [accounts.id],
		name: "queue_handoffs_account_id_fkey"
	}).onDelete("cascade"),
]);

export const ivrFlows = pgTable("ivr_flows", {
	id: serial().primaryKey().notNull(),
	accountId: integer("account_id").default(0).notNull(),
	domain: varchar({ length: 64 }).default('').notNull(),
	ivrProfileId: integer("ivr_profile_id").notNull(),
	fromMenuId: integer("from_menu_id").notNull(),
	optionId: integer("option_id"),
	queueHandoffId: integer("queue_handoff_id"),
	conditionType: varchar("condition_type", { length: 32 }).default('always').notNull(),
	actionType: varchar("action_type", { length: 32 }).default('hangup').notNull(),
	actionTarget: varchar("action_target", { length: 255 }).default('').notNull(),
	failActionType: varchar("fail_action_type", { length: 32 }).default('hangup').notNull(),
	failActionTarget: varchar("fail_action_target", { length: 255 }).default('').notNull(),
	priority: integer().default(0).notNull(),
	isActive: integer("is_active").default(1).notNull(),
	createDate: timestamp("create_date", { mode: 'string' }).default('2000-01-01 00:00:01').notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default('2000-01-01 00:00:01').notNull(),
}, (table) => [
	index("ivr_flows_profile_menu_priority_idx").using("btree", table.ivrProfileId.asc().nullsLast().op("int4_ops"), table.fromMenuId.asc().nullsLast().op("int4_ops"), table.priority.asc().nullsLast().op("int4_ops")),
	foreignKey({
		columns: [table.accountId],
		foreignColumns: [accounts.id],
		name: "ivr_flows_account_id_fkey"
	}).onDelete("cascade"),
	foreignKey({
		columns: [table.ivrProfileId],
		foreignColumns: [ivrProfiles.id],
		name: "ivr_flows_ivr_profile_id_fkey"
	}).onDelete("cascade"),
	foreignKey({
		columns: [table.fromMenuId],
		foreignColumns: [ivrMenus.id],
		name: "ivr_flows_from_menu_id_fkey"
	}).onDelete("cascade"),
	foreignKey({
		columns: [table.optionId],
		foreignColumns: [ivrMenuOptions.id],
		name: "ivr_flows_option_id_fkey"
	}).onDelete("set null"),
	foreignKey({
		columns: [table.queueHandoffId],
		foreignColumns: [queueHandoffs.id],
		name: "ivr_flows_queue_handoff_id_fkey"
	}).onDelete("set null"),
]);

export const timeConditions = pgTable("time_conditions", {
	id: serial().primaryKey().notNull(),
	accountId: integer("account_id").default(0).notNull(),
	domain: varchar({ length: 64 }).default('').notNull(),
	name: varchar({ length: 128 }).default('').notNull(),
	timezone: varchar({ length: 64 }).default('UTC').notNull(),
	matchActionType: varchar("match_action_type", { length: 32 }).default('allow').notNull(),
	noMatchActionType: varchar("no_match_action_type", { length: 32 }).default('deny').notNull(),
	noMatchActionTarget: varchar("no_match_action_target", { length: 255 }).default('').notNull(),
	isActive: integer("is_active").default(1).notNull(),
	createDate: timestamp("create_date", { mode: 'string' }).default('2000-01-01 00:00:01').notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default('2000-01-01 00:00:01').notNull(),
}, (table) => [
	index("time_conditions_account_domain_name_idx").using("btree", table.accountId.asc().nullsLast().op("int4_ops"), table.domain.asc().nullsLast().op("text_ops"), table.name.asc().nullsLast().op("text_ops")),
	uniqueIndex("time_conditions_account_domain_name_unq").on(table.accountId, table.domain, table.name),
	foreignKey({
		columns: [table.accountId],
		foreignColumns: [accounts.id],
		name: "time_conditions_account_id_fkey"
	}).onDelete("cascade"),
]);

export const timeConditionRules = pgTable("time_condition_rules", {
	id: serial().primaryKey().notNull(),
	accountId: integer("account_id").default(0).notNull(),
	domain: varchar({ length: 64 }).default('').notNull(),
	timeConditionId: integer("time_condition_id").notNull(),
	dayOfWeek: smallint("day_of_week"),
	startTime: varchar("start_time", { length: 8 }).default(sql`NULL`),
	endTime: varchar("end_time", { length: 8 }).default(sql`NULL`),
	startDate: varchar("start_date", { length: 10 }).default(sql`NULL`),
	endDate: varchar("end_date", { length: 10 }).default(sql`NULL`),
	matchType: varchar("match_type", { length: 16 }).default('include').notNull(),
	priority: integer().default(0).notNull(),
	isActive: integer("is_active").default(1).notNull(),
	createDate: timestamp("create_date", { mode: 'string' }).default('2000-01-01 00:00:01').notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default('2000-01-01 00:00:01').notNull(),
}, (table) => [
	index("time_condition_rules_condition_priority_idx").using("btree", table.timeConditionId.asc().nullsLast().op("int4_ops"), table.priority.asc().nullsLast().op("int4_ops")),
	foreignKey({
		columns: [table.accountId],
		foreignColumns: [accounts.id],
		name: "time_condition_rules_account_id_fkey"
	}).onDelete("cascade"),
	foreignKey({
		columns: [table.timeConditionId],
		foreignColumns: [timeConditions.id],
		name: "time_condition_rules_time_condition_id_fkey"
	}).onDelete("cascade"),
]);

export const holidayCalendars = pgTable("holiday_calendars", {
	id: serial().primaryKey().notNull(),
	accountId: integer("account_id").default(0).notNull(),
	domain: varchar({ length: 64 }).default('').notNull(),
	name: varchar({ length: 128 }).default('').notNull(),
	timezone: varchar({ length: 64 }).default('UTC').notNull(),
	isActive: integer("is_active").default(1).notNull(),
	createDate: timestamp("create_date", { mode: 'string' }).default('2000-01-01 00:00:01').notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default('2000-01-01 00:00:01').notNull(),
}, (table) => [
	index("holiday_calendars_account_domain_name_idx").using("btree", table.accountId.asc().nullsLast().op("int4_ops"), table.domain.asc().nullsLast().op("text_ops"), table.name.asc().nullsLast().op("text_ops")),
	uniqueIndex("holiday_calendars_account_domain_name_unq").on(table.accountId, table.domain, table.name),
	foreignKey({
		columns: [table.accountId],
		foreignColumns: [accounts.id],
		name: "holiday_calendars_account_id_fkey"
	}).onDelete("cascade"),
]);

export const holidayEntries = pgTable("holiday_entries", {
	id: serial().primaryKey().notNull(),
	accountId: integer("account_id").default(0).notNull(),
	domain: varchar({ length: 64 }).default('').notNull(),
	holidayCalendarId: integer("holiday_calendar_id").notNull(),
	name: varchar({ length: 128 }).default('').notNull(),
	startDate: varchar("start_date", { length: 10 }).default('').notNull(),
	endDate: varchar("end_date", { length: 10 }).default('').notNull(),
	isClosed: integer("is_closed").default(1).notNull(),
	overrideActionType: varchar("override_action_type", { length: 32 }).default('ivr').notNull(),
	overrideActionTarget: varchar("override_action_target", { length: 255 }).default('').notNull(),
	isActive: integer("is_active").default(1).notNull(),
	createDate: timestamp("create_date", { mode: 'string' }).default('2000-01-01 00:00:01').notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default('2000-01-01 00:00:01').notNull(),
}, (table) => [
	index("holiday_entries_calendar_start_end_idx").using("btree", table.holidayCalendarId.asc().nullsLast().op("int4_ops"), table.startDate.asc().nullsLast().op("text_ops"), table.endDate.asc().nullsLast().op("text_ops")),
	foreignKey({
		columns: [table.accountId],
		foreignColumns: [accounts.id],
		name: "holiday_entries_account_id_fkey"
	}).onDelete("cascade"),
	foreignKey({
		columns: [table.holidayCalendarId],
		foreignColumns: [holidayCalendars.id],
		name: "holiday_entries_holiday_calendar_id_fkey"
	}).onDelete("cascade"),
]);

export const routingPolicies = pgTable("routing_policies", {
	id: serial().primaryKey().notNull(),
	accountId: integer("account_id").default(0).notNull(),
	domain: varchar({ length: 64 }).default('').notNull(),
	name: varchar({ length: 128 }).default('').notNull(),
	maxAttempts: integer("max_attempts").default(3).notNull(),
	retryDelayMs: integer("retry_delay_ms").default(250).notNull(),
	sip4xxAction: varchar("sip_4xx_action", { length: 32 }).default('next-target').notNull(),
	sip5xxAction: varchar("sip_5xx_action", { length: 32 }).default('next-target').notNull(),
	sip6xxAction: varchar("sip_6xx_action", { length: 32 }).default('stop').notNull(),
	failoverActionType: varchar("failover_action_type", { length: 32 }).default('voicemail').notNull(),
	failoverActionTarget: varchar("failover_action_target", { length: 255 }).default('').notNull(),
	isActive: integer("is_active").default(1).notNull(),
	createDate: timestamp("create_date", { mode: 'string' }).default('2000-01-01 00:00:01').notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default('2000-01-01 00:00:01').notNull(),
}, (table) => [
	index("routing_policies_account_domain_name_idx").using("btree", table.accountId.asc().nullsLast().op("int4_ops"), table.domain.asc().nullsLast().op("text_ops"), table.name.asc().nullsLast().op("text_ops")),
	uniqueIndex("routing_policies_account_domain_name_unq").on(table.accountId, table.domain, table.name),
	foreignKey({
		columns: [table.accountId],
		foreignColumns: [accounts.id],
		name: "routing_policies_account_id_fkey"
	}).onDelete("cascade"),
]);

export const recordingPolicies = pgTable("recording_policies", {
	id: serial().primaryKey().notNull(),
	accountId: integer("account_id").default(0).notNull(),
	domain: varchar({ length: 64 }).default('').notNull(),
	name: varchar({ length: 128 }).default('').notNull(),
	scopeType: varchar("scope_type", { length: 32 }).default('tenant').notNull(),
	scopeValue: varchar("scope_value", { length: 128 }).default('').notNull(),
	recordInbound: integer("record_inbound").default(1).notNull(),
	recordOutbound: integer("record_outbound").default(1).notNull(),
	recordInternal: integer("record_internal").default(0).notNull(),
	fileFormat: varchar("file_format", { length: 16 }).default('wav').notNull(),
	maxDurationSeconds: integer("max_duration_seconds").default(0).notNull(),
	retentionDays: integer("retention_days").default(30).notNull(),
	pauseDigits: varchar("pause_digits", { length: 16 }).default('').notNull(),
	resumeDigits: varchar("resume_digits", { length: 16 }).default('').notNull(),
	isActive: integer("is_active").default(1).notNull(),
	createDate: timestamp("create_date", { mode: 'string' }).default('2000-01-01 00:00:01').notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default('2000-01-01 00:00:01').notNull(),
}, (table) => [
	index("recording_policies_account_domain_scope_idx").using("btree", table.accountId.asc().nullsLast().op("int4_ops"), table.domain.asc().nullsLast().op("text_ops"), table.scopeType.asc().nullsLast().op("text_ops"), table.scopeValue.asc().nullsLast().op("text_ops")),
	foreignKey({
		columns: [table.accountId],
		foreignColumns: [accounts.id],
		name: "recording_policies_account_id_fkey"
	}).onDelete("cascade"),
]);

export const inboundRoutes = pgTable("inbound_routes", {
	id: serial().primaryKey().notNull(),
	accountId: integer("account_id").default(0).notNull(),
	domain: varchar({ length: 64 }).default('').notNull(),
	did: varchar({ length: 64 }).default('').notNull(),
	priority: integer().default(0).notNull(),
	timeConditionId: integer("time_condition_id"),
	holidayCalendarId: integer("holiday_calendar_id"),
	routingPolicyId: integer("routing_policy_id"),
	recordingPolicyId: integer("recording_policy_id"),
	ivrProfileId: integer("ivr_profile_id"),
	targetType: varchar("target_type", { length: 32 }).default('ivr').notNull(),
	targetValue: varchar("target_value", { length: 255 }).default('').notNull(),
	fallbackTargetType: varchar("fallback_target_type", { length: 32 }).default('voicemail').notNull(),
	fallbackTargetValue: varchar("fallback_target_value", { length: 255 }).default('').notNull(),
	isEmergency: integer("is_emergency").default(0).notNull(),
	isActive: integer("is_active").default(1).notNull(),
	createDate: timestamp("create_date", { mode: 'string' }).default('2000-01-01 00:00:01').notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default('2000-01-01 00:00:01').notNull(),
}, (table) => [
	index("inbound_routes_account_domain_did_idx").using("btree", table.accountId.asc().nullsLast().op("int4_ops"), table.domain.asc().nullsLast().op("text_ops"), table.did.asc().nullsLast().op("text_ops")),
	index("inbound_routes_priority_idx").using("btree", table.accountId.asc().nullsLast().op("int4_ops"), table.priority.asc().nullsLast().op("int4_ops")),
	uniqueIndex("inbound_routes_account_domain_did_priority_unq").on(table.accountId, table.domain, table.did, table.priority),
	foreignKey({
		columns: [table.accountId],
		foreignColumns: [accounts.id],
		name: "inbound_routes_account_id_fkey"
	}).onDelete("cascade"),
	foreignKey({
		columns: [table.timeConditionId],
		foreignColumns: [timeConditions.id],
		name: "inbound_routes_time_condition_id_fkey"
	}).onDelete("set null"),
	foreignKey({
		columns: [table.holidayCalendarId],
		foreignColumns: [holidayCalendars.id],
		name: "inbound_routes_holiday_calendar_id_fkey"
	}).onDelete("set null"),
	foreignKey({
		columns: [table.routingPolicyId],
		foreignColumns: [routingPolicies.id],
		name: "inbound_routes_routing_policy_id_fkey"
	}).onDelete("set null"),
	foreignKey({
		columns: [table.recordingPolicyId],
		foreignColumns: [recordingPolicies.id],
		name: "inbound_routes_recording_policy_id_fkey"
	}).onDelete("set null"),
	foreignKey({
		columns: [table.ivrProfileId],
		foreignColumns: [ivrProfiles.id],
		name: "inbound_routes_ivr_profile_id_fkey"
	}).onDelete("set null"),
]);

export const tenantAuditLog = pgTable("tenant_audit_log", {
	id: serial().primaryKey().notNull(),
	accountId: integer("account_id").default(0).notNull(),
	domain: varchar({ length: 64 }).default('').notNull(),
	entityType: varchar("entity_type", { length: 64 }).default('').notNull(),
	entityId: integer("entity_id").default(0).notNull(),
	action: varchar({ length: 32 }).default('').notNull(),
	actor: varchar({ length: 128 }).default('').notNull(),
	requestId: varchar("request_id", { length: 128 }).default('').notNull(),
	beforePayload: text("before_payload"),
	afterPayload: text("after_payload"),
	createDate: timestamp("create_date", { mode: 'string' }).default('2000-01-01 00:00:01').notNull(),
}, (table) => [
	index("tenant_audit_log_account_entity_idx").using("btree", table.accountId.asc().nullsLast().op("int4_ops"), table.entityType.asc().nullsLast().op("text_ops"), table.entityId.asc().nullsLast().op("int4_ops")),
	foreignKey({
		columns: [table.accountId],
		foreignColumns: [accounts.id],
		name: "tenant_audit_log_account_id_fkey"
	}).onDelete("cascade"),
]);

export const ivrTestCalls = pgTable("ivr_test_calls", {
	id: serial().primaryKey().notNull(),
	accountId: integer("account_id").default(0).notNull(),
	domain: varchar({ length: 64 }).default('').notNull(),
	name: varchar({ length: 128 }).default('').notNull(),
	entryDid: varchar("entry_did", { length: 64 }).default('').notNull(),
	testInput: varchar("test_input", { length: 255 }).default('').notNull(),
	expectedTargetType: varchar("expected_target_type", { length: 32 }).default('').notNull(),
	expectedTargetValue: varchar("expected_target_value", { length: 255 }).default('').notNull(),
	lastRunAt: timestamp("last_run_at", { mode: 'string' }).default(sql`NULL`),
	lastResult: varchar("last_result", { length: 32 }).default('').notNull(),
	isActive: integer("is_active").default(1).notNull(),
	createDate: timestamp("create_date", { mode: 'string' }).default('2000-01-01 00:00:01').notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default('2000-01-01 00:00:01').notNull(),
}, (table) => [
	index("ivr_test_calls_account_domain_name_idx").using("btree", table.accountId.asc().nullsLast().op("int4_ops"), table.domain.asc().nullsLast().op("text_ops"), table.name.asc().nullsLast().op("text_ops")),
	foreignKey({
		columns: [table.accountId],
		foreignColumns: [accounts.id],
		name: "ivr_test_calls_account_id_fkey"
	}).onDelete("cascade"),
]);

