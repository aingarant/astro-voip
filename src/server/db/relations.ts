import { relations } from "drizzle-orm/relations";
import {
	accounts,
	dids,
	voicemailBoxes,
	subscriber,
	extensions,
	voicemailMessages,
	ivrProfiles,
	ivrPrompts,
	ivrVersions,
	ivrMenus,
	ivrMenuOptions,
	ivrFlows,
	inboundRoutes,
	timeConditions,
	timeConditionRules,
	holidayCalendars,
	holidayEntries,
	routingPolicies,
	recordingPolicies,
	queueHandoffs,
	tenantAuditLog,
	ivrTestCalls,
} from "./schema";

export const didsRelations = relations(dids, ({ one, many }) => ({
	account: one(accounts, {
		fields: [dids.accountId],
		references: [accounts.id]
	}),
	subscribers: many(subscriber),
}));

export const accountsRelations = relations(accounts, ({ many }) => ({
	dids: many(dids),
	voicemailBoxes: many(voicemailBoxes),
	subscribers: many(subscriber),
	extensions: many(extensions),
	voicemailMessages: many(voicemailMessages),
}));

export const voicemailBoxesRelations = relations(voicemailBoxes, ({ one, many }) => ({
	account: one(accounts, {
		fields: [voicemailBoxes.accountId],
		references: [accounts.id]
	}),
	extensions: many(extensions),
	voicemailMessages: many(voicemailMessages),
}));

export const subscriberRelations = relations(subscriber, ({ one }) => ({
	account: one(accounts, {
		fields: [subscriber.accountId],
		references: [accounts.id]
	}),
	did: one(dids, {
		fields: [subscriber.defaultDid],
		references: [dids.id]
	}),
}));

export const extensionsRelations = relations(extensions, ({ one }) => ({
	account: one(accounts, {
		fields: [extensions.accountId],
		references: [accounts.id]
	}),
	voicemailBox: one(voicemailBoxes, {
		fields: [extensions.voicemailId],
		references: [voicemailBoxes.id]
	}),
}));

export const voicemailMessagesRelations = relations(voicemailMessages, ({ one }) => ({
	account: one(accounts, {
		fields: [voicemailMessages.accountId],
		references: [accounts.id]
	}),
	voicemailBox: one(voicemailBoxes, {
		fields: [voicemailMessages.voicemailBoxId],
		references: [voicemailBoxes.id]
	}),
}));

export const ivrProfilesRelations = relations(ivrProfiles, ({ one, many }) => ({
	account: one(accounts, {
		fields: [ivrProfiles.accountId],
		references: [accounts.id],
	}),
	activeVersion: one(ivrVersions, {
		fields: [ivrProfiles.activeVersionId],
		references: [ivrVersions.id],
	}),
	prompts: many(ivrPrompts),
	versions: many(ivrVersions),
	menus: many(ivrMenus),
	flows: many(ivrFlows),
	inboundRoutes: many(inboundRoutes),
}));

export const ivrPromptsRelations = relations(ivrPrompts, ({ one }) => ({
	account: one(accounts, {
		fields: [ivrPrompts.accountId],
		references: [accounts.id],
	}),
	profile: one(ivrProfiles, {
		fields: [ivrPrompts.ivrProfileId],
		references: [ivrProfiles.id],
	}),
}));

export const ivrVersionsRelations = relations(ivrVersions, ({ one, many }) => ({
	account: one(accounts, {
		fields: [ivrVersions.accountId],
		references: [accounts.id],
	}),
	profile: one(ivrProfiles, {
		fields: [ivrVersions.ivrProfileId],
		references: [ivrProfiles.id],
	}),
	menus: many(ivrMenus),
}));

export const ivrMenusRelations = relations(ivrMenus, ({ one, many }) => ({
	account: one(accounts, {
		fields: [ivrMenus.accountId],
		references: [accounts.id],
	}),
	profile: one(ivrProfiles, {
		fields: [ivrMenus.ivrProfileId],
		references: [ivrProfiles.id],
	}),
	version: one(ivrVersions, {
		fields: [ivrMenus.ivrVersionId],
		references: [ivrVersions.id],
	}),
	timeoutPrompt: one(ivrPrompts, {
		relationName: "ivr_menu_timeout_prompt",
		fields: [ivrMenus.timeoutPromptId],
		references: [ivrPrompts.id],
	}),
	invalidPrompt: one(ivrPrompts, {
		relationName: "ivr_menu_invalid_prompt",
		fields: [ivrMenus.invalidPromptId],
		references: [ivrPrompts.id],
	}),
	options: many(ivrMenuOptions),
	flows: many(ivrFlows),
}));

export const ivrMenuOptionsRelations = relations(ivrMenuOptions, ({ one, many }) => ({
	account: one(accounts, {
		fields: [ivrMenuOptions.accountId],
		references: [accounts.id],
	}),
	menu: one(ivrMenus, {
		fields: [ivrMenuOptions.ivrMenuId],
		references: [ivrMenus.id],
	}),
	flows: many(ivrFlows),
}));

export const queueHandoffsRelations = relations(queueHandoffs, ({ one, many }) => ({
	account: one(accounts, {
		fields: [queueHandoffs.accountId],
		references: [accounts.id],
	}),
	flows: many(ivrFlows),
}));

export const ivrFlowsRelations = relations(ivrFlows, ({ one }) => ({
	account: one(accounts, {
		fields: [ivrFlows.accountId],
		references: [accounts.id],
	}),
	profile: one(ivrProfiles, {
		fields: [ivrFlows.ivrProfileId],
		references: [ivrProfiles.id],
	}),
	menu: one(ivrMenus, {
		fields: [ivrFlows.fromMenuId],
		references: [ivrMenus.id],
	}),
	option: one(ivrMenuOptions, {
		fields: [ivrFlows.optionId],
		references: [ivrMenuOptions.id],
	}),
	queueHandoff: one(queueHandoffs, {
		fields: [ivrFlows.queueHandoffId],
		references: [queueHandoffs.id],
	}),
}));

export const timeConditionsRelations = relations(timeConditions, ({ one, many }) => ({
	account: one(accounts, {
		fields: [timeConditions.accountId],
		references: [accounts.id],
	}),
	rules: many(timeConditionRules),
	inboundRoutes: many(inboundRoutes),
}));

export const timeConditionRulesRelations = relations(timeConditionRules, ({ one }) => ({
	account: one(accounts, {
		fields: [timeConditionRules.accountId],
		references: [accounts.id],
	}),
	timeCondition: one(timeConditions, {
		fields: [timeConditionRules.timeConditionId],
		references: [timeConditions.id],
	}),
}));

export const holidayCalendarsRelations = relations(holidayCalendars, ({ one, many }) => ({
	account: one(accounts, {
		fields: [holidayCalendars.accountId],
		references: [accounts.id],
	}),
	entries: many(holidayEntries),
	inboundRoutes: many(inboundRoutes),
}));

export const holidayEntriesRelations = relations(holidayEntries, ({ one }) => ({
	account: one(accounts, {
		fields: [holidayEntries.accountId],
		references: [accounts.id],
	}),
	calendar: one(holidayCalendars, {
		fields: [holidayEntries.holidayCalendarId],
		references: [holidayCalendars.id],
	}),
}));

export const routingPoliciesRelations = relations(routingPolicies, ({ one, many }) => ({
	account: one(accounts, {
		fields: [routingPolicies.accountId],
		references: [accounts.id],
	}),
	inboundRoutes: many(inboundRoutes),
}));

export const recordingPoliciesRelations = relations(recordingPolicies, ({ one, many }) => ({
	account: one(accounts, {
		fields: [recordingPolicies.accountId],
		references: [accounts.id],
	}),
	inboundRoutes: many(inboundRoutes),
}));

export const inboundRoutesRelations = relations(inboundRoutes, ({ one }) => ({
	account: one(accounts, {
		fields: [inboundRoutes.accountId],
		references: [accounts.id],
	}),
	timeCondition: one(timeConditions, {
		fields: [inboundRoutes.timeConditionId],
		references: [timeConditions.id],
	}),
	holidayCalendar: one(holidayCalendars, {
		fields: [inboundRoutes.holidayCalendarId],
		references: [holidayCalendars.id],
	}),
	routingPolicy: one(routingPolicies, {
		fields: [inboundRoutes.routingPolicyId],
		references: [routingPolicies.id],
	}),
	recordingPolicy: one(recordingPolicies, {
		fields: [inboundRoutes.recordingPolicyId],
		references: [recordingPolicies.id],
	}),
	ivrProfile: one(ivrProfiles, {
		fields: [inboundRoutes.ivrProfileId],
		references: [ivrProfiles.id],
	}),
}));

export const tenantAuditLogRelations = relations(tenantAuditLog, ({ one }) => ({
	account: one(accounts, {
		fields: [tenantAuditLog.accountId],
		references: [accounts.id],
	}),
}));

export const ivrTestCallsRelations = relations(ivrTestCalls, ({ one }) => ({
	account: one(accounts, {
		fields: [ivrTestCalls.accountId],
		references: [accounts.id],
	}),
}));