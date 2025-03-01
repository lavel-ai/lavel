import { pgTable } from "drizzle-orm/pg-core";
import { uuid, timestamp, integer, unique, boolean } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { relations } from "drizzle-orm";
import { teams } from "./teams-schema";
import { lawBranches } from "./law-branches-schema";
import { users } from "./users-schema";
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

export const teamPracticeAreas = pgTable("team_practice_areas", {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    teamId: uuid("team_id").notNull().references(() => teams.id, { onDelete: 'cascade' }),
    lawBranchId: integer("law_branch_id").notNull().references(() => lawBranches.id, { onDelete: 'cascade' }),
    
    // Is this the team's primary practice area?
    isPrimary: boolean("is_primary").default(false).notNull(),
    
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
        // Ensure a team can only have a specific law branch once
        uniqueTeamLawBranch: unique().on(table.teamId, table.lawBranchId)
    };
});

// Define relations
export const teamPracticeAreasRelations = relations(teamPracticeAreas, ({ one }) => ({
    team: one(teams, {
        fields: [teamPracticeAreas.teamId],
        references: [teams.id],
        relationName: "team_practice_area_team"
    }),
    lawBranch: one(lawBranches, {
        fields: [teamPracticeAreas.lawBranchId],
        references: [lawBranches.id],
        relationName: "team_practice_area_law_branch"
    }),
    createdByUser: one(users, {
        fields: [teamPracticeAreas.createdBy],
        references: [users.id],
        relationName: "team_practice_areas_created_by"
    }),
    updatedByUser: one(users, {
        fields: [teamPracticeAreas.updatedBy],
        references: [users.id],
        relationName: "team_practice_areas_updated_by"
    })
}));

// Type definitions
export type TeamPracticeArea = typeof teamPracticeAreas.$inferSelect;
export type InsertTeamPracticeArea = typeof teamPracticeAreas.$inferInsert;

export const teamPracticeAreasInsertSchema = createInsertSchema(teamPracticeAreas);
export const teamPracticeAreasSelectSchema = createSelectSchema(teamPracticeAreas); 