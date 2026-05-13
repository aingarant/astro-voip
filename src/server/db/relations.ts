import { relations } from "drizzle-orm/relations";
import { accounts, dids, voicemailBoxes, subscriber, extensions, voicemailMessages } from "./schema";

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