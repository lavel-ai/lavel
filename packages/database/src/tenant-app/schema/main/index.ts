import { pgSchema } from "drizzle-orm/pg-core";

export const mainSchema = pgSchema("main");

export * from './users-schema';
export * from './ai-interactions-schema';
export * from './case-parties';
export * from './case-schema';
export * from './clients-schema';
export * from './corporations-schema';
export * from './court-participants';
export * from './document-operations-schema';
export * from './document-sessions-schema';
export * from './documents-schema';
export * from './events-schema';
export * from './litigation-details-schema';
export * from './mentions-schema';
export * from './notifications-schema';
export * from './tasks-schema';
export * from './team-members-schema';
export * from './teams-schema';
export * from './time-entries-schema';
export * from './transcriptions-schema';


