# Data Fetching Guidelines and Rules

This document outlines the guidelines and rules for designing data fetching components in our Next.js application with a multi-tenant architecture. These rules ensure consistency, efficiency, security, and maintainability.

## I. Core Principles

1. **Server-Centric Data Fetching**: Prioritize fetching data on the server using Server Components and Server Actions for initial data. Use React Query in Client Components for interactive data updates.
2. **Centralized Connection Management**: Use getTenantDbClientUtil() to obtain the tenant database connection exclusively within Server Actions, handling tenant identification and connection reuse.
3. **Separation of Concerns**: Clearly separate data fetching logic (Server Actions in features/[feature]/actions/ or app/actions/), database query logic (query functions in @repo/database), and presentation logic (components). Map Clerk clerkId to internal users.id in Server Actions.
4. **Caching**: Leverage Next.js's built-in request memoization, Redis caching (for connection URLs), and React Query's cache for client-side data to minimize database load and improve response times.
5. **Error Handling**: Implement robust error handling in Server Actions and propagate errors to the UI. Use useToast for user feedback on errors or successes.
6. **Authentication and Authorization**:
   - Always verify user authentication using Clerk (auth() from @repo/auth/server) within Server Actions before accessing data.
   - Map clerkId to users.id for internal operations.
   - Implement authorization checks based on users.id to ensure data access control.
7. **Type Safety**: Use TypeScript throughout to ensure type safety and catch errors early, including Clerk IDs, internal IDs, and React Query hooks.
8. **Optimistic Updates**: For mutations, use React Query to perform optimistic UI updates, enhancing perceived performance with rollback on failure.

## II. Component Design Rules

1. **Server Components for Initial Data**:
   - Use Server Components to fetch initial data required to render a page or component.
   - Call Server Actions from features/[feature]/actions/ directly within Server Components.
   - Pass fetched data as props to child components (Server or Client).
2. **Client Components for Interactivity**:
   - Use Client Components for handling user interactions, managing local state, and using browser APIs.
   - Receive initial data as props from parent Server Components.
   - Never call Server Actions directly from useEffect; use event handlers or React Query (useQuery, useMutation).
   - Integrate useToast to notify users of operation outcomes (e.g., success, error).
   - For data updates, use React Query with optimistic updates via onMutate for mutations.
3. **BaseKPI and Similar Components**:
   - Keep as Server Components if they don't require interactivity. For interactive updates (e.g., refresh), wrap in a Client Component using React Query.
   - Pass only serializable data as props to Client Components. If passing components (e.g., icons), ensure the parent is a Server Component.
4. **Avoid Prop Drilling**:
   - Pass data as props primarily. For deeply nested components, create specific Server Actions in features/[feature]/actions/ or use lightweight React Query queries/context for Client Components (minimizing re-renders).

## III. Server Action Rules

1. **Location**:
   - **Primary**: Place Server Actions in apps/app/(authenticated)/features/[feature]/actions/, organized by feature (e.g., cases/actions/create-case.ts, clients/actions/create-client.ts).
   - **Global**: Store cross-feature or app-wide actions in apps/app/actions/ (e.g., tenant-actions.ts, auth-utils.ts).
2. **Authentication**:
   - Always check user authentication using auth() from @repo/auth/server at the start of each Server Action to retrieve clerkId.
   - Map clerkId to users.id using a utility (e.g., getInternalUserId in app/actions/auth-utils.ts).
3. **Tenant DB Connection**: Use getTenantDbClientUtil() to obtain the tenant database client inside each Server Action.
4. **Query Functions**: Call query functions from @repo/database (e.g., cases-queries.ts) to perform database operations, passing the tenantDb client and users.id where applicable.
5. **Error Handling**:
   - Use try...catch blocks to handle errors.
   - Log errors (e.g., console.error).
   - Return consistent error format: { status: 'error', message: string }.
   - Return success format: { status: 'success', data: T }.
   - Consider a shared error utility in app/actions/.
6. **Data Validation**: Validate client data (e.g., form submissions) before database interaction using a schema validation library like Zod.
7. **Data Normalization**:
   - For fetched data: Apply normalization functions from @repo/database/src/tenant-app/utils/normalize/[entity].ts (e.g., normalizeCase) before returning.
   - For mutations: Re-apply normalization to ensure consistency (e.g., before db.insert).
8. **Revalidation**: Use revalidatePath or revalidateTag after mutations to ensure data consistency.
9. **Return Values**: Return plain, serializable objects with status indicators (e.g., { status, data/message }).

## IV. Query Function Rules

1. **Location**: Place query functions in @repo/database/src/tenant-app/queries/, organized by resource (e.g., cases-queries.ts).
2. **Database Client**: Accept the tenantDb (Drizzle client) as an argument.
3. **Focus**: Contain only Drizzle query logic. Do not handle authentication, authorization, or normalization here.
4. **Return Values**: Return raw Drizzle query results directly.
5. **Type Safety**: Use Drizzle-generated types and reference users.id for user-related queries.

## V. Client-Side Data Fetching and Mutation Rules

1. **React Query Setup**: Wrap the app in ReactQueryProvider from @repo/design-system to enable React Query.
2. **Fetching**:
   - Use useQuery in Client Components for interactive data fetching (e.g., search results).
   - Example:
   ```typescript
   import { getCases } from '@/app/(authenticated)/features/cases/actions/get-cases';
   const { data, isLoading } = useQuery({
     queryKey: ['cases', searchTerm],
     queryFn: async () => {
       const response = await getCases(searchTerm);
       return response.data;
     },
   });
   ```

3. **Mutations with Optimistic Updates**:
   - Use useMutation for mutations with useToast for feedback and optimistic updates via onMutate.
   - Example:
   ```typescript
   import { createCase } from '@/app/(authenticated)/features/cases/actions/create-case';
   const { toast } = useToast();
   const queryClient = useQueryClient();
   const mutation = useMutation({
     mutationFn: createCase,
     onMutate: async (newCase) => {
       await queryClient.cancelQueries(['cases']);
       const previousCases = queryClient.getQueryData(['cases']);
       queryClient.setQueryData(['cases'], (old: any) => [...old, newCase]);
       toast({ title: "Case created" });
       return { previousCases };
     },
     onError: (err, _, context) => {
       queryClient.setQueryData(['cases'], context?.previousCases);
       toast({ variant: "destructive", title: "Error", description: err.message });
     },
     onSettled: () => queryClient.invalidateQueries(['cases']),
   });
   ```
4. **Toast Feedback**: Use toast for success/error messages after Server Actions or React Query operations.
5. **Error Handling**: Surface errors via useToast and React Query's error state.

## VI. User ID System

1. **Authentication with Clerk**:
   - Clerk provides clerkId via auth() from @repo/auth/server.
2. **Internal Users Table**:
   - The users table stores clerkId and generates a unique id (UUID).
   - users.id is the canonical ID for database relationships (e.g., createdBy, profiles.userId).
3. **Profiles and Teams**:
   - profiles has its own id (UUID) linked to users.id via userId.
   - team_profiles references profiles.id for team assignments.
4. **ID Mapping**:
   - In Server Actions, map clerkId to users.id:
   ```typescript
   const user = await db.select().from(users).where(eq(users.clerkId, clerkId)).limit(1);
   const userId = user[0].id;
   ```
   - Use users.id for transactions and audit fields; use profiles.id for profile-specific relationships (e.g., team_profiles.profileId).
5. **Consistency**:
   - Always use users.id for ownership and audit fields.
   - Use profiles.id in team_profiles to link professional identities to teams.

## VII. Example Structure
```
apps/app/
├── (authenticated)/
│   ├── features/
│   │   ├── cases/
│   │   │   ├── actions/
│   │   │   │   ├── create-case.ts
│   │   │   │   ├── get-cases.ts
│   │   │   │   └── upload-document.ts
│   │   │   ├── components/
│   │   │   └── schemas/
│   │   ├── clients/
│   │   │   ├── actions/
│   │   │   │   ├── create-client.ts
│   │   │   │   └── get-clients.ts
│   │   │   └── components/
│   │   ├── teams/
│   │   │   ├── actions/
│   │   │   │   ├── create-team.ts
│   │   │   │   └── assign-profile.ts
│   │   │   └── components/
│   │   └── users/
│   │       ├── actions/
│   │       │   ├── get.ts
│   │       │   ├── search.ts
│   │       │   └── user-actions.ts
│   │       └── components/
│   └── actions/
│       ├── tenant-actions.ts  # Global tenant management
│       └── auth-utils.ts     # e.g., getInternalUserId
```
## VIII. Data Flow Diagram

<Frame>
  <img src="/images/guides/data-flow-diagram.png" alt="Data Flow Architecture Diagram" />
</Frame>

The diagram above illustrates the data flow architecture in our application:

1. **Initial Page Load**:
   - User accesses tenant URL (e.g., `mg.lavel.ai/cases`)
   - Server Components fetch initial data via Server Actions
   - HTML with data is sent to the browser

2. **Interactive Updates**:
   - Client Components use React Query to manage data fetching and mutations
   - Server Actions perform database operations and return results
   - React Query handles caching, optimistic updates, and error states

3. **Data Propagation**:
   - After mutations, revalidation triggers refresh of affected data
   - React Query synchronizes client cache with server state

## IX. Tenant Identification

Our application uses subdomain-based tenant identification:

1. **Subdomain Extraction**:
   - Tenant ID is extracted from the request hostname (e.g., `mg.lavel.ai` → tenant ID: `mg`)
   - This is handled automatically in the application middleware and authenticated layout

   ```typescript
   // Simplified example of tenant extraction
   function getTenantFromRequest(req) {
     const host = req.headers.get('host') || '';
     const parts = host.split('.');
     
     // For hostnames like mg.lavel.ai, the tenant is the first part
     if (parts.length >= 3 || (parts.length === 2 && parts[1] === 'localhost:3000')) {
       return parts[0];
     }
     
     return null; // Main domain, no tenant
   }
   ```

2. **Tenant Database Connection**:
   - Using tenant ID, the correct database connection is established
   - `getTenantDbClientUtil()` handles connection pooling and reuse

   ```typescript
   // Example of how getTenantDbClientUtil works
   async function getTenantDbClientUtil(tenantId) {
     // Check Redis cache for connection URL first
     const cacheKey = `db:connection:${tenantId}`;
     const cachedConnectionUrl = await redis.get(cacheKey);
     
     if (cachedConnectionUrl) {
       return createDrizzleClient(cachedConnectionUrl);
     }
     
     // Look up connection info from tenant registry
     const connectionUrl = await lookupTenantConnectionUrl(tenantId);
     
     // Cache the connection URL
     await redis.set(cacheKey, connectionUrl, 'EX', 3600); // 1 hour TTL
     
     // Create and return the database client
     return createDrizzleClient(connectionUrl);
   }
   ```

3. **Tenant Context in Components**:
   - Server Components receive tenant ID from route parameters
   - Server Actions get tenant ID from hostname or parameters
   - This ensures tenant isolation throughout the application flow

## X. Caching Integration

The data flow architecture integrates with our caching strategy at multiple levels:

### 1. Server Component Caching

Next.js automatically caches Server Components unless they use dynamic functions:

```typescript
// Force dynamic rendering for a page that needs fresh data
export const dynamic = 'force-dynamic';

// Page with default caching behavior
export default async function CasesPage({ params }) {
  // This data fetch will be cached according to Next.js defaults
  const cases = await getCases(params.tenant);
  return <CasesList cases={cases} />;
}
```

### 2. React Query Cache

Client Components use React Query for data management with appropriate caching settings:

```typescript
// Custom hook with tenant-aware caching
export function useCasesList(filters = {}) {
  // Get tenant from URL (using next/navigation)
  const params = useParams();
  const tenant = params.tenant;
  
  return useQuery({
    queryKey: ['cases', tenant, filters],
    queryFn: async () => {
      const response = await getCases(filters);
      if (response.status === 'error') {
        throw new Error(response.message);
      }
      return response.data;
    },
    staleTime: 60 * 1000, // 1 minute - adjust based on data volatility
    enabled: !!tenant,
  });
}
```

### 3. Redis Cache in Server Actions

Server Actions can leverage Redis for expensive operations:

```typescript
// Server action with Redis caching
export async function getCases(filters = {}) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { status: 'error', message: 'Unauthorized' };
    }
    
    // Get tenant from hostname
    const tenantId = getTenantFromRequest();
    if (!tenantId) {
      return { status: 'error', message: 'Invalid tenant' };
    }
    
    // Create cache key based on tenant and filters
    const cacheKey = `${tenantId}:cases:list:${JSON.stringify(filters)}`;
    
    // Try to get from Redis cache first
    const cached = await redis.get(cacheKey);
    if (cached) {
      return { status: 'success', data: JSON.parse(cached) };
    }
    
    // If not in cache, fetch from database
    const tenantDb = await getTenantDbClientUtil(tenantId);
    const internalUserId = await getInternalUserId(userId);
    
    // Call the query function with tenant DB client
    const cases = await getCasesQuery(tenantDb, internalUserId, filters);
    
    // Normalize the results
    const normalizedCases = cases.map(normalizeCase);
    
    // Cache the results (with 60-second TTL)
    await redis.set(cacheKey, JSON.stringify(normalizedCases), 'EX', 60);
    
    return { status: 'success', data: normalizedCases };
  } catch (error) {
    console.error('Error fetching cases:', error);
    return { 
      status: 'error', 
      message: 'Failed to fetch cases'
    };
  }
}
```

### 4. Cache Invalidation with URL Revalidation

After mutations, invalidate affected cache entries:

```typescript
// Server action for creating a case with cache invalidation
export async function createCase(data) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { status: 'error', message: 'Unauthorized' };
    }
    
    const tenantId = getTenantFromRequest();
    const tenantDb = await getTenantDbClientUtil(tenantId);
    const internalUserId = await getInternalUserId(userId);
    
    // Insert the case
    const newCase = await insertCaseQuery(tenantDb, {
      ...data,
      createdBy: internalUserId
    });
    
    // Invalidate Redis cache
    await redis.del(`${tenantId}:cases:list:*`);
    
    // Revalidate Next.js cache paths
    revalidatePath(`/${tenantId}/cases`);
    
    return { status: 'success', data: normalizeCase(newCase) };
  } catch (error) {
    console.error('Error creating case:', error);
    return { 
      status: 'error', 
      message: 'Failed to create case'
    };
  }
}
```

### 5. Tenant-aware Path Revalidation

When using `revalidatePath` or `revalidateTag`, include the tenant in the path:

```typescript
// Correctly revalidate tenant-specific paths
revalidatePath(`/${tenantId}/cases`);

// For API routes or shared components
revalidateTag(`tenant-${tenantId}-cases`);
```

This ensures that cache invalidation is properly scoped to the specific tenant, maintaining isolation between tenants even during cache operations.

## XI. Complete Example

Below is a complete example showing how all components work together in our architecture:

### 1. Server Component (Cases Page)

```tsx
// app/(authenticated)/[tenant]/cases/page.tsx
import { Suspense } from 'react';
import { getCases } from '../features/cases/actions/get-cases';
import { CasesList } from '../features/cases/components/cases-list';
import { NewCaseButton } from '../features/cases/components/new-case-button';
import { CasesListSkeleton } from '../features/cases/components/skeletons';

export default async function CasesPage({ params }) {
  // Get initial cases data from server action
  const response = await getCases({});
  
  const initialCases = response.status === 'success' 
    ? response.data 
    : [];
  
  return (
    <div className="p-4">
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold">Cases</h1>
        <NewCaseButton tenant={params.tenant} />
      </div>
      
      <Suspense fallback={<CasesListSkeleton />}>
        {/* Pass initial data to Client Component */}
        <CasesList initialCases={initialCases} tenant={params.tenant} />
      </Suspense>
    </div>
  );
}
```

### 2. Server Action (Get Cases)

```tsx
// app/(authenticated)/features/cases/actions/get-cases.ts
'use server'

import { auth } from '@repo/auth/server';
import { redis } from '@repo/cache/redis';
import { getTenantDbClientUtil } from '@repo/database/tenant-db';
import { getCasesQuery } from '@repo/database/queries/cases-queries';
import { normalizeCase } from '@repo/database/utils/normalize/case';
import { headers } from 'next/headers';

type GetCasesResponse = {
  status: 'success' | 'error';
  data?: any[];
  message?: string;
}

export async function getCases(filters = {}): Promise<GetCasesResponse> {
  try {
    // Authenticate
    const { userId } = await auth();
    if (!userId) {
      return { status: 'error', message: 'Unauthorized' };
    }
    
    // Get tenant from request
    const headersList = headers();
    const host = headersList.get('host') || '';
    const tenantId = host.split('.')[0];
    
    if (!tenantId || tenantId === 'app' || tenantId === 'localhost:3000') {
      return { status: 'error', message: 'Invalid tenant' };
    }
    
    // Try cache first
    const cacheKey = `${tenantId}:cases:list:${JSON.stringify(filters)}`;
    const cached = await redis.get(cacheKey);
    
    if (cached) {
      return { status: 'success', data: JSON.parse(cached) };
    }
    
    // Get tenant database client
    const tenantDb = await getTenantDbClientUtil(tenantId);
    
    // Map clerk ID to internal user ID
    const user = await tenantDb.query.users.findFirst({
      where: (users, { eq }) => eq(users.clerkId, userId)
    });
    
    if (!user) {
      return { status: 'error', message: 'User not found' };
    }
    
    // Get cases from database
    const cases = await getCasesQuery(tenantDb, user.id, filters);
    
    // Normalize cases for client
    const normalizedCases = cases.map(normalizeCase);
    
    // Cache results
    await redis.set(cacheKey, JSON.stringify(normalizedCases), 'EX', 60);
    
    return { status: 'success', data: normalizedCases };
  } catch (error) {
    console.error('Error fetching cases:', error);
    return { status: 'error', message: 'Failed to fetch cases' };
  }
}
```

### 3. Database Query Function

```tsx
// packages/database/src/tenant-app/queries/cases-queries.ts
import { eq, and, desc, sql } from 'drizzle-orm';
import { cases, caseAssignments } from '../schema';

export async function getCasesQuery(
  db,
  userId,
  filters = {}
) {
  // Build query based on filters
  const conditions = [
    // Cases created by user or assigned to user
    sql`(${eq(cases.createdBy, userId)} OR EXISTS (
      SELECT 1 FROM ${caseAssignments}
      WHERE ${and(
        eq(caseAssignments.caseId, cases.id),
        eq(caseAssignments.userId, userId)
      )}
    ))`
  ];
  
  // Add status filter if provided
  if (filters.status) {
    conditions.push(eq(cases.status, filters.status));
  }
  
  // Execute query
  return db.select()
    .from(cases)
    .where(and(...conditions))
    .orderBy(desc(cases.createdAt))
    .limit(50);
}
```

### 4. Client Component (Cases List with React Query)

```tsx
'use client'
// app/(authenticated)/features/cases/components/cases-list.tsx
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@repo/design-system/components/ui/toast';
import { getCases } from '../actions/get-cases';
import { useState } from 'react';
import { CaseCard } from './case-card';

export function CasesList({ initialCases, tenant }) {
  const [filters, setFilters] = useState({});
  const { toast } = useToast();
  
  // Use React Query with initial data
  const { data: cases, isLoading, isError, error } = useQuery({
    queryKey: ['cases', tenant, filters],
    queryFn: async () => {
      const response = await getCases(filters);
      if (response.status === 'error') {
        throw new Error(response.message);
      }
      return response.data;
    },
    initialData: initialCases,
    staleTime: 60 * 1000, // 1 minute
  });
  
  // Show error toast if query fails
  if (isError && error) {
    toast({
      variant: "destructive",
      title: "Error loading cases",
      description: error.message
    });
  }
  
  // Filter change handler
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };
  
  return (
    <div>
      <div className="mb-4">
        <CaseFilters 
          filters={filters} 
          onChange={handleFilterChange}
        />
      </div>
      
      {isLoading ? (
        <p>Refreshing...</p>
      ) : cases?.length === 0 ? (
        <p>No cases found</p>
      ) : (
        <div className="grid gap-4">
          {cases?.map(caseItem => (
            <CaseCard key={caseItem.id} caseData={caseItem} />
          ))}
        </div>
      )}
    </div>
  );
}
```

### 5. Mutation with Optimistic Updates

```tsx
'use client'
// app/(authenticated)/features/cases/components/new-case-form.tsx
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@repo/design-system/components/ui/toast';
import { createCase } from '../actions/create-case';
import { useParams, useRouter } from 'next/navigation';

export function NewCaseForm({ onSuccess }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const params = useParams();
  const tenant = params.tenant;
  const router = useRouter();
  
  const mutation = useMutation({
    mutationFn: async (formData) => {
      const response = await createCase(formData);
      if (response.status === 'error') {
        throw new Error(response.message);
      }
      return response.data;
    },
    
    // Optimistic update
    onMutate: async (formData) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries(['cases', tenant]);
      
      // Snapshot current cases
      const previousCases = queryClient.getQueryData(['cases', tenant]);
      
      // Create optimistic case
      const optimisticCase = {
        id: 'temp-id-' + Date.now(),
        title: formData.get('title'),
        status: 'draft',
        createdAt: new Date().toISOString(),
        // Other defaults...
      };
      
      // Add optimistic case to query data
      queryClient.setQueryData(['cases', tenant], (old) => {
        return [optimisticCase, ...(old || [])];
      });
      
      return { previousCases };
    },
    
    // On success
    onSuccess: (data) => {
      toast({
        title: "Case created successfully",
        description: `Case "${data.title}" has been created.`
      });
      
      // Navigate to new case
      router.push(`/${tenant}/cases/${data.id}`);
      
      if (onSuccess) onSuccess();
    },
    
    // On error, rollback to previous cases
    onError: (error, _, context) => {
      queryClient.setQueryData(['cases', tenant], context?.previousCases);
      
      toast({
        variant: "destructive",
        title: "Failed to create case",
        description: error.message
      });
    },
    
    // Always refetch after mutation
    onSettled: () => {
      queryClient.invalidateQueries(['cases', tenant]);
    }
  });
  
  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(new FormData(e.target));
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium">
            Case Title
          </label>
          <input
            id="title"
            name="title"
            className="mt-1 block w-full rounded-md border p-2"
            required
          />
        </div>
        
        <button
          type="submit"
          className="bg-primary text-white px-4 py-2 rounded-md"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? 'Creating...' : 'Create Case'}
        </button>
      </div>
    </form>
  );
}
```

This complete example demonstrates:

1. Server Component fetching initial data
2. Server Action with authentication, tenant context, and caching
3. Drizzle database query in a dedicated function
4. Client Component with React Query for data refreshing
5. Form submission with optimistic updates and error handling
6. Toast notifications for user feedback

All pieces work together to provide a seamless user experience while following the architecture principles outlined in this guide.