// packages/database/src/tenant-app/schema/index.ts
import { mainSchema, schemaMain } from "./main/index";
import { referenceSchema } from "./reference";
import { embeddingsSchema } from "./embeddings";

export const combinedSchemaForMigrations = {
    main: mainSchema, 
    embeddings: embeddingsSchema,
    reference: referenceSchema
} as const;

export const combinedSchema = {
    ...schemaMain,
    ...embeddingsSchema, 
    ...referenceSchema
} as const;
