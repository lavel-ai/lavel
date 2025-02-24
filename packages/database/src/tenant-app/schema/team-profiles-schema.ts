import { pgTable } from "drizzle-orm/pg-core";
import { uuid, timestamp, varchar, unique } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { relations } from "drizzle-orm";
import { teams } from "./teams-schema";
import { profiles } from "./profiles-schema";
import { users } from "./users-schema";
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

export const teamProfiles = pgTable("team_profiles", {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    teamId: uuid("team_id").notNull().references(() => teams.id, { onDelete: 'cascade' }),
    profileId: uuid("profile_id").notNull().references(() => profiles.id, { onDelete: 'cascade' }),
    
    // Role in the team
    role: varchar("role", { length: 50 }).notNull().default('member'),
    
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
}, (table) => {
    return {
        // Ensure a profile can only be added to a team once
        uniqueTeamProfile: unique().on(table.teamId, table.profileId)
    };
});

// Define relations
export const teamProfilesRelations = relations(teamProfiles, ({ one }) => ({
    team: one(teams, {
        fields: [teamProfiles.teamId],
        references: [teams.id],
        relationName: "team_profile_team"
    }),
    profile: one(profiles, {
        fields: [teamProfiles.profileId],
        references: [profiles.id],
        relationName: "team_profile_profile"
    }),
    createdByUser: one(users, {
        fields: [teamProfiles.createdBy],
        references: [users.id],
        relationName: "team_profiles_created_by"
    }),
    updatedByUser: one(users, {
        fields: [teamProfiles.updatedBy],
        references: [users.id],
        relationName: "team_profiles_updated_by"
    })
}));

// Type definitions
export type TeamProfile = typeof teamProfiles.$inferSelect;
export type InsertTeamProfile = typeof teamProfiles.$inferInsert;

export const teamProfilesInsertSchema = createInsertSchema(teamProfiles);
export const teamProfilesSelectSchema = createSelectSchema(teamProfiles); 