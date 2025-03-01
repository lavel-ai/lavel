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
import { Badge } from "@repo/design-system/components/ui/badge";
import { 
  Command, 
  CommandEmpty, 
  CommandGroup, 
  CommandInput, 
  CommandItem, 
  CommandList,
  CommandSeparator
} from "@repo/design-system/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@repo/design-system/components/ui/popover";
import { Check, ChevronsUpDown, X, Users, StarIcon, Star } from "lucide-react";
import { cn } from "@repo/design-system/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { LawyerProfile } from "../../lawyers/actions/lawyer-actions";
import { useToast } from "@repo/design-system/hooks/use-toast";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { NormalizedTextInput } from "@repo/design-system/components/form/normalized-text-input";
import { normalizeText } from "@repo/schema/src/utils/normalize";
import { NormalizedTextarea } from "@repo/design-system/components/form/normalized-text-area-input";

// Form validation schema matching our team schema
const teamFormSchema = z.object({
  name: z.string().min(1, "El nombre del equipo es requerido"),
  description: z.string().optional(),
  practiceArea: z.string().min(1, "El área de práctica es requerida"),
  department: z.string().min(1, "El departamento es requerido"),
  members: z.array(z.object({
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
  lawyers: LawyerProfile[];
  onSubmit: (data: FormData) => Promise<{ success: boolean; teamId?: string; message?: string }>;
}

export function TeamFormClient({ lawyers = [], onSubmit }: TeamFormClientProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedLawyers, setSelectedLawyers] = useState<string[]>([]);
  const [selectedLeader, setSelectedLeader] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  // Initialize form
  const form = useForm<FormData>({
    resolver: zodResolver(teamFormSchema),
    defaultValues: {
      name: "",
      description: "",
      practiceArea: "",
      department: "",
      members: [],
    },
  });

  // Helper to find lawyer by ID
  const findLawyer = (id: string) => lawyers.find(lawyer => lawyer.id === id);

  // Update form when selections change
  useEffect(() => {
    const members = selectedLawyers.map(id => ({
      userId: id,
      role: id === selectedLeader ? 'leader' as const : 'member' as const
    }));
    
    form.setValue('members', members, { shouldValidate: true });
  }, [selectedLawyers, selectedLeader, form]);

  // Handle selecting a lawyer
  const toggleLawyer = (lawyerId: string) => {
    setSelectedLawyers(prev => {
      if (prev.includes(lawyerId)) {
        // If this was the leader, unset the leader
        if (selectedLeader === lawyerId) {
          setSelectedLeader(null);
        }
        return prev.filter(id => id !== lawyerId);
      } else {
        return [...prev, lawyerId];
      }
    });
  };

  // Handle setting the leader
  const toggleLeader = (lawyerId: string) => {
    // Ensure the lawyer is selected first
    if (!selectedLawyers.includes(lawyerId)) {
      setSelectedLawyers(prev => [...prev, lawyerId]);
    }
    
    // Toggle leader status
    setSelectedLeader(prev => prev === lawyerId ? null : lawyerId);
  };

  // Remove a selected lawyer
  const removeLawyer = (lawyerId: string) => {
    setSelectedLawyers(prev => prev.filter(id => id !== lawyerId));
    if (selectedLeader === lawyerId) {
      setSelectedLeader(null);
    }
  };

  const handleSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);
      const result = await onSubmit(data);
      
      if (result.success) {
        form.reset();
        setSelectedLawyers([]);
        setSelectedLeader(null);
        
        toast({
          title: "¡Equipo creado!",
          description: result.message || "El equipo ha sido creado exitosamente.",
        });
      } else {
        toast({
          title: "Error",
          description: result.message || "Hubo un error al crear el equipo.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error en el envío:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Hubo un error al crear el equipo.",
        variant: "destructive",
      });
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
                <NormalizedTextInput
                  label="Nombre del Equipo"
                  value={field.value}
                  onChange={field.onChange}
                  error={form.formState.errors.name?.message}
                  normalizeFn={normalizeText.titleCase}
                />
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
                <NormalizedTextarea
                  label="Descripción"
                  value={field.value || ''}
                  onChange={field.onChange}
                  error={form.formState.errors.description?.message}
                  normalizeFn={normalizeText.trim}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        </div>

        <FormField
          control={form.control}
          name="members"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>Miembros del Equipo</span>
                </div>
              </FormLabel>
              
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={open}
                      className="w-full justify-between text-muted-foreground"
                    >
                      {selectedLawyers.length > 0 
                        ? `${selectedLawyers.length} abogados seleccionados` 
                        : "Seleccione abogados"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Buscar abogado..." />
                    <CommandList>
                      <CommandEmpty>No se encontraron abogados.</CommandEmpty>
                      <CommandGroup>
                        {lawyers.map((lawyer) => (
                          <CommandItem
                            key={lawyer.id}
                            value={lawyer.id}
                            onSelect={() => toggleLawyer(lawyer.id)}
                            className="flex items-center justify-between px-2"
                          >
                            <div className="flex items-center">
                              <div className={cn(
                                "mr-2 h-4 w-4 flex items-center justify-center",
                                selectedLawyers.includes(lawyer.id) ? "text-primary" : "opacity-0"
                              )}>
                                <Check className={cn("h-4 w-4")} />
                              </div>
                              <span>{lawyer.name} {lawyer.lastName}</span>
                            </div>
                            
                            {/* Leader selection */}
                            {selectedLawyers.includes(lawyer.id) && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className={cn(
                                  "ml-auto h-8 w-8 p-0",
                                  selectedLeader === lawyer.id && "text-amber-500"
                                )}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleLeader(lawyer.id);
                                }}
                              >
                                <Star className={cn(
                                  "h-4 w-4",
                                  selectedLeader === lawyer.id && "fill-amber-500"
                                )} />
                              </Button>
                            )}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                    <CommandSeparator />
                    <div className="p-2">
                      <Button 
                        type="button" 
                        variant="secondary" 
                        className="w-full"
                        onClick={() => setOpen(false)}
                      >
                        Aceptar
                      </Button>
                    </div>
                  </Command>
                </PopoverContent>
              </Popover>
              
              {/* Selected lawyers display */}
              {selectedLawyers.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedLawyers.map(id => {
                    const lawyer = findLawyer(id);
                    if (!lawyer) return null;
                    
                    return (
                      <Badge
                        key={id}
                        variant={selectedLeader === id ? "default" : "secondary"}
                        className={cn(
                          "px-2 py-1 flex items-center gap-1",
                          selectedLeader === id && "bg-amber-500"
                        )}
                      >
                        {selectedLeader === id && (
                          <Star className="h-3 w-3 fill-white" />
                        )}
                        <span>
                          {lawyer.name} {lawyer.lastName}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0 ml-1"
                          onClick={() => removeLawyer(id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    );
                  })}
                </div>
              )}
              
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