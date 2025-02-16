import { uuid, text } from "drizzle-orm/pg-core";
import { embeddingsSchema } from "./embeddings-schema-instance";


export const embeddings = embeddingsSchema.table("embeddings", {
    id: uuid("id").primaryKey(),
    name: text("name").notNull(),
    description: text("description"),
});

export type Embeddings = typeof embeddings.$inferSelect;
export type NewEmbeddings = typeof embeddings.$inferInsert;