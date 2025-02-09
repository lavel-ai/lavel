import { sql } from "drizzle-orm";
import { integer, timestamp, varchar, unique, pgSchema, pgTable } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { courthouses } from "./courthouses-schema";
import { trialTypes } from "./trial-types-schema";
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

export const referenceSchema = pgSchema("reference");

export const lawBranches = referenceSchema.table("law_branches", {
	id: integer("id").primaryKey().generatedByDefaultAsIdentity({ name: "law_branches_id2_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	name: varchar("name").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
},
(table) => {
	return {
		lawBranchesNameKey: unique("law_branches_name_key").on(table.name),
	}
});

export const lawBranchesRelations = relations(lawBranches, ({many}) => ({
	courthouses: many(courthouses),
	trialTypes: many(trialTypes),
}));

export type LawBranch = typeof lawBranches.$inferSelect;
export type NewLawBranch = typeof lawBranches.$inferInsert;

export const lawBranchInsertSchema = createInsertSchema(lawBranches);
export const lawBranchSelectSchema = createSelectSchema(lawBranches);
