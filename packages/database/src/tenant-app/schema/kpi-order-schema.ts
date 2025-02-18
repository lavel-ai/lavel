import { text, timestamp, uuid, primaryKey, integer } from 'drizzle-orm/pg-core';
import { users } from './users-schema';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { pgTable } from 'drizzle-orm/pg-core';

export const kpiOrder = pgTable('kpi_order', {
  userId: uuid('user_id').notNull().references(() => users.id),
  kpiId: text('kpi_id').notNull(), // e.g., 'litigation-cases', 'advisory-cases'
  order: integer('order').notNull(), // The order of the KPI
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return {
    pk: primaryKey(table.userId, table.kpiId), // Composite primary key
  };
});

export type KPIOrder = typeof kpiOrder.$inferSelect;
export type NewKPIOrder = typeof kpiOrder.$inferInsert; 

export const kpiOrderInsertSchema = createInsertSchema(kpiOrder)
export const kpiOrderSelectSchema = createSelectSchema(kpiOrder)
