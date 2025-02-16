// packages/database/src/tenant-app/schema/main/index.ts
import { users } from './users-schema'
import { aiInteractions } from "./ai-interactions-schema";
import { caseParties } from "./case-parties";
import { cases } from './case-schema'
import { clients } from './clients-schema'
import { corporations } from "./corporations-schema";
import { courtParticipations } from "./court-participants";
import { documentOperations } from "./document-operations-schema";
import { documentSessions } from "./document-sessions-schema";
import { documents } from "./documents-schema";
import { events } from "./events-schema";
import { litigationDetails } from "./litigation-details-schema";
import { mentions } from "./mentions-schema";
import { notifications } from "./notifications-schema";
import { tasks } from "./tasks-schema";
import { teamMembers } from "./team-members-schema";
import { teams } from "./teams-schema";
import { timeEntries } from "./time-entries-schema";
import { transcriptions } from "./transcriptions-schema";
import { componentSettings } from "./component-settings-schema";
import { kpiOrder } from "./kpi-order-schema";
import { pgSchema } from 'drizzle-orm/pg-core';

export const mainSchema = pgSchema("main"); 

export const schemaMain = {
    users,
    aiInteractions,
    caseParties,
    cases,
    clients,
    corporations,
    courtParticipations,
    documentOperations,
    documentSessions,
    documents, 
    events,
    litigationDetails,
    mentions,
    notifications,
    tasks,
    teamMembers,
    teams,
    timeEntries,
    transcriptions,
    componentSettings,
    kpiOrder
}
