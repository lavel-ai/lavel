// apps/app/app/(authenticated)/features/teams/components/TeamFormClient.tsx
'use client';

import { Button } from "@repo/design-system/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@repo/design-system/components/ui/form";
import { Input } from "@repo/design-system/components/ui/input";
import { Textarea } from "@repo/design-system/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { TeamMemberBasicInfo } from "@/app/(authenticated)/features/shared/actions/team-members-actions";
import { useToast } from "@repo/design-system/hooks/use-toast";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { TeamMemberSelectionCard } from "./team-member-selection-card";

// Form validation schema
const teamFormSchema = z.object({
  name: z.string().min(1, "El nombre del equipo es requerido"),
  description: z.string().optional(),
  practiceArea: z.string().min(1, "El área de práctica es requerida"),
  department: z.string().min(1, "El departamento es requerido"),
  teamMembers: z.array(z.object({
    userId: z.string(),
    role: z.enum(['member', 'leader'])
  })).min(1, "Se requiere al menos un miembro en el equipo")
  .refine((members) => {
    const leaders = members.filter(m => m.role === 'leader');
    return leaders.length === 1;
  }, "El equipo debe tener exactamente un líder"),
});

type FormData = z.infer<typeof teamFormSchema>;

interface TeamFormClientProps {
  users: TeamMemberBasicInfo[];
  onSubmit: (data: FormData) => Promise<{ success: boolean; teamId: string }>;
}

export function TeamFormClient({ users = [], onSubmit }: TeamFormClientProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<Map<string, 'leader' | 'member'>>(new Map());

  // Initialize form
  const form = useForm<FormData>({
    resolver: zodResolver(teamFormSchema),
    defaultValues: {
      name: "",
      description: "",
      practiceArea: "",
      department: "",
      teamMembers: [],
    },
  });

  const handleMemberSelect = (userId: string, role: 'leader' | 'member' = 'member') => {
    const newSelectedMembers = new Map(selectedMembers);
    
    if (newSelectedMembers.has(userId)) {
      // If changing role to leader, update other leaders to members
      if (role === 'leader') {
        for (const [id, currentRole] of newSelectedMembers) {
          if (currentRole === 'leader') {
            newSelectedMembers.set(id, 'member');
          }
        }
      }
      newSelectedMembers.set(userId, role);
    } else {
      // If adding new member
      if (role === 'leader') {
        // Update existing leader to member
        for (const [id, currentRole] of newSelectedMembers) {
          if (currentRole === 'leader') {
            newSelectedMembers.set(id, 'member');
          }
        }
      }
      newSelectedMembers.set(userId, role);
    }
    
    setSelectedMembers(newSelectedMembers);
    
    // Update form value
    const teamMembers = Array.from(newSelectedMembers).map(([profileId, role]) => ({
      userId: profileId, // This is actually the profile ID
      role,
    }));
    form.setValue('teamMembers', teamMembers, { shouldValidate: true });
  };

  const handleSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);
      const result = await onSubmit(data);
      
      // Only reset the form on success, but don't show toast (handled by parent)
      if (result.success) {
        form.reset();
        setSelectedMembers(new Map());
      }
    } catch (error) {
      // Log error but don't show toast (handled by parent)
      console.error("Team creation error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre del Equipo</FormLabel>
              <FormControl>
                <Input placeholder="Ingrese el nombre del equipo" {...field} disabled={isSubmitting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Ingrese la descripción del equipo"
                  {...field}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="practiceArea"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Área de Práctica</FormLabel>
              <FormControl>
                <Input placeholder="Ingrese el área de práctica" {...field} disabled={isSubmitting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="department"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Departamento</FormLabel>
              <FormControl>
                <Input placeholder="Ingrese el departamento" {...field} disabled={isSubmitting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="teamMembers"
          render={() => (
            <FormItem>
              <FormLabel>Miembros del Equipo</FormLabel>
              <FormControl>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {users && users.length > 0 ? (
                    users.map((user) => (
                      <TeamMemberSelectionCard
                        key={user.id}
                        lawyer={user}
                        isSelected={selectedMembers.has(user.id)}
                        onSelect={handleMemberSelect}
                        disabled={isSubmitting}
                      />
                    ))
                  ) : (
                    <div className="col-span-2 text-center py-4 text-muted-foreground">
                      No hay abogados disponibles para agregar al equipo.
                    </div>
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creando Equipo...
            </>
          ) : (
            "Crear Equipo"
          )}
        </Button>
      </form>
    </Form>
  );
}