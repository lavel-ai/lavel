import { pgSchema, pgTable } from "drizzle-orm/pg-core";
import { uuid, timestamp, text, foreignKey, varchar } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { relations } from "drizzle-orm";
import { users } from "./users-schema";
// import { notifications } from "./notifications-schema";
import { cases } from "./case-schema";
import { teamMembers } from "./team-members-schema";
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { mainSchema } from "./main-schema-instance";

export const teams = mainSchema.table("teams", {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
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
    teamMembers: many(teamMembers),
    // notifications: many(notifications),
    createdByUser: one(users, {
        fields: [teams.createdBy],
        references: [users.id],
        relationName: "teams_created_by"
    }),
    updatedByUser: one(users, {
        fields: [teams.updatedBy],
        references: [users.id],
        relationName: "teams_updated_by"
    })
}));

export type Team = typeof teams.$inferSelect;
export type InsertTeam = typeof teams.$inferInsert;

export const teamsInsertSchema = createInsertSchema(teams);
export const teamsSelectSchema = createSelectSchema(teams);