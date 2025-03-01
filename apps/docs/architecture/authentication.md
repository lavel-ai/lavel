---
title: 'Authentication Flow'
description: 'User authentication and tenant routing'
---

# Authentication Flow

Lavel AI implements a secure authentication system that integrates with our multi-tenant architecture, ensuring users are directed to their appropriate tenant environments.

## Architecture Overview

<Frame>
  <img src="/images/architecture/authentication-flow.png" alt="Authentication Flow" />
</Frame>

The authentication system consists of:

1. **Auth Provider**: Clerk authentication service
2. **Auth Middleware**: Route protection and session validation
3. **Tenant Router**: Organization-based subdomain routing
4. **Security Headers**: HTTP security configurations

## Core Components

### Auth Middleware

The authentication middleware protects routes and validates user sessions:

```typescript
// apps/app/middleware.ts
import { authMiddleware } from '@repo/auth/middleware';
import { NextResponse } from 'next/server';
import {
  noseconeMiddleware,
  noseconeOptions,
  noseconeOptionsWithToolbar,
} from '@repo/security/middleware';
import { env } from '@/env';

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
    '/(api|trpc)(.*)',
  ],
};

const securityHeaders = env.FLAGS_SECRET
  ? noseconeMiddleware(noseconeOptionsWithToolbar)
  : noseconeMiddleware(noseconeOptions);

export default authMiddleware(async (_auth, request) => {
  // Add security headers FIRST
  const response = securityHeaders();

  // Check for auth and run remaining middleware
  return response;
});
```

### Authentication Verification

The authenticated layout verifies user authentication and handles tenant routing:

```typescript
// From the authenticated layout
const AppLayout = async ({ children }: AppLayoutProperties) => {
  const { userId, redirectToSignIn } = await auth();

  if (!userId) {
    return redirectToSignIn();
  }

  const user = await currentUser();
  if (!user) {
    return redirectToSignIn();
  }

  // Tenant routing logic follows...
}
```

### Tenant Routing

After authentication, users are directed to their organization's subdomain:

```typescript
// Tenant routing in authenticated layout
const headersList = await headers();
const hostname = headersList.get('host') || '';
const appUrlWithoutProtocol = env.NEXT_PUBLIC_APP_URL?.replace(
  /^https?:\/\//,
  ''
);
const isMainDomain =
  hostname === appUrlWithoutProtocol || hostname === 'localhost:3000';

if (isMainDomain) {
  // Only do organization lookup and redirect on main domain
  const orgInfo = await fetchUserOrganization(userId);
  if (orgInfo?.slug) {
    // Redirect to tenant subdomain
    const protocol = env.NEXT_PUBLIC_APP_URL?.startsWith('https')
      ? 'https'
      : 'http';
    const tenantUrl = `${protocol}://${orgInfo.slug}.${env.NEXT_PUBLIC_APP_URL?.replace(/^https?:\/\//, '')}`;
    redirect(tenantUrl);
  } else {
    // If no org found, redirect to onboarding
    redirect('/onboarding');
  }
}
```

### Tenant Utilities

To implement our multi-tenant architecture, we've created specialized utility functions that handle tenant identification and database connections:

#### Tenant Identification

The `getTenantIdentifier` utility extracts the tenant identifier from the request hostname:

```typescript
// apps/app/app/utils/tenant-identifier.ts
'use server';
import { env } from '@/env';
import { headers } from 'next/headers';

/**
 * Extracts and returns the tenant identifier from the current request's host header.
 */
export const getTenantIdentifier = async (): Promise<string> => {
  const headersList = await headers();
  const host = headersList.get('host');

  if (!host) {
    throw new Error('Host header not found');
  }

  // Handle both production (yourdomain.com) and development (localhost:3000)
  const appUrlWithoutProtocol = env.NEXT_PUBLIC_APP_URL?.replace(
    /^https?:\/\//,
    ''
  );
  const isMainDomain =
    host === appUrlWithoutProtocol || host === 'localhost:3000';

  if (isMainDomain) {
    // Handle the case where no subdomain is present, you are on the main domain.
    return '';
  }

  // Extract subdomain
  const subdomain = host.split('.')[0];
  return subdomain;
};
```

This function is critical for all tenant-aware operations as it:
- Extracts the subdomain from the hostname (e.g., `mg` from `mg.lavel.ai`)
- Returns an empty string for the main application domain
- Works in both production and development environments

#### Tenant Database Connection

Once we have the tenant identifier, we use `getTenantDbClientUtil` to establish a database connection specific to that tenant:

```typescript
// apps/app/app/utils/get-tenant-db-connection.ts
"use server";
import { createTenantDbClient, type TenantDatabase } from '@repo/database/src/tenant-app/tenant-connection-db';
import type { DrizzleClient } from '@repo/database/src/tenant-app/tenant-connection-db';
import { getTenantConnectionUrlAction } from '../actions/users/tenant-actions';

let tenantDbClient: TenantDatabase | null = null;

/**
 * Utility function to get the tenant database client in Server Actions and Server Components.
 */
export async function getTenantDbClientUtil(): Promise<TenantDatabase> {
  if (tenantDbClient) {
    return tenantDbClient;
  }

  const connectionString = await getTenantConnectionUrlAction();
  if (!connectionString) {
    throw new Error('Failed to get tenant database connection URL.');
  }

  tenantDbClient = createTenantDbClient(connectionString);
  return tenantDbClient;
}
```

This utility:
- Maintains a single database connection for performance
- Obtains the tenant-specific connection string via a server action
- Creates a Drizzle client connected to the tenant's database
- Throws an error if the connection cannot be established

#### How Tenant Utilities Fit into the Authentication Flow

<Frame>
  <img src="/images/architecture/tenant-utils-flow.png" alt="Tenant Utilities Flow" />
</Frame>

These utilities work together with the authentication system:

1. **Authentication Phase**:
   - User authenticates via Clerk
   - Auth middleware validates the session

2. **Tenant Identification**:
   - `getTenantIdentifier()` extracts the tenant from the hostname
   - For main domain requests, user is redirected to their tenant subdomain

3. **Database Connection**:
   - Once on the tenant subdomain, `getTenantDbClientUtil()` establishes the database connection
   - All data operations use this tenant-specific connection

4. **Request Processing**:
   - With authentication verified and tenant context established, the request proceeds
   - All database operations are automatically scoped to the correct tenant

#### Usage Example

Here's how these utilities are typically used in a server action:

```typescript
// Example server action using tenant utilities
'use server';

import { auth } from '@repo/auth/server';
import { getTenantDbClientUtil } from '@/app/utils/get-tenant-db-connection';

export async function getCaseDetails(caseId: string) {
  try {
    // Verify authentication
    const { userId } = await auth();
    if (!userId) {
      return { error: 'Unauthorized' };
    }
    
    // Get tenant database connection
    // Note: The tenant is automatically determined from the request hostname
    const db = await getTenantDbClientUtil();
    
    // Query using tenant-specific database connection
    const caseData = await db.query.cases.findFirst({
      where: (cases, { eq }) => eq(cases.id, caseId)
    });
    
    if (!caseData) {
      return { error: 'Case not found' };
    }
    
    return { data: caseData };
  } catch (error) {
    console.error('Error fetching case:', error);
    return { error: 'Failed to fetch case' };
  }
}
```

This approach ensures that:

1. All requests are properly authenticated
2. Each tenant's data remains isolated
3. Database connections are established efficiently
4. The correct tenant context is maintained throughout the request lifecycle

## Authentication Flow Sequence

<Steps>
  <Step title="Initial Access">
    User accesses the application at lavel.ai
  </Step>
  <Step title="Authentication">
    Auth middleware checks for valid session
  </Step>
  <Step title="Session Validation">
    If not authenticated, user is redirected to Clerk sign-in
  </Step>
  <Step title="Organization Lookup">
    After authentication, system fetches user's organization
  </Step>
  <Step title="Tenant Routing">
    User is redirected to organization-specific subdomain (e.g., mg.lavel.ai)
  </Step>
  <Step title="Onboarding Fallback">
    If no organization exists, user is directed to onboarding
  </Step>
</Steps>

## Security Considerations

The authentication system implements several security measures:

1. **Security Headers**: Applied via nosecone middleware
2. **Protected Routes**: All non-static routes require authentication
3. **Tenant Isolation**: Users can only access their organization's subdomain
4. **Session Management**: Clerk handles secure session management
5. **Feature Flag Integration**: Security headers adapt based on feature flags

## Integration with Feature Flags

Authentication integrates with feature flags to enable:

1. **Toolbar Access**: Admin tools are enabled with the FLAGS_SECRET
2. **Beta Feature Access**: User identity is used for feature targeting
3. **Tenant-specific Features**: Organization context for flag evaluation

## Best Practices

1. **Route Protection**: Always protect sensitive routes with auth middleware
2. **Tenant Validation**: Verify tenant access rights for all data operations
3. **User Context**: Maintain user identity throughout the request lifecycle
4. **Security Headers**: Apply security headers before other middleware
5. **Authentication State**: Handle authentication state consistently across app