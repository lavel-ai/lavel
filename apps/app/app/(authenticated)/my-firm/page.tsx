import { getAvailableTeamMembers } from "../features/shared/actions/team-members-actions";
import { CreateTeamDialog } from "../features/teams/components/create-team-dialog";
import { createTeam } from "../features/teams/actions/create-team";

export default async function MyFirmPage() {
  // Fetch available team members at the page level
  const availableMembers = await getAvailableTeamMembers();

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">My Firm</h1>
        <CreateTeamDialog 
          users={availableMembers}
          createTeam={createTeam}
        />
      </div>
      
      {/* Placeholder for team list */}
      <div className="bg-muted/30 rounded-lg p-8 text-center">
        <p className="text-muted-foreground">
          No teams created yet. Click the button above to create your first team.
        </p>
      </div>
    </div>
  );
}
