// apps/app/app/utils/with-auth.ts
import { auth } from '@repo/auth/server';
import { captureErrorBase } from '@repo/observability/error-capture';
import { trackErrorEvent, trackUserAction } from '@repo/analytics/server';

/**
 * Authentication context provided to server actions
 */
export interface AuthContext {
  db: any;
  user: any;
  userId: string;
  tenantId: string;
}

/**
 * Standard response format for server actions
 */
export type ActionResponse<T> = 
  | { status: 'success'; data: T; }
  | { status: 'error'; error: string; fieldErrors?: Record<string, string[]>; }
  | { status: 'unauthorized'; error: string; }
  | { status: 'not_found'; error: string; };

/**
 * Higher-order function that wraps server actions with authentication
 * and tenant context. Works for both regular actions and form actions.
 * 
 * @param actionFn The server action function to wrap
 * @returns An authenticated server action
 */
export function withAuth<Args extends any[], Return>(
  actionFn: (context: AuthContext, ...args: Args) => Promise<Return>
) {
  return async function(...args: Args): Promise<Return | ActionResponse<any>> {
    try {
      // Authentication check
      const { userId } = await auth();
      if (!userId) {
        const errorMessage = 'Authentication required';
        
        // Track unauthorized access attempt
        await trackErrorEvent({
          userId: 'anonymous',
          tenantId: 'unknown',
          errorMessage,
          errorContext: 'authentication',
          source: 'withAuth',
          severity: 'medium',
          tags: ['auth', 'unauthorized']
        });
        
        return { 
          status: 'unauthorized', 
          error: errorMessage 
        };
      }
      
      // Get tenant database connection
      const getTenantDbClientUtil = (await import('../utils/get-tenant-db-connection')).getTenantDbClientUtil;
      const db = await getTenantDbClientUtil();
      
      // Get tenant identifier
      const getTenantIdentifier = (await import('../utils/tenant-identifier')).getTenantIdentifier;
      const tenantId = await getTenantIdentifier();
      
      if (!tenantId) {
        const errorMessage = 'Tenant context required';
        
        // Track missing tenant context
        await trackErrorEvent({
          userId,
          tenantId: 'unknown',
          errorMessage,
          errorContext: 'tenant_resolution',
          source: 'withAuth',
          severity: 'high',
          tags: ['auth', 'tenant']
        });
        
        return { 
          status: 'error', 
          error: errorMessage 
        };
      }
      
      // Map Clerk ID to internal user ID
      const user = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.clerkId, userId)
      });
      
      if (!user) {
        const errorMessage = 'User not found in tenant context';
        
        // Track user not found
        await trackErrorEvent({
          userId,
          tenantId,
          errorMessage,
          errorContext: 'user_resolution',
          source: 'withAuth',
          severity: 'high',
          tags: ['auth', 'user_not_found']
        });
        
        return { 
          status: 'not_found', 
          error: errorMessage 
        };
      }
      
      // Track successful authentication
      await trackUserAction(
        userId,
        tenantId,
        'authenticated_action',
        { actionType: actionFn.name || 'unknown_action' }
      );
      
      // Call the actual action with the authenticated context
      return actionFn({ db, user, userId, tenantId }, ...args);
    } catch (error) {
      // Get user ID if possible (for error tracking)
      let errorUserId = 'unknown';
      try {
        errorUserId = (await auth())?.userId || 'unknown';
      } catch {
        // Ignore auth errors in error handler
      }
      
      // Capture the error for observability
      const errorMessage = await captureErrorBase(error, {
        context: 'serverAction',
        userId: errorUserId,
        source: 'withAuth',
        additionalData: { 
          args: JSON.stringify(args),
          actionName: actionFn.name || 'unknown_action'
        }
      });
      
      // Track error event
      await trackErrorEvent({
        userId: errorUserId,
        tenantId: 'unknown',
        errorMessage,
        errorContext: 'server_action',
        source: 'withAuth',
        severity: 'high',
        additionalData: {
          actionName: actionFn.name || 'unknown_action'
        },
        tags: ['server_action', 'runtime_error']
      });
      
      return { 
        status: 'error', 
        error: errorMessage 
      };
    }
  };
}