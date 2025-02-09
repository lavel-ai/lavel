import { pgTable, uuid, text, timestamp, jsonb, integer, boolean, pgSchema } from "drizzle-orm/pg-core";
import { cases } from "./case-schema";
import { relations } from "drizzle-orm";
import { users } from "./users-schema";
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

export const tenantSchema = pgSchema("tenant");

export const transcriptions = tenantSchema.table('transcriptions', {
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
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull(),
    created_by: uuid('created_by').notNull().references(() => users.id),
    updated_by: uuid('updated_by').notNull().references(() => users.id),
});

export const transcriptionsRelations = relations(transcriptions, ({ one }) => ({
    case: one(cases, {
        fields: [transcriptions.caseId],
        references: [cases.id],
    }),
    createdBy: one(users, {
        fields: [transcriptions.created_by],
        references: [users.id],
    }),
    updatedBy: one(users, {
        fields: [transcriptions.updated_by],
        references: [users.id],
    }),
}));

export type Transcription = typeof transcriptions.$inferSelect;
export type NewTranscription = typeof transcriptions.$inferInsert;

export const transcriptionsInsertSchema = createInsertSchema(transcriptions);
export const transcriptionsSelectSchema = createSelectSchema(transcriptions);