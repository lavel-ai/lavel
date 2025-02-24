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
import { TeamMemberBasicInfo } from "@/app/(authenticated)/features/shared/actions/team-members-actions";
import { TeamFormClient } from "./team-form";

interface CreateTeamDialogProps {
  users: TeamMemberBasicInfo[];
  createTeam: (data: any) => Promise<{ success: boolean; teamId: string }>;
}

export function CreateTeamDialog({ users, createTeam }: CreateTeamDialogProps) {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);

  // Show nothing while detecting mobile state
  if (typeof isMobile === 'undefined') {
    return (
      <Button disabled>
        <Plus className="h-4 w-4 mr-2" />
        Create Team
      </Button>
    );
  }

  const FormContent = () => (
    <TeamFormClient
      users={users}
      onSubmit={async (data) => {
        const result = await createTeam(data);
        if (result.success) {
          setIsOpen(false);
        }
        return result;
      }}
    />
  );

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={setIsOpen}>
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
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
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