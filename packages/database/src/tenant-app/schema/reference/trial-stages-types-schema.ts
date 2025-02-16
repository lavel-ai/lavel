import { integer, primaryKey, pgSchema } from "drizzle-orm/pg-core";
import { trialStages } from "./trial-stages-schema";
import { trialTypes } from "./trial-types-schema";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { referenceSchema } from "./reference-schema-instance";

export const trialStagesTypes = referenceSchema.table("trial_stages_types", {
    trialStageId: integer("trial_stage_id").notNull().references(() => trialStages.id, { onDelete: "cascade" }),
    trialTypeId: integer("trial_type_id").notNull().references(() => trialTypes.id, { onDelete: "cascade" }),
}, (table) => ({
    pk: primaryKey({ columns: [table.trialStageId, table.trialTypeId] }),
}));

export const trialStagesTypesRelations = relations(trialStagesTypes, ({ one }) => ({
    trialStage: one(trialStages, {
        fields: [trialStagesTypes.trialStageId],
        references: [trialStages.id],
    }),
    trialType: one(trialTypes, {
        fields: [trialStagesTypes.trialTypeId],
        references: [trialTypes.id],
    }),
})); 

export type TrialStageType = typeof trialStagesTypes.$inferSelect;
export type NewTrialStageType = typeof trialStagesTypes.$inferInsert;

export const trialStageTypeInsertSchema = createInsertSchema(trialStagesTypes);
export const trialStageTypeSelectSchema = createSelectSchema(trialStagesTypes);