import { relations } from 'drizzle-orm';
import {
  boolean,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { organizationMembers } from './organizations-members-schema';
import { projects } from './projects-schema';

export const organizations = pgTable('organizations', {
  id: uuid('id').primaryKey().defaultRandom(),
  clerkId: text('clerk_id').unique(),
  name: text('name'),
  slug: text('slug').unique(),
  subdomainSlug: text('subdomain_slug').unique(),
  logoUrl: text('logo_url'),
  hasProject: boolean('has_project').default(false).notNull(),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  createdBy: uuid('created_by'),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const organizationsRelations = relations(organizations, ({ many }) => ({
  members: many(organizationMembers),
  projects: many(projects),
}));

// Types
export type Organization = typeof organizations.$inferSelect;
export type NewOrganization = typeof organizations.$inferInsert;

export const organizationInsertSchema = createInsertSchema(organizations);
export const organizationSelectSchema = createSelectSchema(organizations);
