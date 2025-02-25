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
import { useState } from "react";
import { Plus } from "lucide-react";
import { TeamFormClient } from "./team-form";
import type { LawyerProfile } from "../../lawyers/actions/lawyer-actions";
import type { TeamMemberBasicInfo } from "../../shared/actions/team-members-actions";
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

  // Map LawyerProfile to TeamMemberBasicInfo, ensuring availableLawyers is an array
  const mappedUsers: TeamMemberBasicInfo[] = (availableLawyers || []).map(lawyer => ({
    id: lawyer.id, // This is the profile ID, which is what we need for team members
    name: lawyer.name,
    lastName: lawyer.lastName || '',
    status: true, // Since these are active lawyers
    email: lawyer.teams?.[0]?.name || `${lawyer.name}.${lawyer.lastName || ''}@example.com`, // Using team name as a fallback, with optional chaining
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

          // Handle success case
          if (result.success) {
            toast({
              title: "¡Equipo Creado Exitosamente! 🎉",
              description: result.message || `El equipo "${data.name}" ha sido creado con ${data.teamMembers.length} miembros.`,
              variant: "default",
            });
            
            // Close the dialog on success
            onOpenChange(false);
            
            return { 
              success: true, 
              teamId: result.teamId, 
              message: result.message || "Team created successfully" 
            };
          } else {
            // Handle error case from the API
            toast({
              title: "Error al Crear el Equipo",
              description: result.message || "No se pudo crear el equipo. Por favor, inténtalo de nuevo.",
              variant: "destructive",
            });
            
            return { 
              success: false, 
              teamId: '', 
              message: result.message || "Failed to create team" 
            };
          }
        } catch (error) {
          // Handle exception case
          console.error('Error creating team:', error);
          
          toast({
            title: "Error al Crear el Equipo",
            description: error instanceof Error ? error.message : "Ocurrió un error inesperado al crear el equipo",
            variant: "destructive",
          });
          
          return { 
            success: false, 
            teamId: '', 
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