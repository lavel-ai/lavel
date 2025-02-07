import {
  boolean,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  userId: uuid('user_id').primaryKey().defaultRandom(),
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
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// Types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
