import { pgSchema, pgTable } from "drizzle-orm/pg-core";
import { uuid, timestamp, foreignKey, varchar, unique} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { relations } from "drizzle-orm";
import { teams } from "./teams-schema";
import { users } from "./users-schema";
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
export const mainSchema = pgSchema("main");

// Junction table for the many-to-many relationship between teams and profiles
export const teamMembers = mainSchema.table("team_members", {
    
    // Identifiers
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    teamId: uuid("team_id").notNull().references(() => teams.id, { onDelete: 'cascade' }),
    profileId: uuid("profile_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
    role: varchar("role", { length: 50 }).notNull().default('member'),
    
    // Timestamps
    createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' })
        .default(sql`CURRENT_TIMESTAMP`)
        .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
    deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
    
    // Audit fields
    createdBy: uuid("created_by"),
    updatedBy: uuid("updated_by"),
    deletedBy: uuid("deleted_by")
},
(table) => {
    return {
        // Ensure a profile can only be added to a team once
        uniqueTeamMember: unique().on(table.teamId, table.profileId),

        // Foreign key constraints for audit fields
        teamMembersCreatedByFkey: foreignKey({
            columns: [table.createdBy],
            foreignColumns: [users.id],
            name: "team_members_created_by_users_in_auth_id"
        }),
        teamMembersUpdatedByFkey: foreignKey({
            columns: [table.updatedBy],
            foreignColumns: [users.id],
            name: "team_members_updated_by_users_in_auth_id"
        })
    }
});

// Define relations for the team_members table
export const teamMembersRelations = relations(teamMembers, ({ one }) => ({
    team: one(teams, {
        fields: [teamMembers.teamId],
        references: [teams.id],
        relationName: "team_member_team"
    }),
    profile: one(users, {
        fields: [teamMembers.profileId],
        references: [users.id],
        relationName: "team_member_profile"
    }),
    createdByUser: one(users, {
        fields: [teamMembers.createdBy],
        references: [users.id],
        relationName: "team_members_created_by"
    }),
    updatedByUser: one(users, {
        fields: [teamMembers.updatedBy],
        references: [users.id],
        relationName: "team_members_updated_by"
    })
}));

// Type definitions for TypeScript
export type TeamMember = typeof teamMembers.$inferSelect;
export type InsertTeamMember = typeof teamMembers.$inferInsert;

export const teamMembersInsertSchema = createInsertSchema(teamMembers);
export const teamMembersSelectSchema = createSelectSchema(teamMembers);