import { pgSchema } from "drizzle-orm/pg-core";


export const mainSchema = pgSchema("main");
export const referenceSchema = pgSchema("reference");
export const embeddingsSchema = pgSchema("embeddings");

export * from "./main";
export * from "./reference";
export * from "./embeddings";

export const combinedSchema = {main: mainSchema, reference: referenceSchema, embeddings: embeddingsSchema};
