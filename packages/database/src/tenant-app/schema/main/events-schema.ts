import { pgSchema, pgTable, timestamp, uuid, foreignKey, index, jsonb, varchar, text, boolean, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { sql } from "drizzle-orm";
// import { attendees } from "./attendees-schema";
import { cases } from "./case-schema";
import { users } from "./users-schema";
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

export const mainSchema = pgSchema("main");

export const eventStatus = mainSchema.enum("event_status", ['confirmed', 'tentative', 'cancelled']);
export const eventType = mainSchema.enum("event_type", ['hearing', 'appointment', 'call', 'meeting', 'other']);

export const events = mainSchema.table("events", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  startTime: timestamp("start_time", { withTimezone: true }).notNull(),
  endTime: timestamp("end_time", { withTimezone: true }).notNull(),
  isAllDay: boolean("is_all_day").default(false).notNull(),
  location: varchar("location", { length: 255 }),
  createdAt: timestamp("created_at", { withTimezone: true }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  status: eventStatus("status").default('confirmed').notNull(),
  recurrenceRule: text("recurrence_rule"),
  organizerId: uuid("organizer_id").notNull(),
  timezone: varchar("timezone", { length: 50 }).default('UTC').notNull(),
  color: varchar("color", { length: 7 }),
  metadata: jsonb("metadata"),
  caseId: uuid("case_id"),
  eventType: eventType("event_type").default('appointment').notNull(),
  createdBy: uuid("created_by").notNull(),
  updatedBy: uuid("updated_by").notNull(),
},
(table) => {
  return {
    idxEventsEndTime: index("idx_events_end_time").using("btree", table.endTime.asc().nullsLast()),
    idxEventsOrganizerId: index("idx_events_organizer_id").using("btree", table.organizerId.asc().nullsLast()),
    idxEventsStartTime: index("idx_events_start_time").using("btree", table.startTime.asc().nullsLast()),
    fkEventsCase: foreignKey({
      columns: [table.caseId],
      foreignColumns: [cases.id],
      name: "fk_events_case"
    }).onDelete("set null"),
    fkEventsCreatedBy: foreignKey({
      columns: [table.createdBy],
      foreignColumns: [users.id],
      name: "fk_events_created_by"
    }).onDelete("cascade"),
    fkEventsUpdatedBy: foreignKey({
      columns: [table.updatedBy],
      foreignColumns: [users.id],
      name: "fk_events_updated_by"
    })
  };
});

export const eventsRelations = relations(events, ({ one, many }) => ({
  // attendees: many(attendees),
  createdBy: one(users, {
    fields: [events.createdBy],
    references: [users.id]
  }),
  updatedBy: one(users, {
    fields: [events.updatedBy],
    references: [users.id]
  }),
}));

export type SelectEvent = typeof events.$inferSelect;
export type InsertEvent = typeof events.$inferInsert;

export const eventsInsertSchema = createInsertSchema(events);
export const eventsSelectSchema = createSelectSchema(events);
