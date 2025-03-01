import { pgTable } from "drizzle-orm/pg-core";
import { uuid, timestamp, integer, unique, boolean } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { relations } from "drizzle-orm";
import { profiles } from "./profiles-schema";
import { lawBranches } from "./law-branches-schema";
import { users } from "./users-schema";
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

export const profilePracticeAreas = pgTable("profile_practice_areas", {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    profileId: uuid("profile_id").notNull().references(() => profiles.id, { onDelete: 'cascade' }),
    lawBranchId: integer("law_branch_id").notNull().references(() => lawBranches.id, { onDelete: 'cascade' }),
    
    // Is this their primary practice area?
    isPrimary: boolean("is_primary").default(false).notNull(),
    
    // Experience level in this practice area (could be used for filtering or displaying expertise)
    experienceYears: integer("experience_years"),
    
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
        // Ensure a profile can only have a specific law branch once
        uniqueProfileLawBranch: unique().on(table.profileId, table.lawBranchId)
    };
});

// Define relations
export const profilePracticeAreasRelations = relations(profilePracticeAreas, ({ one }) => ({
    profile: one(profiles, {
        fields: [profilePracticeAreas.profileId],
        references: [profiles.id],
        relationName: "profile_practice_area_profile"
    }),
    lawBranch: one(lawBranches, {
        fields: [profilePracticeAreas.lawBranchId],
        references: [lawBranches.id],
        relationName: "profile_practice_area_law_branch"
    }),
    createdByUser: one(users, {
        fields: [profilePracticeAreas.createdBy],
        references: [users.id],
        relationName: "profile_practice_areas_created_by"
    }),
    updatedByUser: one(users, {
        fields: [profilePracticeAreas.updatedBy],
        references: [users.id],
        relationName: "profile_practice_areas_updated_by"
    })
}));

// Type definitions
export type ProfilePracticeArea = typeof profilePracticeAreas.$inferSelect;
export type InsertProfilePracticeArea = typeof profilePracticeAreas.$inferInsert;

export const profilePracticeAreasInsertSchema = createInsertSchema(profilePracticeAreas);
export const profilePracticeAreasSelectSchema = createSelectSchema(profilePracticeAreas); 