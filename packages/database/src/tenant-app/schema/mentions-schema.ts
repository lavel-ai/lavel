import { pgSchema, uuid, text, timestamp, pgTable } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { users } from "./users-schema";
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

export const mentions = pgTable("mentions", {
  id: uuid("id").primaryKey().defaultRandom(),
  sourceType: text("source_type").notNull(), // e.g., 'task', 'comment', 'event'
  sourceId: uuid("source_id").notNull(),       // the ID of the record where the mention occurred
  mentionedUserId: uuid("mentioned_user_id")
    .references(() => users.id)
    .notNull(),
  context: text("context"), // optional snippet or additional context
  createdAt: timestamp("created_at", { withTimezone: true }).default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export type Mention = typeof mentions.$inferSelect;
export type InsertMention = typeof mentions.$inferInsert;

export const insertMentionSchema = createInsertSchema(mentions);
export const selectMentionSchema = createSelectSchema(mentions);