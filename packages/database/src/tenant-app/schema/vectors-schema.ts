import { uuid, text } from "drizzle-orm/pg-core";
import { pgSchema } from "drizzle-orm/pg-core";
import { pgTable } from "drizzle-orm/pg-core";

export const vectors = pgTable("vectors", {
    id: uuid("id").primaryKey(),
    name: text("name").notNull(),
    description: text("description"),
});

export type Vectors = typeof vectors.$inferSelect;
export type NewVectors = typeof vectors.$inferInsert;