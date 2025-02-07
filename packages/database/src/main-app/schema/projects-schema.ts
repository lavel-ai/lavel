import { uuid, pgTable, timestamp, varchar } from "drizzle-orm/pg-core"
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { organizations } from "./organizations-schema";
import { relations } from "drizzle-orm";

export const projects = pgTable('projects', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: varchar('project_id').notNull(),
  organizationId: uuid('organization_id').notNull(),
  connectionUrl: varchar('connection_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const projectsRelations = relations(projects, ({ one }) => ({
  organization: one(organizations, {
    fields: [projects.organizationId],
    references: [organizations.id],
  }),
}));

// Types
export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;

// Schemas
export const projectInsertSchema = createInsertSchema(projects);
export const projectSelectSchema = createSelectSchema(projects);