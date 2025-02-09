import { pgSchema } from "drizzle-orm/pg-core";


export const mainSchema = pgSchema("main");
export const referenceSchema = pgSchema("reference");

export * from "./main";
export * from "./reference";
