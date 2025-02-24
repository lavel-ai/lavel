export type TeamMember = {
  id: string;
  name: string;
  lastName: string;
  avatar?: string;
  role: string;
  practiceArea: string | null;
  isLeadLawyer: boolean;
};

export type TeamCardProps = {
  name: string;
  lawyerCount: number;
  lawyers: TeamMember[];
  onEdit: () => void;
};

export type CreateTeamDialogProps = {
  users: TeamMember[];
  createTeam: (data: {
    name: string;
    description?: string;
    practiceArea?: string;
    department?: string;
    memberIds: string[];
  }) => Promise<{ success: boolean; teamId: string }>;
}; 