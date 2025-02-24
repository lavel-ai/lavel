## SpecStory

## Multitenant Login Middleware Implementation Plan (2/7/2025, 3:15:59 PM)

_**User**_

@login-middleware-plan.md we are working on our implementation plan for multitenant login. 

- we have done @tenant-lookup.ts and now we need to move to the next step, we will go step by step in order to get this done. 
- in step 2 we need to make modifications to the middleware, this is critical since this might break everyghting and we need to pay close attention to it. 

## Additional considerations
- we have @middleware.ts in our auth package this is just a wrapper of clerk middleware @clerkMiddleware.d.ts we do not want to modify this middleware since this comes from clerk directly. 
- @middleware.ts we have another middleware for the main website the marketing one, where users log in
- we also in the app have authenticated routes that follow this layout @layout.tsx 
and the root layout @layout.tsx 
- the design system provider has @index.tsx has an @provider.tsx from auth 

this are all the considerations not sure what we need to take into account. 



---

_**Assistant**_

I'll help you implement Step 2 of the plan - the Tenant Middleware implementation. Given the additional context, we need to be careful to:

1. Not modify the Clerk auth middleware directly
2. Properly integrate with the existing middleware chain
3. Ensure the tenant middleware runs before auth checks

Let's create the tenant middleware implementation:

First, let's create a new file for the tenant middleware:

```typescript:apps/app/middleware/tenant.ts
import { NextResponse, type NextRequest } from 'next/server';
import { getTenantConnectionUrl } from '@repo/database/src/tenant-app/tenant-lookup';
import { createClient } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import * as schema from '@repo/database/src/tenant-app/schema';

// Extend the NextRequest type to include our custom properties
declare module 'next/server' {
  interface NextRequest {
    tenantDb?: ReturnType<typeof drizzle>;
  }
}

export async function tenantMiddleware(req: NextRequest) {
  const hostname = req.headers.get('host');
  if (!hostname) {
    return new NextResponse('No hostname found', { status: 400 });
  }

  // Skip tenant check for main domain and static assets
  const isMainDomain = hostname === process.env.NEXT_PUBLIC_APP_URL?.replace('https://', '');
  const isStaticAsset = req.nextUrl.pathname.startsWith('/_next') || 
                        req.nextUrl.pathname.startsWith('/static');
  
  if (isMainDomain || isStaticAsset) {
    return NextResponse.next();
  }

  // Extract subdomain
  const subdomain = hostname.split('.')[0];
  
  try {
    const connectionUrl = await getTenantConnectionUrl(subdomain);
    
    if (!connectionUrl) {
      // Tenant not found - redirect to main domain or show error
      return NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_APP_URL));
    }

    // Create tenant database client
    const sql = createClient({ connectionString: connectionUrl });
    const tenantDb = drizzle(sql, { schema });

    // Extend the request object with the tenant database client
    req.tenantDb = tenantDb;

    return NextResponse.next();
  } catch (error) {
    console.error('Tenant middleware error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
```

Now, let's modify the main middleware file to incorporate the tenant middleware:

```typescript:apps/app/middleware.ts
import { env } from '@/env';
import { authMiddleware } from '@repo/auth/middleware';
import { parseError } from '@repo/observability/error';
import { secure } from '@repo/security';
import {
  noseconeMiddleware,
  noseconeOptions,
  noseconeOptionsWithToolbar,
} from '@repo/security/middleware';
import { NextResponse } from 'next/server';
import { tenantMiddleware } from './middleware/tenant';

export const config = {
  matcher: ['/((?!_next/static|_next/image|ingest|favicon.ico).*)'],
};

const securityHeaders = env.FLAGS_SECRET
  ? noseconeMiddleware(noseconeOptionsWithToolbar)
  : noseconeMiddleware(noseconeOptions);

// Compose middleware functions
export default authMiddleware(async (auth, request) => {
  // First, run tenant middleware
  const tenantResponse = await tenantMiddleware(request);
  
  // If tenant middleware returns a response (error/redirect), return it
  if (tenantResponse instanceof NextResponse) {
    return tenantResponse;
  }

  // Continue with security checks
  if (!env.ARCJET_KEY) {
    return securityHeaders();
  }

  try {
    await secure(
      [
        'CATEGORY:SEARCH_ENGINE',
        'CATEGORY:PREVIEW',
        'CATEGORY:MONITOR',
      ],
      request
    );

    return securityHeaders();
  } catch (error) {
    const message = parseError(error);
    return NextResponse.json({ error: message }, { status: 403 });
  }
});
```

Let's also create a utility to access the tenant database client:

```typescript:apps/app/utils/tenant-db.ts
import { NextRequest } from 'next/server';

export function getTenantDb(req: NextRequest) {
  if (!req.tenantDb) {
    throw new Error('Tenant database client not initialized. Make sure tenant middleware is running.');
  }
  return req.tenantDb;
}
```

This implementation:

1. Creates a dedicated tenant middleware that:
   - Checks the hostname and extracts the subdomain
   - Skips tenant checks for the main domain and static assets
   - Establishes a database connection for valid tenants
   - Attaches the tenant database client to the request object

2. Integrates with the existing middleware chain by:
   - Running before the auth middleware
   - Preserving the existing security and auth checks
   - Properly handling errors and redirects

3. Provides a utility function to safely access the tenant database client

Key considerations in this implementation:

- We're not modifying the Clerk auth middleware directly
- We maintain the existing security features
- We handle both main domain and subdomain scenarios
- We provide proper error handling and type safety
- We keep the middleware chain intact while adding tenant functionality

To use this in your application:

1. The tenant database client can be accessed in route handlers using the utility:
```typescript
import { getTenantDb } from '@/utils/tenant-db';

export async function GET(req: NextRequest) {
  const tenantDb = getTenantDb(req);
  // Use tenantDb to query the tenant's database
}
```

2. The middleware will automatically handle redirects for invalid tenants and ensure proper database connections for valid ones.

Would you like me to explain any part of this implementation in more detail?

---

_**User**_

ok i think we need to take a step back and reconsider, lets plan again, from what i get we are determining and calling the db upon the slug of the user, but we are not currently setting this anywhere.

As of now we have a simple login-flow, where the user logs in using clerk auth and gets redirected to the app. 

so the fact that we determine the queries to the db to get the url string from the slug doesnt actually make any sense, does it? 

---

_**Assistant**_

You make a very good point. Let's analyze the flow:

Current Flow:
1. User goes to main domain (e.g. lavel.ai)
2. User logs in through Clerk
3. User gets redirected to the app layout

What we want:
1. User goes to main domain (e.g. lavel.ai)
2. User logs in through Clerk
3. We look up their default organization
4. We redirect them to their tenant subdomain (e.g. tenant-a.lavel.ai)
5. Then tenant middleware kicks in to set up the correct database connection

You're right - trying to determine the tenant DB from the subdomain first doesn't make sense because:
1. Users initially log in on the main domain
2. We need to know where to redirect them after login
3. Only after redirection should we use the subdomain to set up the tenant DB connection

Let's modify our approach. We should first implement:

1. The organization lookup query in the main DB:

```typescript:packages/database/src/main-app/queries/organization-queries.ts
import { db } from '../db';
import { eq } from 'drizzle-orm';
import { organizationMembers, organizations } from '../schema';

export async function fetchDefaultOrganizationForUser(userId: string) {
    // Find the first organization this user is a member of
    // In the future, you might want to add logic for "default" organization
    const result = await db.query.organizationMembers.findFirst({
        where: eq(organizationMembers.userId, userId),
        with: {
            organization: {
                columns: {
                    id: true,
                    slug: true,
                    name: true
                }
            }
        }
    });

    return result?.organization || null;
}
```

2. Then modify the authenticated layout to handle the redirect:

```typescript:apps/app/app/(authenticated)/layout.tsx
import { env } from '@/env';
import { auth, currentUser } from '@repo/auth/server';
import { fetchDefaultOrganizationForUser } from '@repo/database/src/main-app/queries/organization-queries';
import { SidebarProvider } from '@repo/design-system/components/ui/sidebar';
import { redirect } from 'next/navigation';

// ... other imports

const AppLayout = async ({ children }: AppLayoutProperties) => {
  const user = await currentUser();
  const { redirectToSignIn } = await auth();

  if (!user) {
    return redirectToSignIn();
  }

  // Get hostname to determine if we're on main domain
  const hostname = headers().get('host') || '';
  const isMainDomain = hostname === env.NEXT_PUBLIC_APP_URL?.replace('https://', '');

  if (isMainDomain) {
    // Only do organization lookup and redirect on main domain
    const defaultOrg = await fetchDefaultOrganizationForUser(user.id);
    
    if (defaultOrg?.slug) {
      // Redirect to tenant subdomain
      const tenantUrl = `https://${defaultOrg.slug}.${env.NEXT_PUBLIC_APP_URL?.replace('https://', '')}`;
      redirect(tenantUrl);
    }
    // If no org found, could redirect to onboarding or show error
    redirect('/onboarding');
  }

  // Rest of the layout code...
  return (
    <NotificationsProvider userId={user.id}>
      // ... existing layout JSX
    </NotificationsProvider>
  );
};
```

After we have this working, then we can implement the tenant middleware to handle the database connection when users are on the subdomain.

Does this revised approach make more sense? We're first ensuring users get to the right tenant subdomain, and only then worry about setting up the tenant-specific database connection.

---

_**User**_

lets firs modify our flow in our research file @login-middleware-database.md 

please take into consideration what we have seen before and why we need to make some modifications to our system. 

write a detailed step by step eg. 

1. user logs credential in clerk component
2. using clerk middleware or auth something like this that we currently use since u alreday have the code we can write it addecuatley, we verify and redirect the user to 
3. in the middleware we check the clerk id and query the db to get the connection url 

here are the pieces of the puzzle @middleware.ts @middleware.ts @middleware.ts @middleware.ts @provider.tsx @index.tsx @layout.tsx 


---

_**Assistant**_

You're right - let's revise the flow based on our actual codebase. I'll write a detailed step-by-step flow:

```markdown:.cursor/research/login-middleware-database.md
## Revised System Flow: Multi-Tenant Login Implementation

### Current System Components:
1. Clerk Authentication (`@repo/auth/middleware.ts`):
   - Simple wrapper around Clerk's middleware
   - Handles session verification

2. Security Headers (`@repo/security/middleware.ts`):
   - Nosecone middleware for security headers
   - Applied after auth checks

3. App Layout Chain:
   - Root Layout (`apps/app/app/layout.tsx`): 
     - Wraps everything in DesignSystemProvider
   - Design System Provider (`packages/design-system/index.tsx`):
     - Wraps app in AuthProvider, AnalyticsProvider
   - Auth Provider (`packages/auth/provider.tsx`):
     - Configures Clerk UI/theming
   - Authenticated Layout (`apps/app/app/(authenticated)/layout.tsx`):
     - Handles authenticated routes
     - Currently just checks if user is logged in

### Revised Authentication & Tenant Flow:

1. **Initial Auth (Main Domain - lavel.ai)**
   - User visits protected route
   - Clerk middleware redirects to login
   - User logs in via Clerk UI
   - Clerk creates session & redirects back

2. **Tenant Middleware (Before Clerk Auth)**
   ```typescript
   // 1. Check if request is for main domain or subdomain
   // 2. If subdomain:
   //    - Extract tenant slug
   //    - Query connection URL from main DB
   //    - Set up tenant DB connection
   // 3. If main domain:
   //    - Let request continue to Clerk auth
   ```

3. **Auth Middleware (After Tenant Check)**
   ```typescript
   // 1. Verify Clerk session
   // 2. If valid:
   //    - Add user object to request
   //    - Continue to route
   // 3. If invalid:
   //    - Redirect to login
   ```

4. **Post-Login Organization Check**
   ```typescript
   // In authenticated layout:
   // 1. Get user from Clerk
   // 2. Query main DB for user's organizations
   // 3. If has organization:
   //    - Redirect to tenant subdomain
   // 4. If no organization:
   //    - Redirect to onboarding
   ```

### Implementation Order:

1. **Step 1: Organization Query**
   - We already have `fetchDefaultOrganizationForUser` in `organization-queries.ts`
   - Returns organization with subdomain slug

2. **Step 2: Tenant Middleware**
   - New middleware to run before Clerk auth
   - Handles subdomain detection & DB setup
   - Uses `getTenantConnectionUrl` from `tenant-lookup.ts`

3. **Step 3: Middleware Chain**
   - Modify `apps/app/middleware.ts` to:
     ```typescript
     export default chain([
       tenantMiddleware,
       authMiddleware,
       securityHeaders
     ]);
     ```

4. **Step 4: Post-Login Redirect**
   - Modify authenticated layout to:
     - Check if on main domain
     - Query user's organization
     - Redirect to subdomain

### Key Differences from Original Plan:

1. **Middleware Order**
   - Tenant middleware must run first
   - Then auth middleware
   - Finally security headers

2. **Database Access**
   - Main DB queries happen in authenticated layout
   - Tenant DB connection happens in middleware

3. **Session Flow**
   - Keep Clerk's session management
   - Add tenant context to request
   - Use both for route protection

### Security Considerations:

1. **Subdomain Access**
   - Must verify user has access to tenant
   - Check organization membership

2. **Database Connections**
   - Cache connection strings
   - Handle connection errors
   - Proper cleanup

3. **Redirects**
   - Validate subdomain before redirect
   - Handle invalid/missing organizations

This revised flow better integrates with our existing Clerk authentication while adding the tenant-specific functionality we need.
```

This revision:
1. Accounts for our actual Clerk implementation
2. Maintains existing security headers
3. Works with our current layout structure
4. Provides a clearer order of operations

Would you like me to explain any part in more detail or move forward with implementing a specific component?

---



---

