import { pgSchema } from "drizzle-orm/pg-core";

export const referenceSchema = pgSchema("reference");

// Base tables (no foreign key dependencies)
export * from "./states-schema";
export * from "./cities-schema";
export * from "./law-branches-schema";
export * from "./jurisdictions-schema";

// First level dependencies
export * from "./courthouses-schema";
export * from "./trial-stages-schema";
export * from "./trial-types-schema";

// Second level dependencies
export * from "./trial-stages-types-schema";
export * from "./trial-types-schema";
export * from "./trial-stages-schema";
