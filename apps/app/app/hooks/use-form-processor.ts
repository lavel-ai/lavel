// apps/app/app/hooks/use-form-processor.ts
'use client';

import { useState, useEffect } from 'react';
import { useActionState } from 'react';
import { useAnalytics } from '@repo/analytics/posthog/client';

export interface FormProcessorOptions<T> {
  entityType: string;
  initialData?: Partial<T>;
  serverAction: (prevState: any, formData: FormData) => Promise<any>;
  analytics?: {
    formType: string;
    properties?: Record<string, any>;
  };
  onSuccess?: (data: T) => void;
  onError?: (error: any) => void;
  resetAfterSubmit?: boolean;
}

export function useFormProcessor<T>(options: FormProcessorOptions<T>) {
  const {
    entityType,
    initialData = {},
    serverAction,
    analytics,
    onSuccess,
    onError,
    resetAfterSubmit = false
  } = options;
  
  // Use React 19's useActionState for form handling
  const [actionState, formAction, isPending] = useActionState(
    async (prevState: any, formData: FormData) => {
      try {
        // Call the server action
        const result = await serverAction(prevState, formData);
        
        // Handle success
        if (!result || !result.error) {
          if (onSuccess) {
            onSuccess(result?.data || result);
          }
          if (resetAfterSubmit) {
            return { status: 'success', data: result?.data || result };
          }
        }
        
        return result;
      } catch (error) {
        // Handle error
        if (onError) {
          onError(error);
        }
        return {
          error: error instanceof Error ? error.message : 'An unexpected error occurred'
        };
      }
    },
    { status: 'idle' }
  );
  
  // Track form interactions using analytics
  const posthog = useAnalytics();
  
  // Track form view on mount
  useEffect(() => {
    if (analytics) {
      posthog.capture('form_viewed', {
        entity_type: entityType,
        form_type: analytics.formType,
        ...analytics.properties
      });
      
      // Track abandonment on unmount
      return () => {
        if (actionState.status !== 'success') {
          posthog.capture('form_abandoned', {
            entity_type: entityType,
            form_type: analytics.formType,
            ...analytics.properties
          });
        }
      };
    }
  }, [entityType, analytics, posthog, actionState.status]);
  
  // Enhance form action with tracking
  const enhancedFormAction = async (formData: FormData) => {
    // Track form submission
    if (analytics) {
      posthog.capture('form_submitted', {
        entity_type: entityType,
        form_type: analytics.formType,
        ...analytics.properties
      });
    }
    
    // Call the original form action
    return formAction(formData);
  };
  
  return {
    formAction: enhancedFormAction,
    isPending,
    actionState,
    isSuccess: actionState.status === 'success',
    isError: Boolean(actionState.error),
    data: actionState.data,
    error: actionState.error,
    changes: actionState.changes,
  };
}