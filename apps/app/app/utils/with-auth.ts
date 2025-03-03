// utils/with-auth.ts
import { auth } from '@repo/auth/server';
import { getTenantDbClientUtil } from '@/app/utils/get-tenant-db-connection';
import { parseError } from '@repo/observability/error';

export function withAuth(actionFn: (...args: any[]) => Promise<any>) {
  return async function(...args: any[]) {
    try {
      // Authentication check
      const { userId } = await auth();
      if (!userId) {
        return { status: 'error', message: 'Unauthorized' };
      }
      
      // Get tenant database connection
      const db = await getTenantDbClientUtil();
      
      // Map Clerk ID to internal user ID
      const user = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.clerkId, userId)
      });
      
      if (!user) {
        return { status: 'error', message: 'User not found' };
      }
      
      // Call the actual action with the authenticated context
      return actionFn({ db, user, userId }, ...args);
    } catch (error) {
      parseError(error);
      
      return { status: 'error', message: 'An error occurred' };
    }
  };
}