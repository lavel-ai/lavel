import { pgTable, text, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-zod';
import { relations } from "drizzle-orm";
import { teams } from "./teams-schema";

export const departments = pgTable("departments", {
    id: uuid("id").primaryKey().defaultRandom().notNull(),
    name: text("name").notNull(),
    description: text("description"),
});

export const departmentsRelations = relations(departments, ({ many }) => ({
    teams: many(teams, { relationName: "team_department" })
}));

export type Department = typeof departments.$inferSelect;   
export type DepartmentWith = typeof departments.$inferSelect;

export const CreateDepartment = createInsertSchema(departments);
export const UpdateDepartment = createUpdateSchema(departments);
