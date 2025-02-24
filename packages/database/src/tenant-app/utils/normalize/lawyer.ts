import type { LawyerProfile } from '../../queries/lawyers-queries';

export function normalizeLawyer(lawyer: any): LawyerProfile {
  return {
    id: lawyer.id,
    name: lawyer.name,
    lastName: lawyer.lastName,
    maternalLastName: lawyer.maternalLastName,
    practiceArea: lawyer.practiceArea,
    isLeadLawyer: lawyer.isLeadLawyer,
    teams: lawyer.teamProfiles.map((tp: any) => ({
      id: tp.team.id,
      name: tp.team.name,
      role: tp.role
    }))
  };
}
