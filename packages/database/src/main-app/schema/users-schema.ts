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

export const users = pgTable('users', {
  id: uuid('id').primaryKey().unique(),
  clerkId: text('clerk_id').unique().notNull(),
  signupStatus: text('signup_status').default('awaiting_org'),
  email: text('email').unique().notNull(),
  firstName: text('first_name'),
  lastName: text('last_name'),
  imageUrl: text('image_url'),
  emailVerified: boolean('email_verified').default(false),
  welcomeEmailSent: boolean('welcome_email_sent').default(false),
  status: text('status').default('active'),
  lastSignIn: timestamp('last_sign_in', { withTimezone: true }),
  isActive: boolean('is_active').default(true),
  isDeleted: boolean('is_deleted').default(false),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  organizations: many(organizationMembers),
}));

// Types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export const userInsertSchema = createInsertSchema(users);
export const userSelectSchema = createSelectSchema(users);
