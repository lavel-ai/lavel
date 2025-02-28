import { pgSchema, pgTable } from "drizzle-orm/pg-core";
import { uuid, timestamp, text, foreignKey, varchar } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { relations } from "drizzle-orm";
import { users } from "./users-schema";
// import { notifications } from "./notifications-schema";
import { cases } from "./case-schema";
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { teamProfiles } from "./team-profiles-schema";
import { departments } from "./departments-schema";

export const teams = pgTable("teams", {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    name: varchar("name", { length: 255 }).notNull().unique('teams_name_unique'),
    description: text("description"),
    practiceArea: varchar("practice_area", { length: 255 }),
    departmentId: uuid("department_id").references(() => departments.id, { onDelete: 'set null' }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' })
        .default(sql`CURRENT_TIMESTAMP`)
        .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }),
    deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
    createdBy: uuid("created_by"),
    updatedBy: uuid("updated_by"),
    deletedBy: uuid("deleted_by")
},
(table) => {
    return {
        teamsCreatedByFkey: foreignKey({
            columns: [table.createdBy],
            foreignColumns: [users.id],
            name: "teams_created_by_users_in_auth_id"
        }),
        teamsUpdatedByFkey: foreignKey({
            columns: [table.updatedBy],
            foreignColumns: [users.id],
            name: "teams_updated_by_users_in_auth_id"
        }),
    }
});

export const teamsRelations = relations(teams, ({ one, many }) => ({
    cases: many(cases),
    teamProfiles: many(teamProfiles),
    // notifications: many(notifications),
    department: one(departments, {
        fields: [teams.departmentId],
        references: [departments.id],
        relationName: "team_department"
    }),
    createdByUser: one(users, {
        fields: [teams.createdBy],
        references: [users.id],
        relationName: "teams_created_by"
    }),
    updatedByUser: one(users, {
        fields: [teams.updatedBy],
        references: [users.id],
        relationName: "teams_updated_by"
    }),
}));

export type Team = typeof teams.$inferSelect;
export type InsertTeam = typeof teams.$inferInsert;

export const teamsInsertSchema = createInsertSchema(teams);
export const teamsSelectSchema = createSelectSchema(teams);