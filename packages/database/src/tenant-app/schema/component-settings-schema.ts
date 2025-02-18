import {
  text,
  timestamp,
  uuid,
  jsonb,
  integer,
} from 'drizzle-orm/pg-core';
import { users } from './users-schema';
import { relations } from 'drizzle-orm';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { pgTable } from "drizzle-orm/pg-core";

export const componentSettings = pgTable('component_settings', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  componentId: text('component_id').notNull(),
  instanceId: text('instance_id').notNull(),
  settings: jsonb('settings').notNull().$type<any>(),
  order: integer('order').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return {
  };
});

export const componentSettingsRelations = relations(componentSettings, ({ one }) => ({
  user: one(users, {
    fields: [componentSettings.userId],
    references: [users.id],
  }),
}));

export type ComponentSetting = typeof componentSettings.$inferSelect;
export type NewComponentSetting = typeof componentSettings.$inferInsert; 

export const componentSettingsInsertSchema = createInsertSchema(componentSettings)
export const componentSettingsSelectSchema = createSelectSchema(componentSettings)