'use client';

import { Button } from "@repo/design-system/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@repo/design-system/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@repo/design-system/components/ui/drawer";
import { useIsMobile } from "@repo/design-system/hooks/use-mobile";
import { useState } from "react";
import { Plus } from "lucide-react";
import { TeamFormClient } from "../../teams/components/team-form";
import type { LawyerProfile } from "../../lawyers/actions/lawyer-actions";
import type { TeamMemberBasicInfo } from "../../shared/actions/team-members-actions";
import { createTeam } from "../../teams/actions/create-team";

interface CreateTeamDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  availableLawyers: LawyerProfile[];
}

export function CreateTeamDialog({ open, onOpenChange, availableLawyers }: CreateTeamDialogProps) {
  const isMobile = useIsMobile();

  // Show nothing while detecting mobile state
  if (typeof isMobile === 'undefined') {
    return null;
  }

  // Map LawyerProfile to TeamMemberBasicInfo
  const mappedUsers: TeamMemberBasicInfo[] = availableLawyers.map(lawyer => ({
    id: lawyer.id,
    name: lawyer.name,
    lastName: lawyer.lastName,
    status: true, // Since these are active lawyers
    email: lawyer.teams[0]?.name || '', // Using team name as a fallback
    imageUrl: null
  }));

  const FormContent = () => (
    <TeamFormClient
      users={mappedUsers}
      onSubmit={async (data) => {
        try {
          const result = await createTeam({
            name: data.name,
            description: data.description,
            practiceArea: data.practiceArea,
            department: data.department,
            teamMembers: data.teamMembers
          });

          if (result.success && result.teamId) {
            onOpenChange(false);
            return { success: true, teamId: result.teamId };
          }

          throw new Error(result.message || 'Failed to create team');
        } catch (error) {
          console.error('Error creating team:', error);
          return { success: false, teamId: '' };
        }
      }}
    />
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerTrigger asChild>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Team
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Create New Team</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 py-6">
            <FormContent />
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Team
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Team</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <FormContent />
        </div>
      </DialogContent>
    </Dialog>
  );
} 