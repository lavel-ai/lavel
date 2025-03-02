'use client';

import React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@repo/design-system/components/ui/form';
import { Button } from '@repo/design-system/components/ui/button';
import { useToast } from '@repo/design-system/hooks/use-toast';
import { Textarea } from '@repo/design-system/components/ui/textarea';
import { Checkbox } from '@repo/design-system/components/ui/checkbox';
import { NormalizedTextInput } from '@repo/design-system/components/form/normalized-text-input';
import { normalizeText } from '@repo/schema/src/utils/normalize';
import { createPracticeArea, updatePracticeArea, PracticeAreaOption } from '../actions/practice-area-actions';

// Form validation schema aligned with practiceAreaSchema
const formSchema = z.object({
  name: z
    .string()
    .min(2, { message: 'El nombre debe tener al menos 2 caracteres' })
    .max(50, { message: 'El nombre no puede exceder 50 caracteres' }),
  description: z.string().optional(),
  active: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

interface PracticeAreaFormProps {
  practiceArea?: PracticeAreaOption & { 
    description?: string | null;
    active?: boolean;
  };
  onSuccess?: (practiceArea: PracticeAreaOption) => void;
  onCancel?: () => void;
}

export function PracticeAreaForm({
  practiceArea,
  onSuccess,
  onCancel,
}: PracticeAreaFormProps) {
  const { toast } = useToast();
  const isEditMode = !!practiceArea;
  
  // Initialize the form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: practiceArea?.name || '',
      description: practiceArea?.description || '',
      active: practiceArea?.active !== undefined ? practiceArea.active : true,
    },
  });
  
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Handle form submission
  const onSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true);
      
      let response;
      if (isEditMode && practiceArea) {
        // Update existing practice area
        response = await updatePracticeArea(practiceArea.id, values);
      } else {
        // Create new practice area
        response = await createPracticeArea(values);
      }
      
      if (response.status === 'success' && response.data) {
        toast({
          title: 'Éxito',
          description: response.message || (isEditMode 
            ? 'Área de práctica actualizada correctamente' 
            : 'Área de práctica creada correctamente'),
        });
        
        if (onSuccess) {
          onSuccess(response.data);
        }
        
        // Reset the form if not in edit mode
        if (!isEditMode) {
          form.reset();
        }
      } else {
        throw new Error(response.message || 'Error al procesar el área de práctica');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Ha ocurrido un error',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormControl>
                <NormalizedTextInput
                  label="Nombre del área de práctica"
                  placeholder="Ingrese el nombre del área de práctica"
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  normalizeFn={normalizeText.titleCase}
                  required={true}
                />
              </FormControl>
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción (opcional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Ingrese una descripción del área de práctica"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="active"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  Activa
                </FormLabel>
                <FormDescription>
                  Esta área de práctica estará disponible para asignación.
                </FormDescription>
              </div>
            </FormItem>
          )}
        />
        
        <div className="flex justify-end space-x-2 pt-2">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Guardando...' : isEditMode ? 'Actualizar' : 'Crear'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
