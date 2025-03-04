// packages/schema/src/actions/with-auth.ts
import { auth } from '@repo/auth/server';
import { captureError } from '@repo/observability/error';

// Re-export from the app's existing withAuth utility for compatibility
export { withAuth } from '../../../../apps/app/app/utils/with-auth';

/**
 * Creates an authenticated server action with the form action context
 */
export function withFormAuth<Args extends any[], Return>(
  actionFn: (context: { db: any; user: any; userId: string; tenantId?: string }, ...args: Args) => Promise<Return>
) {
  return async function(...args: Args): Promise<Return | { status: 'error'; message: string }> {
    try {
      // Authentication check
      const { userId } = await auth();
      if (!userId) {
        return { status: 'error', message: 'Unauthorized' };
      }
      
      // Get tenant database connection
      const getTenantDbClientUtil = (await import('../../../../apps/app/app/utils/get-tenant-db-connection')).getTenantDbClientUtil;
      const db = await getTenantDbClientUtil();
      
      // Get tenant identifier
      const getTenantIdentifier = (await import('../../../../apps/app/app/utils/tenant-identifier')).getTenantIdentifier;
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
      captureError(error, {
        context: 'serverAction',
        args: JSON.stringify(args)
      });
      
      return { status: 'error', message: 'An error occurred' };
    }
  };
}