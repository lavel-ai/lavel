// apps/app/app/(authenticated)/features/departments/components/department-form.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@repo/design-system/components/ui/button';
import { Form, FormField, FormItem, FormControl, FormMessage } from '@repo/design-system/components/ui/form';
import { NormalizedTextInput } from '@repo/design-system/components/form/normalized-text-input';
import { NormalizedTextarea } from '@repo/design-system/components/form/normalized-text-area-input';
import { normalizeText } from '@repo/schema';
import { Loader2 } from 'lucide-react';
import { useDepartments } from '../hooks/use-departments';

// Create a schema for the form that matches our backend schema
const formSchema = z.object({
  name: z.string()
    .min(1, "El nombre del departamento es requerido")
    .max(255, "El nombre no puede exceder 255 caracteres"),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface DepartmentFormProps {
  onSuccess?: () => void;
}

export function DepartmentForm({ onSuccess }: DepartmentFormProps) {
  const { createDepartment, isCreating } = useDepartments();
  
  // Initialize the form with react-hook-form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });
  
  // Handle form submission
  const onSubmit = async (data: FormValues) => {
    createDepartment(data, {
      onSuccess: () => {
        form.reset(); // Reset the form on success
        if (onSuccess) onSuccess();
      }
    });
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <NormalizedTextInput 
                  label="Nombre del Area"
                  value={field.value}
                  onChange={field.onChange}
                  error={form.formState.errors.name?.message}
                  normalizeFn={normalizeText.titleCase}
                  placeholder="Ej. Recursos Humanos"
                  required
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
              <FormControl>
                <NormalizedTextarea 
                  label="Descripción"
                  value={field.value || ''}
                  onChange={field.onChange}
                  error={form.formState.errors.description?.message}
                  normalizeFn={normalizeText.trim}
                  placeholder="Descripción del departamento..."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" disabled={isCreating} className="w-full">
          {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Crear Departamento
        </Button>
      </form>
    </Form>
  );
}