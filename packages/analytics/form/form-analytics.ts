// packages/analytics/form-analytics.ts
'use client';

import { useAnalytics } from '../posthog/client';
import { useEffect, useState } from 'react';

export type FormAnalyticsOptions = {
  formType: string;
  entityType?: string;
  entityId?: string;
  properties?: Record<string, any>;
};

/**
 * Hook for tracking form analytics
 */
export function useFormAnalytics(options: FormAnalyticsOptions) {
  const { formType, entityType, entityId, properties = {} } = options;
  const posthog = useAnalytics();
  const [startTime] = useState(Date.now());
  const [submitted, setSubmitted] = useState(false);
  
  // Track form view on mount
  useEffect(() => {
    posthog.capture('form_viewed', {
      form_type: formType,
      entity_type: entityType,
      entity_id: entityId,
      device_type: getDeviceType(),
      ...properties
    });
    
    // Track abandonment on unmount
    return () => {
      if (!submitted) {
        posthog.capture('form_abandoned', {
          form_type: formType,
          entity_type: entityType,
          entity_id: entityId,
          time_spent: Date.now() - startTime,
          device_type: getDeviceType(),
          ...properties
        });
      }
    };
  }, [formType, entityType, entityId, posthog, properties, submitted, startTime]);
  
  // Get device type for analytics
  const getDeviceType = () => {
    if (typeof window === 'undefined') return 'unknown';
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  };
  
  return {
    trackSubmit: () => {
      setSubmitted(true);
      posthog.capture('form_submitted', {
        form_type: formType,
        entity_type: entityType,
        entity_id: entityId,
        time_spent: Date.now() - startTime,
        device_type: getDeviceType(),
        ...properties
      });
    },
    
    trackSuccess: (result: any) => {
      posthog.capture('form_submission_succeeded', {
        form_type: formType,
        entity_type: entityType,
        entity_id: entityId || result?.id,
        time_spent: Date.now() - startTime,
        ...properties
      });
    },
    
    trackError: (error: any) => {
      posthog.capture('form_submission_failed', {
        form_type: formType,
        entity_type: entityType,
        entity_id: entityId,
        time_spent: Date.now() - startTime,
        error_message: error instanceof Error ? error.message : String(error),
        ...properties
      });
    }
  };
}

/**
 * Server-side analytics tracking for forms
 */
export async function trackFormEvent(
  eventType: 'success' | 'error',
  options: {
    userId: string;
    formType: string;
    entityType?: string;
    entityId?: string;
    processingTimeMs?: number;
    normalizationChanges?: number;
    errorMessage?: string;
    fieldsWithErrors?: number;
    tenantId?: string;
  }
) {
  // Import server-side functions to avoid client bundle size bloat
  const {
    trackFormSuccess,
    trackFormError
  } = await import('../posthog/actions/server-actions');
  
  if (eventType === 'success') {
    return trackFormSuccess({
      userId: options.userId,
      formType: options.formType,
      entityType: options.entityType,
      entityId: options.entityId,
      processingTimeMs: options.processingTimeMs,
      normalizationChanges: options.normalizationChanges,
      tenantId: options.tenantId
    });
  } else {
    return trackFormError({
      userId: options.userId,
      formType: options.formType,
      entityType: options.entityType,
      entityId: options.entityId,
      errorMessage: options.errorMessage,
      fieldsWithErrors: options.fieldsWithErrors,
      processingTimeMs: options.processingTimeMs,
      tenantId: options.tenantId
    });
  }
}