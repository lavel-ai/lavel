import { varchar, timestamp,  integer, unique, pgSchema } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"
import { relations } from "drizzle-orm/relations"
import { courthouses } from "./courthouses-schema"
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { referenceSchema } from "./reference-schema-instance";

export const jurisdictions = referenceSchema.table("jurisdictions", {
	id: integer("id").primaryKey().generatedByDefaultAsIdentity({ name: "jurisdictions_id2_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	name: varchar("name").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
},
(table) => {
	return {
		jurisdictionsNameKey: unique("jurisdictions_name_key").on(table.name),
	}
});

export const jurisdictionsRelations = relations(jurisdictions, ({many}) => ({
	courthouses: many(courthouses),
}));

export type Jurisdiction = typeof jurisdictions.$inferSelect;
export type NewJurisdiction = typeof jurisdictions.$inferInsert;

export const jurisdictionInsertSchema = createInsertSchema(jurisdictions);
export const jurisdictionSelectSchema = createSelectSchema(jurisdictions);
