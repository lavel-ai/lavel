'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, FieldValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from '@repo/design-system/hooks/use-toast';
import { ServerActionResult } from '@repo/types/server-action';
import { useFormAnalytics } from './analytics/use-form-analytics';
import { trackFormSubmission, trackFormSuccess, trackFormError } from '@repo/analytics';

export interface EntityFormOptions<T extends FieldValues> {
  schema: z.ZodType<T>;
  defaultValues: Partial<T>;
  action: (data: T) => Promise<ServerActionResult<any>>;
  onSuccess?: (data: any) => void;
  successMessage?: string | ((data: any) => string);
  errorMessage?: string;
  redirectPath?: string;
  entityType?: string;
  entityId?: string;
}

/**
 * Custom hook for entity forms that provides standardized form handling
 * including validation, submission, error handling, and success/error notifications.
 */
export function useEntityForm<T extends FieldValues>({
  schema,
  defaultValues,
  action,
  onSuccess,
  successMessage = 'Operation completed successfully',
  errorMessage = 'An error occurred',
  redirectPath,
  entityType = 'unknown',
  entityId,
}: EntityFormOptions<T>) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [isSubmitSuccessful, setIsSubmitSuccessful] = useState(false);
  
  // Initialize form with react-hook-form
  const form = useForm<T>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues as T,
  });

  // Initialize form analytics
  const analytics = useFormAnalytics(form, {
    formType: `${entityType}Form`,
    entityType,
    entityId,
  });

  // Handle form submission
  async function onSubmit(data: T) {
    const startTime = performance.now();
    setIsPending(true);
    
    // Track form submission
    trackFormSubmission({
      formType: `${entityType}Form`,
      entityType,
      entityId,
      fieldsCompleted: analytics.getInteractedFields().length,
      totalFields: Object.keys(defaultValues).length,
      timeSpentMs: analytics.getFormDuration(),
    });
    
    try {
      const result = await action(data);
      
      if (result.status === 'success') {
        // Handle success
        setIsSubmitSuccessful(true);
        
        // Show success toast
        const message = typeof successMessage === 'function' 
          ? successMessage(result.data) 
          : successMessage;
        
        toast({
          title: 'Success',
          description: message,
        });
        
        // Track form success
        trackFormSuccess({
          formType: `${entityType}Form`,
          entityType,
          entityId,
          processingTimeMs: performance.now() - startTime,
          normalizedFields: result.metadata?.normalizedFields || [],
        });
        
        // Call onSuccess callback if provided
        if (onSuccess) {
          onSuccess(result.data);
        }
        
        // Redirect if path is provided
        if (redirectPath) {
          router.push(redirectPath);
        }
        
        // Reset form
        form.reset(defaultValues as T);
      } else if (result.status === 'validation_error' || result.status === 'error') {
        // Handle validation errors
        if (result.fieldErrors) {
          // Set field errors in the form
          Object.entries(result.fieldErrors).forEach(([field, errors]) => {
            form.setError(field as any, { 
              type: 'server', 
              message: errors[0] 
            });
          });
        }
        
        // Show error toast
        toast({
          title: errorMessage,
          description: result.error || 'Something went wrong. Please try again.',
          variant: 'destructive',
        });
        
        // Track form error
        trackFormError({
          formType: `${entityType}Form`,
          entityType,
          entityId,
          errorType: result.status,
          errorMessage: result.error || 'Unknown error',
          fieldErrors: result.fieldErrors ? Object.keys(result.fieldErrors) : [],
        });
      }
    } catch (error) {
      // Handle unexpected errors
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
      
      // Track unexpected error
      trackFormError({
        formType: `${entityType}Form`,
        entityType,
        entityId,
        errorType: 'unexpected',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsPending(false);
    }
  }

  // Reset isSubmitSuccessful when form values change
  useEffect(() => {
    const subscription = form.watch(() => {
      if (isSubmitSuccessful) {
        setIsSubmitSuccessful(false);
      }
    });
    return () => subscription.unsubscribe();
  }, [form, isSubmitSuccessful]);

  return {
    form,
    isPending,
    onSubmit,
    isSubmitSuccessful,
  };
}
