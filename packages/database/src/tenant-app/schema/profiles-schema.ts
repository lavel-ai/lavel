import { pgTable } from "drizzle-orm/pg-core";
import { uuid, timestamp, varchar, date, boolean } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { relations } from "drizzle-orm";
import { users } from "./users-schema";
import { teamProfiles } from "./team-profiles-schema";
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

export const profiles = pgTable("profiles", {
    // Identifiers
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
    
    // Personal Information
    name: varchar("name", { length: 255 }).notNull(),
    lastName: varchar("last_name", { length: 255 }).notNull(),
    maternalLastName: varchar("maternal_last_name", { length: 255 }),
    phoneNumber: varchar("phone_number", { length: 255 }),
    birthDate: date("birth_date"),

    // Professional Information
    practiceArea: varchar("practice_area", { length: 255 }),
    seniority: date("seniority"),
    isLeadLawyer: boolean("is_lead_lawyer").default(false),
    
    // Timestamps
    createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' })
        .default(sql`CURRENT_TIMESTAMP`)
        .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' })
        .default(sql`CURRENT_TIMESTAMP`)
        .notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
    
    // Audit fields
    createdBy: uuid("created_by").references(() => users.id),
    updatedBy: uuid("updated_by").references(() => users.id),
    deletedBy: uuid("deleted_by").references(() => users.id)
});

// Define relations
export const profilesRelations = relations(profiles, ({ one, many }) => ({
    user: one(users, {
        fields: [profiles.userId],
        references: [users.id],
        relationName: "profile_user"
    }),
    teamProfiles: many(teamProfiles),
    createdByUser: one(users, {
        fields: [profiles.createdBy],
        references: [users.id],
        relationName: "profiles_created_by"
    }),
    updatedByUser: one(users, {
        fields: [profiles.updatedBy],
        references: [users.id],
        relationName: "profiles_updated_by"
    })
}));

// Type definitions
export type Profile = typeof profiles.$inferSelect;
export type InsertProfile = typeof profiles.$inferInsert;

export const profilesInsertSchema = createInsertSchema(profiles);
export const profilesSelectSchema = createSelectSchema(profiles); 