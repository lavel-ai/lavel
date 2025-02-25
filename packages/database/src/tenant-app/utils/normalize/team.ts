import { teamProfiles, teams, profiles } from "../../schema";
import { TeamWithMembers } from "../../queries/teams";

export function normalizeTeam(team: typeof teams.$inferSelect & {
  teamProfiles: (typeof teamProfiles.$inferSelect & {
    profile: typeof profiles.$inferSelect
  })[];
}): TeamWithMembers {
  return {
    id: team.id,
    name: team.name,
    description: team.description,
    practiceArea: team.practiceArea,
    department: team.department,
    members: team.teamProfiles.map(tp => ({
      id: tp.profile.id,
      name: tp.profile.name,
      lastName: tp.profile.lastName,
      maternalLastName: tp.profile.maternalLastName,
      role: tp.role,
      practiceArea: tp.profile.practiceArea,
      isLeadLawyer: tp.profile.isLeadLawyer ?? false
    }))
  };
}
