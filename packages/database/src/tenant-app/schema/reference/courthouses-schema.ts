import { pgTable, text, timestamp, integer, jsonb, foreignKey, pgSchema } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { cities } from "./cities-schema";
import { jurisdictions } from "./jurisdictions-schema";
import { lawBranches } from "./law-branches-schema";
import { states } from "./states-schema";
import { relations } from "drizzle-orm/relations";
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
export const referenceSchema = pgSchema("reference");

export const courthouses = referenceSchema.table("courthouses", {
	id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
	name: text("name").notNull(),
	contactInfo: jsonb("contact_info"),
	judicialDistrict: text("judicial_district"),
	cityId: integer("city_id"),
	lawBranchId: integer("law_branch_id"),
	parentId: integer("parent_id"),
	jurisdictionId: integer("jurisdiction_id"),
	abbreviation: text("abbreviation"),
	stateId: integer("state_id"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).default(sql`(now() AT TIME ZONE 'utc'::text)`).notNull(),
},
(table) => {
	return {
		courthousesCityIdFkey: foreignKey({
			columns: [table.cityId],
			foreignColumns: [cities.id],
			name: "courthouses_city_id_fkey"
		}),
		courthousesJurisdictionIdFkey: foreignKey({
			columns: [table.jurisdictionId],
			foreignColumns: [jurisdictions.id],
			name: "courthouses_jurisdiction_id_fkey"
		}),
		courthousesLawBranchIdFkey: foreignKey({
			columns: [table.lawBranchId],
			foreignColumns: [lawBranches.id],
			name: "courthouses_law_branch_id_fkey"
		}),
		courthousesParentIdFkey: foreignKey({
			columns: [table.parentId],
			foreignColumns: [table.id],
			name: "courthouses_parent_id_fkey"
		}),
		courthousesStateIdFkey: foreignKey({
			columns: [table.stateId],
			foreignColumns: [states.id],
			name: "courthouses_state_id_fkey"
		}),
	}
});

export const courthousesRelations = relations(courthouses, ({one, many}) => ({
	city: one(cities, {
		fields: [courthouses.cityId],
		references: [cities.id]
	}),
	jurisdiction: one(jurisdictions, {
		fields: [courthouses.jurisdictionId],
		references: [jurisdictions.id]
	}),
	lawBranch: one(lawBranches, {
		fields: [courthouses.lawBranchId],
		references: [lawBranches.id]
	}),
	courthouse: one(courthouses, {
		fields: [courthouses.parentId],
		references: [courthouses.id],
		relationName: "courthouses_parentId_courthouses_id"
	}),
	courthouses: many(courthouses, {
		relationName: "courthouses_parentId_courthouses_id"
	}),
	state: one(states, {
		fields: [courthouses.stateId],
		references: [states.id]
	}),
}));

export type Courthouse = typeof courthouses.$inferSelect;
export type NewCourthouse = typeof courthouses.$inferInsert;

export const courthouseInsertSchema = createInsertSchema(courthouses);
export const courthouseSelectSchema = createSelectSchema(courthouses);