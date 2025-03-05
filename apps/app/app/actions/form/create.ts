// apps/app/app/actions/form/create.ts
'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createFormPipeline, PipelineContext } from '@repo/schema/src/form/create-form-pipeline';
import { 
  trackFormSuccess, 
  trackFormError, 
  trackEntityCreated, 
  trackEntityUpdated,
  trackPerformanceMetric 
} from '@repo/analytics/server';
import { captureErrorBase } from '@repo/observability/error-capture';

export interface ActionContext {
  db: any;
  user: any;
  userId: string;
  tenantId: string;
}

export type FormActionOptions<T> = {
  entityType: string;
  schemaKey?: string;
  dbOperation: (db: any, data: T, user: any) => Promise<any>;
  analyticsEventType?: string;
  successRedirect?: string | ((result: any) => string);
  revalidatePaths?: string[];
  customContext?: Record<string, any>;
};

type FormActionResult<T> = {
  data?: T;
  error?: string;
  fieldErrors?: Record<string, string[]>;
  changes?: Array<{
    field: string;
    original: any;
    normalized: any;
  }>;
  status?: 'success' | 'error' | 'validation_error';
};

/**
 * Creates a form action with comprehensive validation, analytics tracking, and error handling.
 * This is a factory function that returns a server action function designed to be wrapped with withAuth.
 */
export async function createFormAction<T, R = any>(options: FormActionOptions<T>) {
  const {
    entityType,
    schemaKey = entityType,
    dbOperation,
    analyticsEventType = 'created',
    successRedirect,
    revalidatePaths = [],
    customContext = {}
  } = options;
  
  // Create the form pipeline
  const { processData } = createFormPipeline<T>({
    schemaKey,
  });
  
  // Create the server action
  return async function formAction(
    { db, user, userId, tenantId }: ActionContext,
    prevState: any,
    formData: FormData
  ): Promise<FormActionResult<R>> {
    const startTime = performance.now();
    
    try {
      // Extract form data
      const rawData = Object.fromEntries(formData.entries());
      
      // Track performance for form processing
      const pipelineStartTime = performance.now();
      
      // Process data through pipeline
      const pipelineContext: PipelineContext = {
        userId,
        tenantId,
        source: 'server-action',
        operation: analyticsEventType,
        startTime,
        ...customContext
      };
      
      const processResult = await processData(rawData, pipelineContext);
      
      // Track pipeline performance
      await trackPerformanceMetric(
        userId,
        tenantId,
        'form_pipeline_processing',
        performance.now() - pipelineStartTime,
        { entityType, schemaKey }
      );
      
      // Handle validation errors
      if (processResult.errors) {
        // Track form error
        await trackFormError({
          userId,
          tenantId,
          formType: entityType,
          errorMessage: processResult.errors.join(', '),
          entityType,
          fieldsWithErrors: Object.keys(processResult.fieldErrors || {}).length,
          processingTimeMs: performance.now() - startTime,
        });
        
        // Return validation errors
        return {
          error: processResult.errors.join(', '),
          fieldErrors: processResult.fieldErrors,
          changes: processResult.changes,
          status: 'validation_error'
        };
      }
      
      // Track database operation performance
      const dbStartTime = performance.now();
      
      // Perform database operation
      const result = await dbOperation(db, processResult.result, user);
      
      // Track DB performance
      await trackPerformanceMetric(
        userId,
        tenantId,
        'db_operation',
        performance.now() - dbStartTime,
        { entityType, operation: analyticsEventType }
      );
      
      // Track success
      await trackFormSuccess({
        userId,
        tenantId,
        formType: entityType,
        entityType,
        entityId: result.id?.toString(),
        processingTimeMs: performance.now() - startTime,
        normalizationChanges: processResult.changes.length,
      });
      
      // Track entity event
      if (analyticsEventType === 'created') {
        await trackEntityCreated({
          userId,
          tenantId,
          entityType,
          entityId: result.id?.toString() || 'unknown',
        });
      } else if (analyticsEventType === 'updated') {
        await trackEntityUpdated({
          userId,
          tenantId,
          entityType,
          entityId: result.id?.toString() || rawData.id?.toString() || 'unknown',
        });
      }
      
      // Revalidate paths
      if (revalidatePaths.length > 0) {
        revalidatePaths.forEach(path => revalidatePath(path));
      }
      
      // Handle redirect
      if (successRedirect) {
        const redirectUrl = typeof successRedirect === 'function'
          ? successRedirect(result)
          : successRedirect;
        
        redirect(redirectUrl);
      }
      
      // Return success result
      return {
        data: result,
        changes: processResult.changes,
        status: 'success'
      };
    } catch (error) {
      // Capture the error for observability
      const errorMessage = await captureErrorBase(error, {
        context: `${entityType}FormAction`,
        userId,
        tenantId,
        source: 'server-action',
        additionalData: { 
          rawData: Object.fromEntries(formData.entries()),
          entityType,
          schemaKey
        }
      });
      
      // Track form error
      await trackFormError({
        userId,
        tenantId,
        formType: entityType,
        errorMessage: errorMessage,
        entityType,
        processingTimeMs: performance.now() - startTime,
      });
      
      // Return error
      return {
        error: errorMessage,
        status: 'error'
      };
    }
  };
}