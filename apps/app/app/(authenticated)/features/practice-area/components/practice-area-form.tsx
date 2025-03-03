'use client';

import React, { useEffect } from 'react';
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
import { Checkbox } from '@repo/design-system/components/ui/checkbox';
import { NormalizedTextInput } from '@repo/design-system/components/form/normalized-text-input';
import { NormalizedTextarea } from '@repo/design-system/components/form/normalized-text-area-input';
import { normalizeText } from '@repo/schema/src/utils/normalize';
import { createPracticeArea, updatePracticeArea, PracticeAreaOption } from '../actions/practice-area-actions';
import { useActionState } from 'react';
import { TrackedForm } from '@repo/analytics/posthog/components/tracked-form';
import { useAnalytics } from '@repo/analytics/posthog/client';

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
  const analytics = useAnalytics();
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
  
  // Track form start time for analytics
  const formStartTime = React.useRef(Date.now());
  const formFieldsInteracted = React.useRef(new Set<string>());
  
  // Use React 19 useActionState for better state management
  const [state, formAction] = useActionState(
    async (prevState: any, formData: FormData) => {
      const values = Object.fromEntries(formData.entries()) as unknown as FormValues;
      
      try {
        let response;
        if (isEditMode && practiceArea) {
          // Update existing practice area
          response = await updatePracticeArea(practiceArea.id, values);
        } else {
          // Create new practice area
          response = await createPracticeArea(values);
        }
        
        if (response.status === 'success' && response.data) {
          // Track successful form submission
          analytics?.capture('form_submitted', {
            form_type: 'practice_area',
            form_action: isEditMode ? 'update' : 'create',
            time_spent_ms: Date.now() - formStartTime.current,
            fields_completed: Array.from(formFieldsInteracted.current),
            entity_id: response.data.id,
          });
          
          if (onSuccess) {
            onSuccess(response.data);
          }
          
          // Reset the form if not in edit mode
          if (!isEditMode) {
            form.reset();
            formFieldsInteracted.current.clear();
            formStartTime.current = Date.now();
          }
          
          return { 
            status: 'success', 
            message: response.message || (isEditMode 
              ? 'Área de práctica actualizada correctamente' 
              : 'Área de práctica creada correctamente')
          };
        } else {
          throw new Error(response.message || 'Error al procesar el área de práctica');
        }
      } catch (error: any) {
        // Track form error
        analytics?.capture('form_error', {
          form_type: 'practice_area',
          error_message: error.message || 'Unknown error',
          form_action: isEditMode ? 'update' : 'create',
        });
        
        return { 
          status: 'error', 
          message: error.message || 'Ha ocurrido un error' 
        };
      }
    },
    { status: null, message: null }
  );
  
  // Show toast based on action state
  React.useEffect(() => {
    if (state.status === 'success') {
      toast({
        title: 'Éxito',
        description: state.message,
      });
    } else if (state.status === 'error') {
      toast({
        title: 'Error',
        description: state.message,
        variant: 'destructive',
      });
    }
  }, [state, toast]);
  
  // Track form view on mount
  useEffect(() => {
    analytics?.capture('form_viewed', {
      form_type: 'practice_area',
      form_action: isEditMode ? 'update' : 'create',
      entity_id: practiceArea?.id,
    });
    
    // Track form abandonment on unmount
    return () => {
      const wasSubmitted = state.status === 'success';
      if (!wasSubmitted) {
        analytics?.capture('form_abandoned', {
          form_type: 'practice_area',
          time_spent_ms: Date.now() - formStartTime.current,
          fields_interacted: Array.from(formFieldsInteracted.current),
          entity_id: practiceArea?.id,
        });
      }
    };
  }, [analytics, isEditMode, practiceArea?.id, state.status]);
  
  // Track field interactions
  const trackFieldInteraction = (fieldName: string) => {
    formFieldsInteracted.current.add(fieldName);
  };

  // Handle form submission
  const onSubmit = (values: FormValues) => {
    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      formData.append(key, value?.toString() || '');
    });
    formAction(formData);
  };

  return (
    <TrackedForm 
      formType="practice_area"
      entityType="practice_area"
      entityId={practiceArea?.id?.toString()}
      properties={{
        isEditing: isEditMode,
        formStartTime: formStartTime.current,
      }}
    >
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
                    onChange={(value) => {
                      field.onChange(value);
                      trackFieldInteraction('name');
                    }}
                    error={fieldState.error?.message}
                    normalizeFn={normalizeText.titleCase}
                    showNormalization={true}
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
                  <NormalizedTextarea
                    placeholder="Ingrese una descripción del área de práctica"
                    className="resize-none"
                    value={field.value || ''}
                    onChange={(value) => {
                      field.onChange(value);
                      trackFieldInteraction('description');
                    }}
                    normalizeFn={normalizeText.trim}
                    showNormalizationFeedback={true}
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
                    onCheckedChange={(checked) => {
                      field.onChange(checked);
                      trackFieldInteraction('active');
                    }}
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
                disabled={state.status === 'pending'}
              >
                Cancelar
              </Button>
            )}
            <Button 
              type="submit" 
              disabled={state.status === 'pending'}
            >
              {state.status === 'pending' ? 'Guardando...' : isEditMode ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </form>
      </Form>
    </TrackedForm>
  );
}
