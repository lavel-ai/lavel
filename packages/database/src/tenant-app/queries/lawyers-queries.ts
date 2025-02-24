import { eq, and, isNull, or, like, ilike, SQL } from 'drizzle-orm';
import { profiles, teamProfiles } from '../schema';
import type { TenantDatabase } from '../tenant-connection-db';
import { normalizeLawyer } from '../utils/normalize/lawyer';

// TODO: Fix type issues with Drizzle ORM SQL conditions
// Issue: SQL conditions are not properly typed when using or/and functions
// Temporary solution: Using @ts-ignore until we find a proper typing solution

export type LawyerProfile = {
  id: string;
  name: string;
  lastName: string;
  maternalLastName: string | null;
  practiceArea: string | null;
  isLeadLawyer: boolean;
  teams: {
    id: string;
    name: string;
    role: string;
  }[];
};

export interface LawyerFilters {
  search?: string;
  practiceArea?: string[];
  teamId?: string[];
  isLeadLawyer?: boolean;
}

function createSearchCondition(search: string): SQL<unknown> {
  // @ts-ignore: Drizzle ORM typing issue with or conditions
  return or(
    ilike(profiles.name, `%${search}%`),
    ilike(profiles.lastName, `%${search}%`),
    ilike(profiles.practiceArea, `%${search}%`)
  );
}

function createPracticeAreaCondition(areas: string[]): SQL<unknown> {
  // @ts-ignore: Drizzle ORM typing issue with or conditions
  return or(...areas.map(area => eq(profiles.practiceArea, area)));
}

function createTeamCondition(teamIds: string[]): SQL<unknown> {
  // @ts-ignore: Drizzle ORM typing issue with or conditions
  return or(...teamIds.map(id => eq(teamProfiles.teamId, id)));
}

export async function queryLawyers(db: TenantDatabase, filters?: LawyerFilters) {
  const conditions: SQL<unknown>[] = [isNull(profiles.deletedAt)];

  if (filters?.search) {
    conditions.push(createSearchCondition(filters.search));
  }

  if (filters?.practiceArea?.length) {
    conditions.push(createPracticeAreaCondition(filters.practiceArea));
  }

  if (filters?.isLeadLawyer !== undefined) {
    conditions.push(eq(profiles.isLeadLawyer, filters.isLeadLawyer));
  }

  const teamConditions: SQL<unknown>[] = [isNull(teamProfiles.deletedAt)];
  
  if (filters?.teamId?.length) {
    teamConditions.push(createTeamCondition(filters.teamId));
  }

  // @ts-ignore: Drizzle ORM typing issue with and conditions
  const lawyersWithTeams = await db.query.profiles.findMany({
    where: and(...conditions),
    with: {
      teamProfiles: {
        // @ts-ignore: Drizzle ORM typing issue with and conditions
        where: and(...teamConditions),
        with: {
          team: true
        }
      }
    }
  });

  return lawyersWithTeams.map(normalizeLawyer);
}

export async function updateLawyerProfile(db: TenantDatabase, lawyerId: string, data: {
  name?: string;
  lastName?: string;
  maternalLastName?: string | null;
  practiceArea?: string | null;
  isLeadLawyer?: boolean;
  updatedBy: string;
}) {
  const [lawyer] = await db.update(profiles)
    .set({
      ...data,
      updatedAt: new Date().toISOString()
    })
    .where(eq(profiles.id, lawyerId))
    .returning();
  return lawyer;
}

export async function queryTeamMembership(db: TenantDatabase, data: {
  profileId: string;
  teamId: string;
}) {
  return await db.query.teamProfiles.findFirst({
    where: and(
      eq(teamProfiles.profileId, data.profileId),
      eq(teamProfiles.teamId, data.teamId),
      isNull(teamProfiles.deletedAt)
    )
  });
}

export async function insertTeamMembership(db: TenantDatabase, data: {
  profileId: string;
  teamId: string;
  role: string;
  createdBy: string;
}) {
  const [membership] = await db.insert(teamProfiles).values(data).returning();
  return membership;
}
