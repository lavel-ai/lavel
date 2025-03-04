// packages/analytics/posthog/actions/server-actions.tsx
'use server';
import { analytics } from '../server';
import { auth } from '@repo/auth/server';
import { getTenantIdentifier } from '../../../../apps/app/app/utils/tenant-identifier';
import type { ErrorContext } from '@repo/observability/error';

// Types for analytics events
export interface FormTrackingData {
  userId: string;
  formType: string;
  entityType?: string;
  entityId?: string;
  processingTimeMs?: number;
  normalizationChanges?: number;
  fieldsWithErrors?: number;
  errorMessage?: string;
  source?: string;
  tenantId?: string;
  [key: string]: any;
}

export interface EntityTrackingData {
  userId: string;
  entityType: string;
  entityId: string;
  tenantId?: string;
  source?: string;
  metadata?: Record<string, any>;
  [key: string]: any;
}

/**
 * Tracks server-side events with standard properties.
 */
export async function trackServerEvent(
  eventName: string,
  properties: Record<string, any> = {}
) {
  try {
    const { userId } = await auth();
    if (!userId) return;
    
    const tenant = await getTenantIdentifier();
    const timestamp = Date.now();
    
    await analytics.capture({
      distinctId: userId,
      event: eventName,
      properties: {
        tenant_id: tenant,
        timestamp,
        ...properties
      }
    });
  } catch (error) {
    // Silent fail for analytics - should not interrupt main flow
    console.error('Analytics error:', error);
  }
}

// Form events
export async function trackFormSuccess({
  userId,
  formType,
  entityType,
  entityId,
  processingTimeMs,
  normalizationChanges,
  ...rest
}: FormTrackingData) {
  return trackServerEvent('form_submission_succeeded', {
    user_id: userId,
    form_type: formType,
    entity_type: entityType,
    entity_id: entityId,
    processing_time_ms: processingTimeMs,
    normalization_changes: normalizationChanges,
    ...rest
  });
}

export async function trackFormError({
  userId,
  formType,
  errorMessage,
  entityType,
  entityId,
  fieldsWithErrors,
  processingTimeMs,
  ...rest
}: FormTrackingData) {
  return trackServerEvent('form_submission_failed', {
    user_id: userId,
    form_type: formType,
    error_message: errorMessage,
    entity_type: entityType,
    entity_id: entityId,
    fields_with_errors: fieldsWithErrors,
    processing_time_ms: processingTimeMs,
    ...rest
  });
}

// Entity events
export async function trackEntityCreated({
  userId,
  entityType,
  entityId,
  tenantId,
  metadata,
  ...rest
}: EntityTrackingData) {
  return trackServerEvent('entity_created', {
    user_id: userId,
    entity_type: entityType,
    entity_id: entityId,
    tenant_id: tenantId,
    metadata,
    ...rest
  });
}

export async function trackEntityUpdated({
  userId,
  entityType,
  entityId,
  tenantId,
  metadata,
  ...rest
}: EntityTrackingData) {
  return trackServerEvent('entity_updated', {
    user_id: userId,
    entity_type: entityType,
    entity_id: entityId,
    tenant_id: tenantId,
    metadata,
    ...rest
  });
}

export async function trackEntityDeleted({
  userId,
  entityType,
  entityId,
  tenantId,
  metadata,
  ...rest
}: EntityTrackingData) {
  return trackServerEvent('entity_deleted', {
    user_id: userId,
    entity_type: entityType,
    entity_id: entityId,
    tenant_id: tenantId,
    metadata,
    ...rest
  });
}

/**
 * Track error events with detailed context
 */
export async function trackErrorEvent(
  error: unknown,
  context: ErrorContext
) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  
  return trackServerEvent('error_occurred', {
    error_message: errorMessage,
    error_context: context.context,
    user_id: context.userId,
    tenant_id: context.tenantId,
    source: context.source || 'unknown',
    severity: context.severity || 'medium',
    additional_data: context.additionalData,
    tags: context.tags,
    timestamp: new Date().toISOString()
  });
}