import { boolean, jsonb, pgSchema, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { pgTable } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').primaryKey(),
  clerkId: text('clerk_id').unique().notNull(),
  signupStatus: text('signup_status').default('awaiting_org'),
  email: text('email').unique().notNull(),
  imageUrl: text('image_url'),
  emailVerified: boolean('email_verified').default(false),
  welcomeEmailSent: boolean('welcome_email_sent').default(false),
  status: boolean('status').default(true),
  lastSignIn: timestamp('last_sign_in', { withTimezone: true }),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// Types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export const usersInsertSchema = createInsertSchema(users);
export const usersSelectSchema = createSelectSchema(users);
