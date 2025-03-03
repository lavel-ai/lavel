// packages/schema/src/actions/with-auth.ts
import { auth } from '@repo/auth/server';
import { captureError } from '@repo/observability/error';

/**
 * Authentication context provided to server actions
 */
export interface AuthContext {
  db: any;
  user: any;
  userId: string;
  tenantId?: string;
}

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
  return async function(...args: Args): Promise<Return | { status: 'error'; message: string }> {
    try {
      // Authentication check
      const { userId } = await auth();
      if (!userId) {
        return { status: 'error', message: 'Unauthorized' };
      }
      
      // Get tenant database connection
      const getTenantDbClientUtil = (await import('../utils/get-tenant-db-connection')).getTenantDbClientUtil;
      const db = await getTenantDbClientUtil();
      
      // Get tenant identifier
      const getTenantIdentifier = (await import('../utils/tenant-identifier')).getTenantIdentifier;
      const tenantId = await getTenantIdentifier();
      
      // Map Clerk ID to internal user ID
      const user = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.clerkId, userId)
      });
      
      if (!user) {
        return { status: 'error', message: 'User not found' };
      }
      
      // Call the actual action with the authenticated context
      return actionFn({ db, user, userId, tenantId }, ...args);
    } catch (error) {
      // Log and capture the error
      captureError(error, {
        context: 'serverAction',
        userId: (await auth())?.userId,
        source: 'withAuth',
        additionalData: { args: JSON.stringify(args) }
      });
      
      return { status: 'error', message: 'An error occurred' };
    }
  };
}