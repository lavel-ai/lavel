import { pgSchema } from "drizzle-orm/pg-core";
import { states } from "./states-schema";
import { cities } from "./cities-schema";
import { lawBranches } from "./law-branches-schema";
import { jurisdictions } from "./jurisdictions-schema";
import { courthouses } from "./courthouses-schema";
import { trialStages } from "./trial-stages-schema";
import { trialTypes } from "./trial-types-schema";
import { trialStagesTypes } from "./trial-stages-types-schema";

export const referenceSchema = {

    states,
    cities,
    lawBranches,
    jurisdictions,
    courthouses,
    trialStages,
    trialTypes,
    trialStagesTypes,

} as const;