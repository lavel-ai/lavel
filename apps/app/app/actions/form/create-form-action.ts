// packages/schema/src/actions/create-form-action.ts
'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createFormPipeline, PipelineContext } from '@repo/schema/src/form/create-form-pipeline';
import { trackFormSuccess, trackFormError, trackEntityCreated, trackEntityUpdated } from '@repo/analytics/posthog/actions/server-actions';
import { captureError } from '@repo/observability/error';

export interface ActionContext {
  db: any;
  user: any;
  userId: string;
  tenantId?: string;
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

export async function createFormAction<T>(options: FormActionOptions<T>) {
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
  ) {
    const startTime = performance.now();
    
    try {
      // Extract form data
      const rawData = Object.fromEntries(formData.entries());
      
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
      
      // Handle validation errors
      if (processResult.errors) {
        // Track form error
        await trackFormError({
          userId,
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
          changes: processResult.changes
        };
      }
      
      // Perform database operation
      const result = await dbOperation(db, processResult.result, user);
      
      // Track success
      await trackFormSuccess({
        userId,
        formType: entityType,
        entityType,
        processingTimeMs: performance.now() - startTime,
        normalizationChanges: processResult.changes.length,
      });
      
      // Track entity event
      if (analyticsEventType === 'created') {
        await trackEntityCreated({
          userId,
          entityType,
          entityId: result.id?.toString() || 'unknown',
          tenantId,
        });
      } else if (analyticsEventType === 'updated') {
        await trackEntityUpdated({
          userId,
          entityType,
          entityId: result.id?.toString() || rawData.id?.toString() || 'unknown',
          tenantId,
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
        changes: processResult.changes
      };
    } catch (error) {
      // Track error
      await trackFormError({
        userId,
        formType: entityType,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        entityType,
        processingTimeMs: performance.now() - startTime,
      });
      
      // Capture error for observability
      captureError(error, {
        context: `${entityType}FormAction`,
        userId,
        tenantId,
        source: 'server-action',
        additionalData: { rawData: Object.fromEntries(formData.entries()) }
      });
      
      // Return error
      return {
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
      };
    }
  };
}