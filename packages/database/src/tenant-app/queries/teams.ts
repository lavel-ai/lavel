import { eq, and } from 'drizzle-orm';
import { teams, teamProfiles, profiles } from '../schema';
import type { TenantDatabase } from '../tenant-connection-db';
import { normalizeTeam } from '../utils/normalize/team';

export type TeamWithMembers = {
  id: string;
  name: string;
  description: string | null;
  practiceArea: string | null;
  department: string | null;
  members: {
    id: string;
    name: string;
    lastName: string;
    maternalLastName: string | null;
    role: string;
    practiceArea: string | null;
    isLeadLawyer: boolean;
  }[];
};

export async function queryTeams(db: TenantDatabase) {
  const teamsWithMembers = await db.query.teams.findMany({
    where: and(
      eq(teams.deletedAt, null)
    ),
    with: {
      teamProfiles: {
        where: eq(teamProfiles.deletedAt, null),
        with: {
          profile: {
            where: eq(profiles.deletedAt, null)
          }
        }
      }
    }
  });

  return teamsWithMembers.map(normalizeTeam);
}

export async function insertTeam(db: TenantDatabase, data: {
  name: string;
  description?: string | null;
  practiceArea?: string | null;
  department?: string | null;
  createdBy: string;
}) {
  const [team] = await db.insert(teams).values(data).returning();
  return team;
}

export async function insertTeamMembers(db: TenantDatabase, data: {
  teamId: string;
  profileId: string;
  role: string;
  createdBy: string;
}[]) {
  const members = await db.insert(teamProfiles).values(data).returning();
  return members;
}
