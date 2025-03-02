import { sql } from "drizzle-orm";
import { integer, timestamp, varchar, unique, pgSchema, pgTable, boolean, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { courthouses } from "./courthouses-schema";
import { trialTypes } from "./trial-types-schema";
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { profilePracticeAreas } from "./profile-practice-areas-schema";
import { teamPracticeAreas } from "./team-practice-areas-schema";

export const lawBranches = pgTable("law_branches", {
	id: integer("id").primaryKey().generatedByDefaultAsIdentity({ name: "law_branches_id2_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	name: varchar("name").notNull(),
	description: varchar("description", { length: 500 }),
	active: boolean("active").default(true).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
	createdBy: uuid("created_by").notNull(),
	updatedBy: uuid("updated_by").notNull(),
	deletedBy: uuid("deleted_by"),
},
(table) => {
	return {
		lawBranchesNameKey: unique("law_branches_name_key").on(table.name),
	}
});

export const lawBranchesRelations = relations(lawBranches, ({many}) => ({
	courthouses: many(courthouses),
	trialTypes: many(trialTypes),
	profilePracticeAreas: many(profilePracticeAreas),
	teamPracticeAreas: many(teamPracticeAreas),
}));

export type LawBranch = typeof lawBranches.$inferSelect;
export type NewLawBranch = typeof lawBranches.$inferInsert;

export const lawBranchInsertSchema = createInsertSchema(lawBranches);
export const lawBranchSelectSchema = createSelectSchema(lawBranches);
