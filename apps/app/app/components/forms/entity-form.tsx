'use client';

import { ReactNode } from 'react';
import { FieldValues } from 'react-hook-form';
import { z } from 'zod';
import { Form } from '@repo/design-system/components/ui/form';
import { Button } from '@repo/design-system/components/ui/button';
import { useEntityForm, EntityFormOptions } from '../../hooks/use-entity-form';
import { trackFormAbandonment } from '@repo/analytics';

export interface EntityFormProps<T extends FieldValues> extends Omit<EntityFormOptions<T>, 'schema'> {
  schema: z.ZodType<T>;
  children: ReactNode;
  submitLabel?: string;
  cancelLabel?: string;
  onCancel?: () => void;
  showCancelButton?: boolean;
  entityType: string;
}

/**
 * A wrapper component for entity forms that provides standardized form handling
 * including validation, submission, error handling, and analytics tracking.
 */
export function EntityForm<T extends FieldValues>({
  schema,
  defaultValues,
  action,
  onSuccess,
  successMessage,
  errorMessage,
  redirectPath,
  children,
  submitLabel = 'Save',
  cancelLabel = 'Cancel',
  onCancel,
  showCancelButton = false,
  entityType,
}: EntityFormProps<T>) {
  const { form, isPending, onSubmit, isSubmitSuccessful } = useEntityForm<T>({
    schema,
    defaultValues,
    action,
    onSuccess,
    successMessage,
    errorMessage,
    redirectPath,
  });

  // Track form abandonment when user navigates away
  const handleBeforeUnload = () => {
    if (form.formState.isDirty && !form.formState.isSubmitted && !isSubmitSuccessful) {
      trackFormAbandonment({
        formType: entityType,
        fieldsCompleted: Object.keys(form.getValues()).filter(key => !!form.getValues()[key]).length,
        totalFields: Object.keys(defaultValues).length,
      });
    }
  };

  // Add event listener for beforeunload
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', handleBeforeUnload);
    // Clean up the event listener
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {children}
        
        <div className="flex justify-end space-x-2 pt-4">
          {showCancelButton && onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isPending}
            >
              {cancelLabel}
            </Button>
          )}
          
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Saving...' : submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  );
}
