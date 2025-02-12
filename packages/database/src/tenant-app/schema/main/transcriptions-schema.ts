import { pgTable, uuid, text, timestamp, jsonb, integer, boolean, pgSchema } from "drizzle-orm/pg-core";
import { cases } from "./case-schema";
import { relations } from "drizzle-orm";
import { users } from "./users-schema";
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

export const mainSchema = pgSchema("main");

export const transcriptions = mainSchema.table('transcriptions', {
    id: uuid('id').defaultRandom().primaryKey(),
    caseId: uuid('case_id').notNull().references(() => cases.id),
    transcription: text('transcription').notNull(),
    summary: text('summary'),
    videoUrl: text('video_url').notNull(),
    videoDuration: integer('video_duration').notNull(),
    transcriptionProviderId: text('transcription_provider_id').notNull(),
    metadata: jsonb('metadata').notNull().default({}),
    isProcessed: boolean('is_processed').notNull().default(false),
    isPrivate: boolean('is_private').notNull().default(false),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    createdBy: uuid('created_by').notNull().references(() => users.id),
    updatedBy: uuid('updated_by').notNull().references(() => users.id),
});

export const transcriptionsRelations = relations(transcriptions, ({ one }) => ({
    case: one(cases, {
        fields: [transcriptions.caseId],
        references: [cases.id],
    }),
    createdBy: one(users, {
        fields: [transcriptions.createdBy],
        references: [users.id],
    }),
    updatedBy: one(users, {
        fields: [transcriptions.updatedBy],
        references: [users.id],
    }),
}));

export type Transcription = typeof transcriptions.$inferSelect;
export type NewTranscription = typeof transcriptions.$inferInsert;

export const transcriptionsInsertSchema = createInsertSchema(transcriptions);
export const transcriptionsSelectSchema = createSelectSchema(transcriptions);