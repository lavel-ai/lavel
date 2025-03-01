## SpecStory

## Database Schema Rearchitecture for Lawyers (2/28/2025, 2:59:57 PM)

_**User**_

I need to rearchitect my schema for my database, the use case is the following: 

1. a user has a profile
2. a profile is a lawyer and a lawyer can have multiple practice areas, we can take advantage of the @law-branches-schema.ts so we can reference what type of law he practices, it can also be associated with more than 1 area of expertise 
3. a layer belongs to a team @teams-schema.ts @team-profiles-schema.ts and it can belong to more than one 

would we need to create another junction table? 
would we need to update the schema for teams? 


---

_**Assistant**_

<think>Let me analyze the current schema and requirements:

1. A user has a profile
2. A profile is a lawyer, and a lawyer can have multiple practice areas
3. A lawyer can be associated with more than 1 area of expertise (referencing law branches)
4. A lawyer belongs to a team and can belong to more than one team

Looking at the files:

1. `profiles-schema.ts` - Has a linter error where it references `law.id` which doesn't exist
2. `law-branches-schema.ts` - Contains the law branches definition
3. `teams-schema.ts` - Teams definition
4. `team-profiles-schema.ts` - Junction table connecting profiles to teams

Issues/Changes needed:

1. Fix the `practiceArea` reference in profiles-schema.ts. It's currently trying to reference a non-existent `law.id`
2. Since a lawyer (profile) can have multiple practice areas, we need a junction table between profiles and law branches
3. The relationship between teams and profiles is already handled by the team-profiles-schema.ts junction table

Let's outline the changes needed:
1. Create a new junction table `profile_practice_areas` to link profiles to law branches
2. Update the `profiles` schema to remove the incorrect reference to `law.id`
3. Set up the proper relations between profiles and law branches through the new junction table</think>Based on your requirements, I can see that we need to rearchitect the database schema to properly handle the relationships between profiles (lawyers), their practice areas, and their team associations. Let me analyze the current architecture and propose solutions.

## Current Issues

1. In `profiles-schema.ts`, there's a linter error where it references `practiceArea: integer("practice_area").references(() => law.id)`, but `law` doesn't exist. It should likely reference the `lawBranches` table.

2. Currently, a profile can only have one practice area, but your requirement is that a lawyer can have multiple practice areas.

3. The relationship between lawyers and teams appears correctly set up through the `team-profiles-schema.ts` junction table.

## Proposed Solution

We need a junction table to handle the many-to-many relationship between profiles (lawyers) and their practice areas. Here's what I recommend:

---

_****_

```diff
  import { teamProfiles } from "./team-profiles-schema";
  import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
+ import { profilePracticeAreas } from "./profile-practice-areas-schema";
  
  export const profiles = pgTable("profiles", {
  
      // Professional Information
-     practiceArea: integer("practice_area").references(() => law.id),
      seniority: date("seniority"),
      isLeadLawyer: boolean("is_lead_lawyer").default(false),
      }),
      teamProfiles: many(teamProfiles),
+     practiceAreas: many(profilePracticeAreas),
      createdByUser: one(users, {
          fields: [profiles.createdBy],
```

---

_****_



Now I need to create the new junction table for the many-to-many relationship between profiles and law branches:

---

_****_

```diff
- 
+ import { pgTable } from "drizzle-orm/pg-core";
+ import { uuid, timestamp, integer, unique } from "drizzle-orm/pg-core";
+ import { sql } from "drizzle-orm";
+ import { relations } from "drizzle-orm";
+ import { profiles } from "./profiles-schema";
+ import { lawBranches } from "./law-branches-schema";
+ import { users } from "./users-schema";
+ import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
+ 
+ export const profilePracticeAreas = pgTable("profile_practice_areas", {
+     id: uuid("id").defaultRandom().primaryKey().notNull(),
+     profileId: uuid("profile_id").notNull().references(() => profiles.id, { onDelete: 'cascade' }),
+     lawBranchId: integer("law_branch_id").notNull().references(() => lawBranches.id, { onDelete: 'cascade' }),
+     
+     // Is this their primary practice area?
+     isPrimary: boolean("is_primary").default(false).notNull(),
+     
+     // Experience level in this practice area (could be used for filtering or displaying expertise)
+     experienceYears: integer("experience_years"),
+     
+     // Timestamps
+     createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' })
+         .default(sql`CURRENT_TIMESTAMP`)
+         .notNull(),
+     updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' })
+         .default(sql`CURRENT_TIMESTAMP`)
+         .notNull(),
+     deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
+     
+     // Audit fields
+     createdBy: uuid("created_by").references(() => users.id),
+     updatedBy: uuid("updated_by").references(() => users.id),
+     deletedBy: uuid("deleted_by").references(() => users.id)
+ }, (table) => {
+     return {
+         // Ensure a profile can only have a specific law branch once
+         uniqueProfileLawBranch: unique().on(table.profileId, table.lawBranchId)
+     };
+ });
+ 
+ // Define relations
+ export const profilePracticeAreasRelations = relations(profilePracticeAreas, ({ one }) => ({
+     profile: one(profiles, {
+         fields: [profilePracticeAreas.profileId],
+         references: [profiles.id],
+         relationName: "profile_practice_area_profile"
+     }),
+     lawBranch: one(lawBranches, {
+         fields: [profilePracticeAreas.lawBranchId],
+         references: [lawBranches.id],
+         relationName: "profile_practice_area_law_branch"
+     }),
+     createdByUser: one(users, {
+         fields: [profilePracticeAreas.createdBy],
+         references: [users.id],
+         relationName: "profile_practice_areas_created_by"
+     }),
+     updatedByUser: one(users, {
+         fields: [profilePracticeAreas.updatedBy],
+         references: [users.id],
+         relationName: "profile_practice_areas_updated_by"
+     })
+ }));
+ 
+ // Type definitions
+ export type ProfilePracticeArea = typeof profilePracticeAreas.$inferSelect;
+ export type InsertProfilePracticeArea = typeof profilePracticeAreas.$inferInsert;
+ 
+ export const profilePracticeAreasInsertSchema = createInsertSchema(profilePracticeAreas);
+ export const profilePracticeAreasSelectSchema = createSelectSchema(profilePracticeAreas); 
```

---

_****_



Let me fix the linter errors in the profile-practice-areas-schema.ts file:

---

_****_

```diff
  import { pgTable } from "drizzle-orm/pg-core";
- import { uuid, timestamp, integer, unique } from "drizzle-orm/pg-core";
+ import { uuid, timestamp, integer, unique, boolean } from "drizzle-orm/pg-core";
  import { sql } from "drizzle-orm";
  import { relations } from "drizzle-orm";
```

---

_****_



Now, let's update the law-branches-schema.ts to include the relations with profile practice areas:

---

_****_

```diff
  import { trialTypes } from "./trial-types-schema";
  import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
+ import { profilePracticeAreas } from "./profile-practice-areas-schema";
  
  export const lawBranches = pgTable("law_branches", {
  	courthouses: many(courthouses),
  	trialTypes: many(trialTypes),
+ 	profilePracticeAreas: many(profilePracticeAreas),
  }));
  
```

---

_****_





Let's check if we need to update the teams schema. The current schema for teams has a `practiceArea` field that is a VARCHAR, but this may not be sufficient for the new design where we want to link to lawBranches:

---

_****_

```diff
  import { teamProfiles } from "./team-profiles-schema";
  import { departments } from "./departments-schema";
+ import { teamPracticeAreas } from "./team-practice-areas-schema";
  
  export const teams = pgTable("teams", {
      id: uuid("id").defaultRandom().primaryKey().notNull(),
      name: varchar("name", { length: 255 }).notNull().unique('teams_name_unique'),
      description: text("description"),
-     practiceArea: varchar("practice_area", { length: 255 }),
      departmentId: uuid("department_id").references(() => departments.id, { onDelete: 'set null' }),
      createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' })
      cases: many(cases),
      teamProfiles: many(teamProfiles),
+     practiceAreas: many(teamPracticeAreas),
      // notifications: many(notifications),
      department: one(departments, {
```

---

_****_





Now I need to create the team-practice-areas-schema.ts file to handle the many-to-many relationship between teams and law branches:

---

_****_

```diff
- 
+ import { pgTable } from "drizzle-orm/pg-core";
+ import { uuid, timestamp, integer, unique, boolean } from "drizzle-orm/pg-core";
+ import { sql } from "drizzle-orm";
+ import { relations } from "drizzle-orm";
+ import { teams } from "./teams-schema";
+ import { lawBranches } from "./law-branches-schema";
+ import { users } from "./users-schema";
+ import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
+ 
+ export const teamPracticeAreas = pgTable("team_practice_areas", {
+     id: uuid("id").defaultRandom().primaryKey().notNull(),
+     teamId: uuid("team_id").notNull().references(() => teams.id, { onDelete: 'cascade' }),
+     lawBranchId: integer("law_branch_id").notNull().references(() => lawBranches.id, { onDelete: 'cascade' }),
+     
+     // Is this the team's primary practice area?
+     isPrimary: boolean("is_primary").default(false).notNull(),
+     
+     // Timestamps
+     createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' })
+         .default(sql`CURRENT_TIMESTAMP`)
+         .notNull(),
+     updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' })
+         .default(sql`CURRENT_TIMESTAMP`)
+         .notNull(),
+     deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
+     
+     // Audit fields
+     createdBy: uuid("created_by").references(() => users.id),
+     updatedBy: uuid("updated_by").references(() => users.id),
+     deletedBy: uuid("deleted_by").references(() => users.id)
+ }, (table) => {
+     return {
+         // Ensure a team can only have a specific law branch once
+         uniqueTeamLawBranch: unique().on(table.teamId, table.lawBranchId)
+     };
+ });
+ 
+ // Define relations
+ export const teamPracticeAreasRelations = relations(teamPracticeAreas, ({ one }) => ({
+     team: one(teams, {
+         fields: [teamPracticeAreas.teamId],
+         references: [teams.id],
+         relationName: "team_practice_area_team"
+     }),
+     lawBranch: one(lawBranches, {
+         fields: [teamPracticeAreas.lawBranchId],
+         references: [lawBranches.id],
+         relationName: "team_practice_area_law_branch"
+     }),
+     createdByUser: one(users, {
+         fields: [teamPracticeAreas.createdBy],
+         references: [users.id],
+         relationName: "team_practice_areas_created_by"
+     }),
+     updatedByUser: one(users, {
+         fields: [teamPracticeAreas.updatedBy],
+         references: [users.id],
+         relationName: "team_practice_areas_updated_by"
+     })
+ }));
+ 
+ // Type definitions
+ export type TeamPracticeArea = typeof teamPracticeAreas.$inferSelect;
+ export type InsertTeamPracticeArea = typeof teamPracticeAreas.$inferInsert;
+ 
+ export const teamPracticeAreasInsertSchema = createInsertSchema(teamPracticeAreas);
+ export const teamPracticeAreasSelectSchema = createSelectSchema(teamPracticeAreas); 
```

---

_****_





Finally, let's update the lawBranches schema to include the new relation with teamPracticeAreas:

---

_****_

```diff
  import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
  import { profilePracticeAreas } from "./profile-practice-areas-schema";
+ import { teamPracticeAreas } from "./team-practice-areas-schema";
  
  export const lawBranches = pgTable("law_branches", {
  	trialTypes: many(trialTypes),
  	profilePracticeAreas: many(profilePracticeAreas),
+ 	teamPracticeAreas: many(teamPracticeAreas),
  }));
  
```

---

_****_



## Database Schema Rearchitecture - Summary

I've rearchitected the database schema to address your requirements for managing lawyers (profiles), practice areas, and teams. Here's a summary of the changes:

### 1. Profile to Practice Areas (Many-to-Many)
- Created a new junction table `profile_practice_areas` that links profiles to law branches
- Removed the single `practiceArea` field from the profiles table
- Added relations between profiles and the new junction table
- Each profile can now be associated with multiple practice areas
- Added extra fields to track experience levels and primary practice areas

### 2. Team to Practice Areas (Many-to-Many)
- Created a new junction table `team_practice_areas` that links teams to law branches
- Replaced the simple `practiceArea` string field in teams with this more structured approach
- Added relations between teams and the new junction table
- Each team can now be associated with multiple practice areas

### 3. Law Branches Updates
- Extended the lawBranches schema with relations to both junction tables
- This allows for better querying and data integrity

### 4. Existing Features Preserved
- The existing relationship between profiles and teams through team_profiles remains intact
- All the audit fields (created/updated/deleted by and timestamps) are preserved in the new tables

## Implementation Analysis

This new schema structure offers several benefits:

1. **Improved Data Consistency**: By using foreign keys to reference law branches instead of a simple string field, we maintain data consistency and integrity.

2. **Enhanced Querying Capabilities**: The new structure allows more complex queries, such as finding all profiles with a specific practice area or all teams focused on particular law branches.

3. **Flexibility**: Lawyers can now have multiple practice areas with different levels of expertise, providing a more accurate representation of their skills.

4. **Scalability**: The schema will scale well as you add more lawyers and teams, without introducing data redundancy.

## Next Steps

1. **Data Migration**: You'll need to create a migration to move existing data from the old structure to the new junction tables.

2. **API Updates**: Update any API endpoints or services that interact with these tables to handle the new relationships.

3. **UI Updates**: Modify the user interface to allow selection of multiple practice areas for both profiles and teams.

4. **Query Optimization**: Consider creating indexes on the junction tables to improve query performance, especially if you'll be filtering by practice areas frequently.

Would you like me to explain any aspect of this rearchitecture in more detail?

---

_**User**_

Ok we now need to create a combobox that just like we did in@lawyer-combobox.tsx we return give the user a the list of practice areas that he can select, the user has to be able to select more than 1 and we need to return the name and the id so that we can later on pass this id to our form. 

we will focus only on the creation of: 
1. combobox
2. server actions
3. and the queries

---

_**Assistant**_

<think>Let's analyze what we need to create:

1. A multi-select combobox for practice areas, similar to the LawyerCombobox
2. Server actions to fetch practice areas
3. Database queries to support this

The key differences from the lawyer-combobox.tsx are:
- This needs to handle multiple selections (multi-select)
- We'll be working with law branches as practice areas
- We need to return both id and name for each practice area

Let's start by thinking about the components we need to create:</think>I'll create a multi-select combobox for practice areas similar to the lawyer-combobox, but adapted for multiple selections. Let's start with developing each part.

## 1. First, let's create the Practice Areas Combobox Component

---

_****_



---

_****_



---



---

