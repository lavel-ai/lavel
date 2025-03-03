import { eq, inArray, and, isNull } from "drizzle-orm";
import { teams, teamProfiles, profiles } from "../schema";
import type { TenantDatabase } from "../tenant-connection-db";
import { normalizeTeam } from "../utils/normalize/team";

export type CreateTeamInput = {
  name: string;
  description?: string | null;
  practiceArea: string;
  department: string;
  createdBy: string;
  updatedBy: string;
};

export type CreateTeamMemberInput = {
  userId: string;
  role: 'leader' | 'member';
};

export class TeamQueries {
  constructor(private readonly db: TenantDatabase) {}

  async checkTeamNameExists(name: string): Promise<boolean> {
    const existingTeam = await this.db
      .select({ id: teams.id })
      .from(teams)
      .where(eq(teams.name, name))
      .limit(1);

    return existingTeam.length > 0;
  }

  async verifyMemberProfiles(userIds: string[]) {
    const existingProfiles = await this.db
      .select({
        id: profiles.id,
        userId: profiles.userId,
      })
      .from(profiles)
      .where(inArray(profiles.userId, userIds));

    if (existingProfiles.length !== userIds.length) {
      const missingUsers = userIds.filter(
        userId => !existingProfiles.some(profile => profile.userId === userId)
      );
      throw new Error(`Algunos miembros del equipo no tienen perfiles. Por favor, asegúrate de que todos los miembros hayan completado sus perfiles primero. Faltan perfiles para ${missingUsers.length} miembros.`);
    }

    return existingProfiles;
  }

  async createTeam(input: CreateTeamInput, members: CreateTeamMemberInput[]) {
    try {
      // Check if team name exists
      const exists = await this.checkTeamNameExists(input.name);
      if (exists) {
        throw new Error(`Ya existe un equipo con el nombre "${input.name}"`);
      }

      // Get all user IDs
      const userIds = members.map(member => member.userId);

      // Verify all users have profiles
      const existingProfiles = await this.verifyMemberProfiles(userIds);

      // Create the team
      const [newTeam] = await this.db
        .insert(teams)
        .values({
          name: input.name,
          description: input.description,
          practiceArea: input.practiceArea,
          department: input.department,
          createdBy: input.createdBy,
          updatedBy: input.updatedBy,
        })
        .returning({ id: teams.id });

      // Create team-profile associations with specified roles
      await this.db.insert(teamProfiles).values(
        members.map((member) => {
          const profile = existingProfiles.find(p => p.userId === member.userId);
          if (!profile) {
            throw new Error(`Perfil no encontrado para el miembro del equipo ${member.userId}`);
          }
          return {
            teamId: newTeam.id,
            profileId: profile.id,
            role: member.role,
            createdBy: input.createdBy,
            updatedBy: input.updatedBy,
          };
        })
      );

      return { 
        success: true, 
        teamId: newTeam.id,
        message: `Equipo "${input.name}" creado exitosamente con ${members.length} miembros`
      };
    } catch (error) {
      // Check if the error is a unique constraint violation
      if (error instanceof Error && error.message.includes('teams_name_unique')) {
        throw new Error(`Ya existe un equipo con el nombre "${input.name}"`);
      }
      throw error;
    }
  }
}

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
    where: isNull(teams.deletedAt),
    with: {
      teamProfiles: {
        where: isNull(teamProfiles.deletedAt),
        with: {
          profile: true
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