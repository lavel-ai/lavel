import { pgSchema, uuid, text, timestamp, jsonb, interval } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { users } from "./users-schema";
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { mainSchema } from "./main-schema-instance";

export const timeEntries = mainSchema.table("time_entries", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  resourceType: text("resource_type").notNull(), // e.g., 'task', 'event', 'hearing'
  resourceId: uuid("resource_id").notNull(),
  timeSpent: interval("time_spent").notNull(), // PostgreSQL interval type
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export type TimeEntry = typeof timeEntries.$inferSelect;
export type InsertTimeEntry = typeof timeEntries.$inferInsert;

export const insertTimeEntrySchema = createInsertSchema(timeEntries);
export const selectTimeEntrySchema = createSelectSchema(timeEntries);