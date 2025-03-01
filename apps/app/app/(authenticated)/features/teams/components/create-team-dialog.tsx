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
import { useToast } from "@repo/design-system/hooks/use-toast";
import { Plus } from "lucide-react";
import { TeamFormClient } from "./team-form";
import type { LawyerProfile } from "../../lawyers/actions/lawyer-actions";
import { createTeam } from "../actions/team-actions";

interface CreateTeamDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  availableLawyers: LawyerProfile[];
}

export function CreateTeamDialog({ open, onOpenChange, availableLawyers }: CreateTeamDialogProps) {
  const isMobile = useIsMobile();
  const { toast } = useToast();

  // Show nothing while detecting mobile state
  if (typeof isMobile === 'undefined') {
    return null;
  }

  const FormContent = () => (
    <TeamFormClient
      lawyers={availableLawyers}
      onSubmit={async (data) => {
        try {
          // Call the server action to create team using our normalization pipeline
          const result = await createTeam(data as any);

          // Handle success case
          if (result.success) {
            // Close the dialog on success
            onOpenChange(false);
            
            return { 
              success: true, 
              teamId: result.teamId, 
              message: result.message || "Team created successfully" 
            };
          } else {
            // Handle error case from the API
            return { 
              success: false, 
              message: result.message || "Failed to create team" 
            };
          }
        } catch (error) {
          // Handle exception case
          console.error('Error creating team:', error);
          
          return { 
            success: false, 
            message: error instanceof Error ? error.message : 'Failed to create team' 
          };
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