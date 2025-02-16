## SpecStory

## Multi-Tenant Database Architecture Design (2/14/2025, 1:54:14 PM)

_**User**_

I need you to help me design the architecture on how are we gonna fetch data from our database.
we have a multitenant database app where we need to retrieve the database connection from our main app database, we use @tenant-actions.ts @tenant-db.ts @tenant-lookup.ts 

some additional considerations are that we use clerk for auth and inside our main app databse we have a user id thats the same as the one in the database of the user or tenant. 

For some queries we need the internal user id. 

Lets follow the data architecture for next js apps. 


---

_**Assistant**_

Okay, let's outline a data fetching architecture for your multi-tenant Next.js application, incorporating Clerk authentication and your existing database setup. We'll focus on clarity, security, and Next.js best practices (App Router).

Here's a breakdown of the architecture and the roles of each component, followed by code examples and explanations:

**1. Data Flow Overview**

1.  **Client Request:** A user interacts with your application (e.g., loads a page, clicks a button).
2.  **Server Component / Server Action:**  The request triggers either a Server Component (for initial data loading) or a Server Action (for user-initiated actions).
3.  **Authentication Check (Clerk):**  Use Clerk's `auth()` or `currentUser()` within the Server Component/Action to:
    *   Verify the user is authenticated.
    *   Obtain the Clerk user ID (`userId`).
4.  **Tenant Identification:**
    *   **Server Components:** Use `headers()` from `next/headers` to get the `host` and extract the subdomain (tenant identifier).  You can then use your `getTenantIdentifier` function.
    *   **Server Actions:** You can also use the `headers()` function.
5.  **Tenant DB Connection:**
    *   Call `getTenantDbClientUtil()` (your existing utility function) to establish a connection to the correct tenant database. This function handles:
        *   Getting the tenant identifier.
        *   Retrieving the database connection URL (using `getTenantConnectionUrlAction`, which includes Redis caching).
        *   Creating and returning a Drizzle client (`DrizzleClient`) for that tenant's database.
6.  **Data Query (Tenant Database):**
    *   Use the Drizzle client (`tenantDb`) to perform queries against the tenant's database.
    *   **Crucially:**  If you need the *internal* user ID (the one stored in the tenant database), you'll need a way to map the Clerk `userId` to the internal ID.  We'll address this below.
7.  **Return Data:** The Server Component or Server Action returns the fetched data to the client.
8.  **Client Rendering:** The client-side component receives the data and renders it.

**2. Key Components and Code Examples**

*   **`getTenantIdentifier` (Server Action - `apps/app/app/utils/tenant-identifier.ts` - NEW FILE):**  This is a crucial addition.  It provides a *reliable* way to get the tenant identifier within Server Actions.

```typescript:apps/app/app/utils/tenant-identifier.ts
// apps/app/app/utils/tenant-identifier.ts
"use server";

import { headers } from 'next/headers';

export const getTenantIdentifier = async (): Promise<string> => {
  const host = headers().get('host');
  if (!host) {
    throw new Error('Host header not found');
  }
  // Assuming the tenant subdomain is the first segment (e.g., "tenant" from "tenant.lavel.ai")
  return host.split('.')[0];
};

```

*   **`getTenantDbClientUtil` (Utility Function - `apps/app/app/utils/tenant-db.ts` - MODIFIED):** You already have this, but I've included the updated version that uses the new `getTenantIdentifier` server action.

```typescript:apps/app/app/utils/tenant-db.ts
// apps/app/app/utils/tenant-db.ts
"use server";
import type { NextRequest } from 'next/server';
import { createTenantConnection } from '@repo/database/src/tenant-app/tenant-connection-db'; // Import createTenantConnection
import type { DrizzleClient } from '@repo/database/src/tenant-app/tenant-connection-db';
import { getTenantConnectionUrl } from '@repo/database/src/tenant-app/queries/tenant-lookup';
import { getTenantIdentifier } from './tenant-identifier'; // Import getTenantIdentifier server action

// Extend NextRequest to include our tenant database client.
declare module 'next/server' {
  interface NextRequest {
    tenantDb?: DrizzleClient;
  }
}

/**
 * Retrieves the tenant database client dynamically for production.
 *
 * This function extracts the tenant identifier (subdomain) from the request,
 * uses it to look up the connection URL via `getTenantConnectionUrl`,
 * and then retrieves a cached or new connection using `getTenantConnection`.
 *
 * @param request - The Next.js request object.
 * @returns A promise that resolves to the tenant database client.
 */
// export async function getTenantDbClient(request: NextRequest): Promise<DrizzleClient> {
//   const tenantIdentifier = extractTenantIdentifier(request);
//   // Dynamically look up the connection URL for this tenant.
//   const dbUrl = await getTenantConnectionUrl(tenantIdentifier);
//   if (!dbUrl) {
//     throw new Error(`No connection URL found for tenant: ${tenantIdentifier}`);
//   }
//   return getTenantConnection(dbUrl);
// }

/**
 * Middleware helper to attach the tenant database client to the request.
 *
 * This helper makes the tenant-specific database client available on `request.tenantDb`,
 * so subsequent middleware and route handlers can query the appropriate database.
 *
 * @param request - The incoming NextRequest.
 */
// export async function attachTenantDbToRequest(request: NextRequest): Promise<void> {
//   const tenantDb = await getTenantDbClient(request);
//   request.tenantDb = tenantDb;
// }


// apps/app/app/utils/tenant-db.ts

// import { createTenantConnection } from '@repo/database/src/tenant-app/tenant-connection-db'; // Import createTenantConnection
// import { getTenantIdentifier } from './tenant-identifier'; // Import getTenantIdentifier server action

/**
 * Utility function to get the tenant database client in Server Actions and Server Components.
 *
 * This function replicates the logic of TenantDBProvider to obtain the Drizzle client
 * directly, without relying on React Context or client-side hooks.
 *
 * It is designed to be used within Server Components or Server Actions.
 *
 * @returns The tenant-specific Drizzle client.
 * @throws Error if tenant identifier cannot be determined or connection URL is not found.
 */
export const getTenantDbClientUtil = async (): Promise<DrizzleClient> => {
    try {
        const identifier = await getTenantIdentifier(); // Use server action to get identifier

        // If it is the main domain, throw error as actions should be in tenant context.
        if (identifier === "") {
            throw new Error("Tenant identifier not found in server action context (main domain access not allowed).");
        }

        const connectionUrl = await getTenantConnectionUrl(identifier); // Use server-side function to get connection URL

        if (!connectionUrl) {
            throw new Error(`No connection URL found for tenant: ${identifier}`);
        }

        return createTenantConnection(connectionUrl); // Create the connection directly

    } catch (error: any) {
        console.error("Error in getTenantDbClientUtil:", error);
        throw new Error(`Failed to get Tenant DB Client: ${error.message}`); // Re-throw with more context
    }
};
```

*   **`getTenantConnectionUrlAction` (Server Action - `apps/app/app/actions/users/tenant-actions.ts`):**  You have this; it retrieves the connection URL, using caching.  No changes needed.

*   **Example Server Component (`apps/app/app/(authenticated)/page.tsx` - MODIFIED):**  Shows how to fetch data within a Server Component.

```typescript:apps/app/app/(authenticated)/page.tsx
import { env } from '@/env';
import { auth } from '@repo/auth/server';
import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { notFound } from 'next/navigation';
import { AvatarStack } from './components/avatar-stack';
import { Cursors } from './components/cursors';
import { Header } from './components/header';
import LitigationCasesKPI from './components/dashboard/litigation-cases-kpi';
// import { getTenantDbClientUtil } from '@/app/utils/tenant-db'; // Import the utility
// import { cases } from '@repo/database/src/tenant-app/schema'; // Example: Import your schema

const title = 'Acme Inc';
const description = 'My application.';

const CollaborationProvider = dynamic(() =>
  import('./components/collaboration-provider').then(
    (mod) => mod.CollaborationProvider
  )
);

export const metadata: Metadata = {
  title,
  description,
};

const App = async () => {
  const { orgId, userId } = await auth(); // Get Clerk user ID

  if (!orgId) {
    notFound();
  }

  // Example of fetching data in a Server Component (replace with your actual query)
  // const tenantDb = await getTenantDbClientUtil();
  // const allCases = await tenantDb.select().from(cases);
  // console.log(allCases);


  return (
    <>
      <Header pages={['Building Your Application']} page="Data Fetching">
        {env.LIVEBLOCKS_SECRET && (
          <CollaborationProvider orgId={orgId}>
            <AvatarStack />
            <Cursors />
          </CollaborationProvider>
        )}
      </Header>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="grid auto-rows-min gap-4 md:grid-cols-3">
          {/* {pages.map((page) => (
            <div key={page.id} className="aspect-video rounded-xl bg-muted/50">
              {page.name}
            </div>
          ))} */}
          <LitigationCasesKPI/>
        </div>
        <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" />
      </div>
    </>
  );
};

export default App;
```

*   **Example Server Action (`apps/app/app/actions/cases/cases-actions.ts` - NEW FILE):**  Demonstrates fetching and updating data within a Server Action.

```typescript:apps/app/app/actions/cases/cases-actions.ts
// apps/app/app/actions/cases/cases-actions.ts
"use server";

import { getTenantDbClientUtil } from "@/app/utils/tenant-db";
import { cases } from "@repo/database/src/tenant-app/schema";
import { auth } from "@repo/auth/server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// Example: Fetch all cases for the tenant
export async function getAllCases() {
  try {
    const tenantDb = await getTenantDbClientUtil();
    const allCases = await tenantDb.select().from(cases);
    return allCases;
  } catch (error) {
    console.error("Error fetching cases:", error);
    return null; // Or throw an error, depending on your error handling
  }
}

// Example: Create a new case
export async function createCase(formData: FormData) {
    const { userId } = await auth();
    if (!userId) {
        throw new Error("User not authenticated");
    }

    const title = formData.get("title")?.toString();
    const description = formData.get("description")?.toString();

    if (!title || !description) {
        throw new Error("Title and description are required");
    }


  try {
    const tenantDb = await getTenantDbClientUtil();

    //   // TODO: Map Clerk userId to internal tenant user ID.  See section below.
    //   const internalUserId = await getInternalUserId(tenantDb, userId);

    const newCase = await tenantDb
      .insert(cases)
      .values({
        title,
        description,
        // userId: internalUserId, // Use the internal user ID
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
      revalidatePath("/");

    return newCase[0];
  } catch (error) {
    console.error("Error creating case:", error);
    return null; // Or throw an error
  }
}

// Example: Update a case
export async function updateCase(caseId: number, formData: FormData) {
  const { userId } = await auth();
  if (!userId) {
      throw new Error("User not authenticated");
  }

  const title = formData.get("title")?.toString();
  const description = formData.get("description")?.toString();

  if (!title || !description) {
      throw new Error("Title and description are required");
  }

  try {
    const tenantDb = await getTenantDbClientUtil();

    // TODO: Map Clerk userId to internal tenant user ID.
    // const internalUserId = await getInternalUserId(tenantDb, userId);

    const updatedCase = await tenantDb
      .update(cases)
      .set({
        title,
        description,
        // userId: internalUserId, // Use the internal user ID
        updatedAt: new Date(),
      })
      .where(eq(cases.id, caseId))
      .returning();
      revalidatePath("/");

    return updatedCase[0];
  } catch (error) {
    console.error("Error updating case:", error);
    return null; // Or throw an error
  }
}

// Example: Delete a case
export async function deleteCase(caseId: number) {
    const { userId } = await auth();
    if (!userId) {
        throw new Error("User not authenticated");
    }

    try {
        const tenantDb = await getTenantDbClientUtil();

        // TODO: Consider authorization checks here, e.g., is this user allowed to delete this case?

        const deletedCase = await tenantDb.delete(cases).where(eq(cases.id, caseId)).returning();
        revalidatePath("/");
        return deletedCase[0];

    } catch (error) {
        console.error("Error deleting case:", error);
        return null; // Or throw an error
    }
}
```

* **LitigationCasesKPI component**
```typescript:apps/app/app/(authenticated)/components/dashboard/litigation-cases-kpi.tsx
// apps/app/app/(authenticated)/components/dashboard/litigation-cases-kpi.tsx
import { BaseKPI } from '../shared/base-kpi';
import { getAllCases } from '@/app/actions/cases/cases-actions';

const LitigationCasesKPI = async () => {

  const cases = await getAllCases();
  const totalCases = cases ? cases.length : 0;

  return (
    <BaseKPI
      title="Litigation Cases"
      value={totalCases}
      isLoading={false}
      // diff={0} // You'd calculate this based on previous data, if available
    />
  );
};

export default LitigationCasesKPI;

```

**3. Mapping Clerk User ID to Internal User ID**

This is a *critical* part of your architecture.  You have a few options:

*   **Option 1:  User Mapping Table (Recommended):**
    *   Create a new table in your *main* application database (e.g., `user_mappings`).
    *   This table would have columns: `clerk_user_id` (VARCHAR, unique), `tenant_id` (INT, FK to `organizations`), `internal_user_id` (INT).
    *   When a user signs up or logs in for the first time on a tenant, create a record in this table, associating their Clerk ID with the corresponding internal ID in the tenant database.
    *   Create a server action to retrieve the internal user ID.

```typescript:apps/app/app/actions/users/user-actions.ts
// apps/app/app/actions/users/user-actions.ts
"use server"

import { db } from "@repo/database/src/main-app/db";
import { userMappings } from "@repo/database/src/main-app/schema"; // You'll need to define this schema
import { eq } from "drizzle-orm";
import { auth } from "@repo/auth/server";
import { getTenantIdentifier } from "../../utils/tenant-identifier";
import { organizations } from "@repo/database/src/main-app/schema/organizations-schema";
import { getTenantDbClientUtil } from "../../utils/tenant-db";
import { users } from "@repo/database/src/tenant-app/schema";

// Server action to get the internal user ID
export async function getInternalUserId(clerkUserId: string): Promise<number | null> {
    const tenantId = await getTenantIdentifier();

    const org = await db.select({id: organizations.id}).from(organizations).where(eq(organizations.slug, tenantId));

  try {
    const mapping = await db.query.userMappings.findFirst({
      where: (
        eq(userMappings.clerkUserId, clerkUserId),
        eq(userMappings.tenantId, org[0].id)
      )
    });
    return mapping?.internalUserId ?? null;
  } catch (error) {
    console.error("Error getting internal user ID:", error);
    return null;
  }
}

// Server Action to create user mapping
export async function createUserMapping(clerkUserId: string, internalUserId: number) {
    const tenantId = await getTenantIdentifier();
    const org = await db.select({id: organizations.id}).from(organizations).where(eq(organizations.slug, tenantId));
    if (!org || org.length === 0) {
        throw new Error("Organization not found for the current tenant.");
    }
    try {
        await db.insert(userMappings).values({
            clerkUserId,
            tenantId: org[0].id, // Use tenantId instead of orgId
            internalUserId,
        });
    }
    catch (error) {
        console.error("Error creating user mapping:", error);
        // Handle error appropriately (e.g., re-throw, return error message)
    }
}

// Example of how to use it in a Server Action
export async function createCaseWithInternalId(formData: FormData) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("User not authenticated");
  }

  const tenantDb = await getTenantDbClientUtil();
  let internalUserId = await getInternalUserId(userId);

  // If no mapping exists, create the user in tenant db and the mapping
  if (!internalUserId) {
    // 1. Create the user in the tenant database
    const newTenantUser = await tenantDb.insert(users).values({
      // ... user data from formData or Clerk ...
      externalId: userId, // Assuming you have an 'externalId' field to store Clerk ID
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning({ insertedId: users.id });

    if (!newTenantUser || newTenantUser.length === 0 || !newTenantUser[0].insertedId) {
      throw new Error("Failed to create user in tenant database.");
    }

    // 2. Create the mapping
    await createUserMapping(userId, newTenantUser[0].insertedId);
    internalUserId = newTenantUser[0].insertedId;
  }

  // Now you have the internalUserId, proceed with creating the case
  const title = formData.get("title")?.toString();
  const description = formData.get("description")?.toString();

  if (!title || !description) {
    throw new Error("Title and description are required");
  }

  const newCase = await tenantDb.insert(cases).values({
    title,
    description,
    userId: internalUserId, // Use the internal user ID
    createdAt: new Date(),
    updatedAt: new Date(),
  }).returning();

  return newCase[0];
}
```

*   **Option 2: Store Clerk ID in Tenant Database:**
    *   Add a `clerk_user_id` (VARCHAR, unique) column to your `users` table *within each tenant database*.
    *   When a user signs up/logs in, store their Clerk ID in this field.
    *   This simplifies the lookup (you query directly in the tenant database), but it means you're storing the Clerk ID in multiple places (each tenant DB).  This might be acceptable, depending on your needs.

    ```typescript
    // Inside a Server Action
    const { userId } = await auth(); // Get Clerk ID
    const tenantDb = await getTenantDbClientUtil();
    const user = await tenantDb.query.users.findFirst({
        where: eq(users.clerkUserId, userId), // Query using Clerk ID
    });
    const internalUserId = user?.id;
    ```

**4.  Additional Considerations**

*   **Error Handling:**  Implement robust error handling throughout your data fetching logic.  Catch errors, log them appropriately, and return user-friendly error messages or fallback UI states.
*   **Authorization:**  Beyond authentication (verifying *who* the user is), you need authorization (determining *what* the user is allowed to do).  Implement checks within your Server Actions to ensure users can only access data they're permitted to see.  This often involves checking roles or permissions associated with the `internalUserId`.
*   **Caching:**  You're already using Redis to cache connection URLs.  Consider caching other frequently accessed data, but be mindful of data freshness and invalidation.  Next.js's `cache` function and `revalidatePath`/`revalidateTag` are useful here.
*   **Data Validation:**  Validate data received from the client (e.g., in `formData`) *before* interacting with your database.  This helps prevent security vulnerabilities and data integrity issues.  Zod is a popular library for schema validation.
* **Database Schema:** You will need to create the schema for the user mappings.

```typescript:packages/database/src/main-app/schema/user-mappings-schema.ts
// packages/database/src/main-app/schema/user-mappings-schema.ts

import {
    integer,
    pgTable,
    primaryKey,
    varchar,
  } from "drizzle-orm/pg-core";
  import { organizations } from "./organizations-schema";

  export const userMappings = pgTable("user_mappings", {
    clerkUserId: varchar("clerk_user_id", { length: 255 }).notNull(),
    tenantId: integer("tenant_id").references(() => organizations.id).notNull(),
    internalUserId: integer("internal_user_id").notNull(),
  }, (table) => {
    return {
      pk: primaryKey({ columns: [table.clerkUserId, table.tenantId] }),
    };
  });
```
* **Tenant User Schema:**

```typescript:packages/database/src/tenant-app/schema/users-schema.ts
// packages/database/src/tenant-app/schema/users-schema.ts
import {
    timestamp,
    pgTable,
    text,
    primaryKey,
    integer,
    serial,
  } from 'drizzle-orm/pg-core';
  import type { AdapterAccount } from '@auth/core/adapters';

  export const users = pgTable('user', {
    id: serial('id').primaryKey(),
    name: text('name'),
    email: text('email').notNull(),
    emailVerified: timestamp('emailVerified', { mode: 'date' }),
    image: text('image'),
    externalId: text('external_id'), // to store the clerk id.
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  });
```
* **Tenant Case Schema:**

```typescript:packages/database/src/tenant-app/schema/cases-schema.ts
// packages/database/src/tenant-app/schema/cases-schema.ts
import {
    timestamp,
    pgTable,
    text,
    primaryKey,
    integer,
    serial,
  } from 'drizzle-orm/pg-core';
import { users } from './users-schema';

  export const cases = pgTable('cases', {
    id: serial('id').primaryKey(),
    title: text('title').notNull(),
    description: text('description').notNull(),
    userId: integer('user_id').references(() => users.id), //references internal user id.
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  });
```

**Summary of Changes**
1.  **New Files:**
    *   `apps/app/app/utils/tenant-identifier.ts`: Server action to reliably get the tenant identifier.
    *   `apps/app/app/actions/cases/cases-actions.ts`: Example Server Actions for CRUD operations on cases.
    *   `apps/app/app/actions/users/user-actions.ts`: Server actions to manage user mappings and retrieve internal user IDs.
    *   `packages/database/src/main-app/schema/user-mappings-schema.ts`: Defines the schema for the user mapping table.
    *   `packages/database/src/tenant-app/schema/users-schema.ts`: Defines the schema for the users table in tenant databases.
    *   `packages/database/src/tenant-app/schema/cases-schema.ts`: Defines the schema for the cases table in tenant databases.

2.  **Modified Files:**
    *   `apps/app/app/utils/tenant-db.ts`: Updated `getTenantDbClientUtil` to use the new `getTenantIdentifier` server action.
    *   `apps/app/app/(authenticated)/page.tsx`: Added comments showing how to use `getTenantDbClientUtil` in a Server Component (commented out to avoid immediate errors).
    *   `apps/app/app/(authenticated)/components/dashboard/litigation-cases-kpi.tsx`: Modified to use the `getAllCases` server action.

3.  **Key Concepts:**
    *   **Server Actions:** Used for all database interactions initiated by the user.
    *   **Server Components:** Used for initial data loading.
    *   **`getTenantDbClientUtil`:** Centralized utility for getting the tenant database client.
    *   **`getTenantIdentifier`:** Reliable way to get the tenant ID in Server Actions.
    *   **User Mapping:**  A mechanism (either a separate table or a field in the tenant's user table) to link Clerk user IDs to internal user IDs.
    *   **Clear Separation:**  Distinct layers for authentication (Clerk), tenant identification, database connection, and data querying.

This comprehensive architecture provides a solid foundation for your multi-tenant application. Remember to adapt the code examples to your specific schema and data requirements. The user mapping strategy is particularly important, so choose the option that best fits your needs and security considerations.


---

_**User**_

this isnt working first explain me the architecture of what we need to do to be able to retrieve data from the database specific for each user, just explain dont write code. 

---

_**Assistant**_

Okay, let's break down the architecture for retrieving user-specific data in your multi-tenant database setup, without diving into code just yet. We'll focus on the flow and the responsibilities of each part.

**Core Goal:**  Given a logged-in user (identified by Clerk), we want to fetch data *only* from their specific tenant database, and *only* the data that belongs to them within that tenant database.

**Architectural Steps:**

1.  **User Authentication (Clerk):**
    *   The user logs in via Clerk. This gives you a unique `userId` (Clerk's user ID). This is your starting point.  You *know* who the user is, but you don't yet know *where* their data resides or their internal ID within that location.

2.  **Tenant Identification (Subdomain):**
    *   The user's request hits your Next.js application.
    *   You extract the subdomain from the request's `Host` header (e.g., `tenant1` from `tenant1.example.com`). This subdomain is your *tenant identifier*.  It tells you *which* tenant database to connect to.

3.  **Database Connection URL Lookup:**
    *   You use the tenant identifier (subdomain) to look up the corresponding database connection URL.
    *   You have a dedicated function (`getTenantConnectionUrl`) for this, which smartly uses Redis caching to avoid hitting your main database on every request.  This function queries your *main* application database, which stores the mapping between subdomains and database URLs.

4.  **Tenant Database Connection:**
    *   With the connection URL in hand, you establish a connection to the correct tenant database.  You use a utility function (`getTenantDbClientUtil`) to create a Drizzle client instance for that specific database.  This client is your gateway to querying the tenant's data.

5.  **Internal User ID Resolution:**
    *   This is the crucial step.  You have the Clerk `userId`, but the tenant database likely uses its own internal `userId` (an auto-incrementing integer, for example).  You need to *map* the Clerk ID to the internal ID.
    *   **Mapping Strategy:** You have two main options, as discussed before:
        *   **Option 1 (Recommended): User Mapping Table:** A dedicated table (`user_mappings`) in your *main* database stores the mapping: `[clerk_user_id, tenant_id, internal_user_id]`.  You query this table to find the internal ID.
        *   **Option 2: Store Clerk ID in Tenant DB:**  Each tenant's `users` table has a `clerk_user_id` column.  You query the tenant's `users` table directly using the Clerk ID.

6.  **Data Query (Tenant Database):**
    *   Finally, you have all the pieces:
        *   You're connected to the correct tenant database (via the Drizzle client).
        *   You have the internal `userId` for the logged-in user.
    *   You can now construct your Drizzle queries, filtering data based on the `internal_user_id`.  For example:
        ```sql
        SELECT * FROM cases WHERE user_id = <internal_user_id>;
        ```

7.  **Return Data:** The queried data is returned to your Server Component or Server Action, and ultimately to the client.

**In Simple Terms:**

Imagine a hotel (your application).

*   **Clerk:** The hotel's front desk. They check your ID (authenticate you) and give you a room keycard (Clerk `userId`).
*   **Subdomain:** The building number (e.g., Building 1, Building 2).  Each building is a separate tenant.
*   **Main Database:** The hotel's master directory. It lists which room keycards are valid for which buildings, and what the actual room number is inside that building.
*   **Tenant Database:**  The rooms within a specific building.
*   **Connection URL:**  The instructions on how to get to a specific building.
*   **Internal User ID:** Your actual room number *within* the building.
*   **User Mapping Table:** A list at the front desk that says, "Keycard X for Building Y corresponds to Room Z."

The process is:

1.  You show your ID at the front desk (Clerk).
2.  The front desk tells you which building you're in (subdomain).
3.  They look up the directions to your building (connection URL).
4.  They check their list to find your room number in that building (internal user ID).
5.  You go to your room and get your stuff (query data).

This architecture ensures:

*   **Security:** Users can only access data within their tenant database.
*   **Isolation:** Tenant data is completely separated.
*   **Scalability:** You can add more tenants (buildings) without affecting existing ones.
*   **Performance:** Redis caching minimizes lookups to the main database.
*   **Clean Code:**  Well-defined functions handle each step, making your code maintainable and testable.

The next step would be to implement the user mapping (either Option 1 or Option 2) and update your Server Actions to use this mapping to retrieve the internal user ID before querying the tenant database.


---

_**User**_

now how do we route the user to the specific subdomain, my guess is that it is done in the layout @layout.tsx 

---

_**Assistant**_

You are correct! The `apps/app/app/(authenticated)/layout.tsx` file is indeed where the core tenant routing logic resides. Let's break down how it works step-by-step, and I'll highlight the key parts:

**Explanation of Tenant Routing in `AppLayout`**

The `AppLayout` component is responsible for handling the routing based on whether the user is on the main domain or a tenant subdomain. Here's a detailed walkthrough:

1.  **Authentication Check:**

    ```typescript
    const { userId, redirectToSignIn } = await auth();

    if (!userId) {
      return redirectToSignIn();
    }

    const user = await currentUser();
    if (!user) {
      return redirectToSignIn();
    }
    ```

    *   First, it ensures the user is authenticated using Clerk's `auth()` function. If not, they're redirected to the sign-in page.
    *   It also fetches the complete user object using `currentUser()`. This is important for accessing user details later.

2.  **Domain Determination:**

    ```typescript
    const headersList = await headers();
    const hostname = headersList.get('host') || '';
    const appUrlWithoutProtocol = env.NEXT_PUBLIC_APP_URL?.replace(
      /^https?:\/\//,
      ''
    );
    const isMainDomain =
      hostname === appUrlWithoutProtocol || hostname === 'localhost:3000';
    ```

    *   This section is crucial. It determines whether the user is accessing the application through the main domain (e.g., `lavel.ai` or `localhost:3000`) or a tenant subdomain (e.g., `tenant1.lavel.ai`).
    *   `headersList.get('host')`: Retrieves the `Host` header from the incoming request. This header contains the domain name.
    *   `env.NEXT_PUBLIC_APP_URL`:  This environment variable should hold your application's main URL (without the protocol).  For example, it might be `lavel.ai` in production and empty or `localhost:3000` in development.
    *   `isMainDomain`:  This boolean variable is `true` if the user is on the main domain and `false` if they're on a tenant subdomain.

3.  **Main Domain Logic (Redirection):**

    ```typescript
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

    *   **This is the core routing logic.**  It only executes if `isMainDomain` is `true`.
    *   `fetchUserOrganization(userId)`: This function (which you'll need to define in `@repo/database/src/main-app/queries/organization-queries.ts`) queries your *main* application database to find the organization (tenant) associated with the logged-in user (using the Clerk `userId`).  It should return an object containing at least the organization's `slug` (the subdomain).
    *   **`if (orgInfo?.slug)`:**  If an organization *is* found (meaning the user belongs to a tenant):
        *   `tenantUrl`:  It constructs the full URL for the tenant's subdomain.  For example, if `orgInfo.slug` is `tenant1` and `env.NEXT_PUBLIC_APP_URL` is `lavel.ai`, then `tenantUrl` becomes `https://tenant1.lavel.ai`.  It correctly handles both `http` and `https`.
        *   `redirect(tenantUrl)`:  **This is the key redirection!** It uses Next.js's `redirect` function (from `next/navigation`) to send the user to the tenant's subdomain.
    *   **`else` (No Organization Found):** If no organization is found for the user (they haven't been assigned to a tenant yet), they're redirected to an onboarding page (`/onboarding`). This is where you'd likely allow them to create or join a tenant.

4.  **Tenant Subdomain (No Redirection):**

    ```typescript
      <NotificationsProvider userId={user.id}>
        {/* ... rest of your layout ... */}
      </NotificationsProvider>
    ```
    *   If `isMainDomain` is `false` (the user is *already* on a tenant subdomain), the code *doesn't* redirect.  It simply renders the rest of the layout, including the `NotificationsProvider`, `SidebarProvider`, and your application content (`{children}`).  This is because the user is already where they need to be.

**In Summary:**

The `AppLayout` acts as a traffic controller:

*   **Main Domain:**  Checks if the user belongs to a tenant. If so, redirects them to the tenant's subdomain.  If not, sends them to onboarding.
*   **Tenant Subdomain:**  Does nothing special; just renders the application.

**Key Files and Functions:**

*   **`apps/app/app/(authenticated)/layout.tsx`:**  The layout component containing the routing logic.
*   **`@repo/auth/server` (`auth`, `currentUser`):**  Clerk functions for authentication.
*   **`@repo/database/src/main-app/queries/organization-queries.ts` (`fetchUserOrganization`):**  A function you need to create to query your main database and retrieve the organization/tenant information based on the Clerk user ID.
*   **`next/headers` (`headers`):**  Next.js function to access request headers.
*   **`next/navigation` (`redirect`):**  Next.js function for performing redirects.
*   **`env.NEXT_PUBLIC_APP_URL`:** Environment variable holding your main application URL.

**Next Steps (Implementation):**

1.  **Create `fetchUserOrganization`:**  You need to implement the `fetchUserOrganization` function in `@repo/database/src/main-app/queries/organization-queries.ts`. This is the most important missing piece. It should query your `organizations` table (or a similar table) in your *main* database.
2. **Define the organization schema:**

```typescript:packages/database/src/main-app/schema/organizations-schema.ts
import {
    timestamp,
    pgTable,
    text,
    primaryKey,
    integer,
    serial,
    varchar,
  } from 'drizzle-orm/pg-core';

export const organizations = pgTable("organizations", {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull().unique(), // Important for subdomain routing
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
```

3.  **`fetchUserOrganization` Implementation:**

```typescript:packages/database/src/main-app/queries/organization-queries.ts
// packages/database/src/main-app/queries/organization-queries.ts
"use server";
import { db } from "../../db"; // Your main database connection
import { organizations } from "../schema/organizations-schema";
import { userMappings } from "../schema/user-mappings-schema"; // Import userMappings
import { eq, and } from "drizzle-orm";

export async function fetchUserOrganization(userId: string) {
  try {
    // First, find the user mapping using the Clerk userId
    const mapping = await db.query.userMappings.findFirst({
        where: eq(userMappings.clerkUserId, userId),
    });

    if (!mapping) {
      return null; // Or handle the case where no mapping exists
    }
    // Then, retrieve the organization using the internalUserId from the mapping
    const organization = await db.query.organizations.findFirst({
      where: eq(organizations.id, mapping.tenantId), // Use tenantId from mapping
      columns: {
        id: true,
        name: true,
        slug: true, // Make sure to select the slug!
      },
    });

    return organization ?? null;
  } catch (error) {
    console.error("Error fetching user organization:", error);
    return null; // Handle errors appropriately
  }
}
```

4.  **Ensure `env.NEXT_PUBLIC_APP_URL` is set correctly:**  This variable should be set in your environment (e.g., `.env.local`, Vercel environment variables).

By implementing these steps, your application will correctly route users to their appropriate tenant subdomains based on their Clerk authentication and your main database records.


---

_**User**_

Now i have some doubts: 

- lets supose in our dashboard page we have more than 5 components that retrieve data from the database, for each of them we retrieve the connection details? so we would query our main app for each component we have to retrieve data for? 
- how do we pass the information to the components ? 
- where do we call the connection in the server action, the query or where? 

---

_**Assistant**_

Okay, let's address your excellent questions about data fetching in multiple components, passing data, and where to handle the database connection.

**1. Multiple Components and Connection Details**

> lets supose in our dashboard page we have more than 5 components that retrieve data from the database, for each of them we retrieve the connection details? so we would query our main app for each component we have to retrieve data for?

No, you absolutely should *not* retrieve the connection details (and establish a new connection) for *each* component. That would be extremely inefficient and put unnecessary load on your main database. Here's the correct approach, leveraging Next.js's caching and the architecture we've built:

*   **Centralized Connection, Cached Result:** The `getTenantDbClientUtil()` function (in `apps/app/app/utils/tenant-db.ts`) is the key.  It does the following:
    *   Gets the tenant identifier (once per request).
    *   Calls `getTenantConnectionUrl` (in `packages/database/src/tenant-app/queries/tenant-lookup.ts`), which retrieves the connection URL.  *This function uses Redis caching.*  The first time it's called for a given tenant, it hits the main database.  Subsequent calls within the cache TTL (currently 1 day) will get the URL directly from Redis, *avoiding* the main database query.
    *   Calls `createTenantConnection` which creates a Drizzle client *once* and reuses it if called again with the same URL.

*   **Next.js Request Memoization:** Next.js automatically memoizes (caches) the result of `fetch` calls and Server Actions *within a single request*. This is crucial.  Even if multiple components call the *same* Server Action, that action (and any database queries within it) will only execute *once* per request. The result is cached and reused.

*   **How it works in practice:**
    1.  Your dashboard page loads.
    2.  Multiple Server Components on that page need data.
    3.  Each component calls a Server Action (e.g., `getAllCases`, `getOpenCases`, `getClosedCases`).
    4.  *Each* of those Server Actions calls `getTenantDbClientUtil()`.
    5.  `getTenantDbClientUtil()` gets the tenant ID, gets the connection URL (likely from Redis), and creates/reuses the Drizzle client.  This happens *only once* per request, even though multiple Server Actions call it.
    6.  Each Server Action uses the *same* Drizzle client to perform its specific query.
    7.  Next.js caches the result of each Server Action.
    8.  The components receive their data.

**In short: You get the connection details *once per request*, not once per component. Caching (both Redis and Next.js's request memoization) makes this efficient.**

**2. Passing Information to Components**

> how do we pass the information to the components ?

There are two primary ways, depending on whether you're using Server Components or Client Components:

*   **Server Components (Recommended):**
    *   Server Components can directly call Server Actions.
    *   The data returned by the Server Action is passed as *props* to the Server Component.
    *   This is the most efficient approach, as the data fetching happens entirely on the server.

    ```typescript
    // apps/app/app/(authenticated)/dashboard/page.tsx (Server Component)
    import { getAllCases } from '@/app/actions/cases/cases-actions';
    import { CasesList } from './components/cases-list'; // Could be client or server

    export default async function DashboardPage() {
      const cases = await getAllCases(); // Call Server Action directly

      return (
        <div>
          <h1>Dashboard</h1>
          <CasesList cases={cases} /> {/* Pass data as props */}
        </div>
      );
    }
    ```

*   **Client Components:**
    *   Client Components *cannot* directly call Server Actions.
    *   You have two main options:
        1.  **Fetch data in a parent Server Component and pass it down as props:** This is generally preferred for initial data loading. The Server Component fetches the data (as shown above) and passes it to the Client Component as props.
        2.  **Use a state management library (e.g., Zustand, Redux, or React Context) and call the server action from a hook:** This is more suitable for data that changes based on user interaction *within* the Client Component. The Client Component triggers the Server Action, and the state management library handles updating the UI. *Avoid calling Server Actions directly from `useEffect`.*

    ```typescript
    // apps/app/app/(authenticated)/dashboard/components/cases-list.tsx (Client Component)
    "use client";

    import { useState } from 'react';
    import { createCase } from '@/app/actions/cases/cases-actions';

    type Props = {
      initialCases: Case[]; // Get initial data from parent Server Component
    }

    export function CasesList({ initialCases }: Props) {
      const [cases, setCases] = useState(initialCases);

      const handleCreateCase = async (formData: FormData) => {
        const newCase = await createCase(formData); // Call Server Action
        if (newCase) {
          setCases([...cases, newCase]); // Update local state
        }
      };

      return (
        <div>
          {/* ... display cases ... */}
          <form action={handleCreateCase}>
            {/* ... form inputs ... */}
            <button type="submit">Create Case</button>
          </form>
        </div>
      );
    }
    ```

**3. Where to Call the Connection**

> where do we call the connection in the server action, the query or where?

*   **Inside the Server Action:** You call `getTenantDbClientUtil()` *inside* each Server Action that needs to interact with the tenant database. This ensures you're always working with the correct database connection for the current request.

*   **Do *not* call it inside your query functions (e.g., `getLitigationCasesCount` in `@repo/database/src/tenant-app/queries/cases-queries.ts`).**  Keep your query functions focused solely on constructing and executing the Drizzle query.  Pass the `tenantDb` (the Drizzle client) *into* the query function as an argument.

    ```typescript
    // apps/app/app/actions/cases/cases-actions.ts (Server Action)
    import { getTenantDbClientUtil } from '@/app/utils/tenant-db';
    import { getLitigationCasesCount } from '@repo/database/src/tenant-app/queries/cases-queries';

    export async function getLitigationCasesKPI() {
      const tenantDb = await getTenantDbClientUtil(); // Get the connection *here*
      const count = await getLitigationCasesCount(tenantDb); // Pass it to the query function
      return { count };
    }
    ```

    ```typescript
    // packages/database/src/tenant-app/queries/cases-queries.ts (Query Function)
    import { cases } from '../schema';
    import type { DrizzleClient } from '../tenant-connection-db'; // Type only import
    import { eq, and, count } from 'drizzle-orm';

    export async function getLitigationCasesCount(tenantDb: DrizzleClient): Promise<number> {
      // Use the tenantDb passed in as an argument
      const result = await tenantDb.select({ value: count() }).from(cases).where(eq(cases.type, 'litigation'));
      return result[0]?.value ?? 0;
    }
    ```

**Key Takeaways:**

*   **Centralize Connection Logic:** Use `getTenantDbClientUtil()` to handle getting the tenant database connection.
*   **Cache Aggressively:** Leverage Redis caching (in `getTenantConnectionUrl`) and Next.js's request memoization.
*   **Server Actions are the Gateway:**  All database interactions should happen within Server Actions.
*   **Pass `tenantDb` to Query Functions:** Keep query functions focused on Drizzle queries; pass the database client as an argument.
*   **Server Components for Initial Data:** Fetch initial data in Server Components and pass it down as props.
*   **Client Components + Server Actions + State Management:** For client-side interactions that update data, use Client Components, Server Actions, and a state management solution.

This approach ensures efficiency, maintainability, and a good separation of concerns in your application.


---

_**User**_

ok lets make an example lets do the @litigation-cases-kpi.tsx we want to set this component in the @page.tsx 

what do we need to do? 

---

_**Assistant**_

Okay, let's walk through integrating the `LitigationCasesKPI` component into your `page.tsx`. Here's a breakdown of the steps and the code changes:

**1. `LitigationCasesKPI` Component (Already Done - Review)**

You've already created the `LitigationCasesKPI` component (`apps/app/app/(authenticated)/components/dashboard/litigation-cases-kpi.tsx`). It's a Server Component that fetches the total number of cases and displays it using the `BaseKPI` component.  It correctly uses the `getAllCases` Server Action.  Just to reiterate, here's the code:

```typescript:apps/app/app/(authenticated)/components/dashboard/litigation-cases-kpi.tsx
// apps/app/app/(authenticated)/components/dashboard/litigation-cases-kpi.tsx
import { Gavel } from 'lucide-react';
import { BaseKPI } from '../shared/base-kpi';
import { getAllCases } from '@/app/actions/cases/cases-actions';

const LitigationCasesKPI = async () => {

  const cases = await getAllCases();
  const totalCases = cases ? cases.length : 0;

  return (
    <BaseKPI
      title="Litigation Cases"
      icon={Gavel}
      value={totalCases}
      isLoading={false}
      // diff={0} // You'd calculate this based on previous data, if available
    />
  );
};

export default LitigationCasesKPI;
```

This component is already set up correctly to fetch data and render. The key is that it's a *Server Component* and uses a *Server Action* (`getAllCases`) to get the data.

**2. Integrate into `page.tsx`**

Now, let's integrate this component into your main dashboard page (`apps/app/app/(authenticated)/page.tsx`).

```typescript:apps/app/app/(authenticated)/page.tsx
import { env } from '@/env';
import { auth } from '@repo/auth/server';
import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { notFound } from 'next/navigation';
import { AvatarStack } from './components/avatar-stack';
import { Cursors } from './components/cursors';
import { Header } from './components/header';
import LitigationCasesKPI from './components/dashboard/litigation-cases-kpi'; // Import the component

const title = 'Acme Inc';
const description = 'My application.';

const CollaborationProvider = dynamic(() =>
  import('./components/collaboration-provider').then(
    (mod) => mod.CollaborationProvider
  )
);

export const metadata: Metadata = {
  title,
  description,
};

const App = async () => {
  const { orgId, userId } = await auth(); // Get Clerk user ID

  if (!orgId) {
    notFound();
  }

  return (
    <>
      <Header pages={['Building Your Application']} page="Data Fetching">
        {env.LIVEBLOCKS_SECRET && (
          <CollaborationProvider orgId={orgId}>
            <AvatarStack />
            <Cursors />
          </CollaborationProvider>
        )}
      </Header>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="grid auto-rows-min gap-4 md:grid-cols-3">
          <LitigationCasesKPI /> {/* Render the component here */}
        </div>
        <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" />
      </div>
    </>
  );
};

export default App;
```

**Explanation of Changes:**

*   **Import:** We import the `LitigationCasesKPI` component:
    ```typescript
    import LitigationCasesKPI from './components/dashboard/litigation-cases-kpi';
    ```
*   **Render:** We render the component within the `grid` div:
    ```typescript
    <LitigationCasesKPI />
    ```

**How it Works (Data Flow):**

1.  **Page Load:** When the user navigates to the dashboard page (`/`), the `App` component (in `page.tsx`) is rendered.
2.  **Authentication:** `auth()` is called to get the user's authentication status.
3.  **`LitigationCasesKPI` Rendered:** The `App` component renders the `LitigationCasesKPI` component.
4.  **`getAllCases` Called:** Because `LitigationCasesKPI` is a Server Component, its `async` function is executed *on the server*.  This function calls the `getAllCases` Server Action.
5.  **Database Query:** `getAllCases` (in `cases-actions.ts`) calls `getTenantDbClientUtil()` to get the correct tenant database connection, then queries the database to get all cases.
6.  **Data Returned:** The `getAllCases` Server Action returns the array of cases.
7.  **`BaseKPI` Rendered:** `LitigationCasesKPI` receives the data, calculates `totalCases`, and passes it as props to the `BaseKPI` component (which is likely a Client Component).
8.  **Display:** `BaseKPI` renders the KPI information.

**Key Points:**

*   **Server Component Rendering:** The entire data fetching process for `LitigationCasesKPI` happens on the server. This is efficient and avoids sending database queries from the client.
*   **Automatic Data Passing:**  Because `LitigationCasesKPI` is a child of the `App` component (both Server Components), the data fetched by `LitigationCasesKPI` is automatically available to it. You don't need to explicitly pass props *between* Server Components in the same tree.
*   **No Client-Side Fetching:** The client doesn't need to make any explicit requests to fetch the case data.

This setup is a clean and efficient way to display your KPI on the dashboard.  It leverages Next.js's Server Components and Server Actions to handle data fetching in an optimized manner. You can add other KPI components in the same way, and Next.js will handle the caching and data fetching efficiently.


---

_**User**_

ok we get this error  Server  Only plain objects can be passed to Client Components from Server Components. Classes or other objects with methods are not supported.
  <... title=... icon={{$$typeof: ..., render: ...}} value=... isLoading=...>
                      ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
overrideMethod @ hook.js:608Understand this errorAI
hook.js:608 Error: Functions cannot be passed directly to Client Components unless you explicitly expose it by marking it with "use server". Or maybe you meant to call this function rather than return it.
  {$$typeof: ..., render: function Gavel}
                          ^^^^^^^^^^^^^^
    at resolveErrorDev (react-server-dom-turbopack-client.browser.development.js:1785:63)
    at processFullStringRow (react-server-dom-turbopack-client.browser.development.js:2064:17)
    at processFullBinaryRow (react-server-dom-turbopack-client.browser.development.js:2052:7)
    at progress (react-server-dom-turbopack-client.browser.development.js:2255:17)

The above error occurred in the <BaseKPI> component. It was handled by the <ReactDevOverlay> error boundary. Error Component Stack

---

_**Assistant**_

This error message tells you that you're trying to pass something that isn't a "plain object" from a Server Component to a Client Component. Specifically, it's complaining about the `icon` prop you're passing to `BaseKPI`:

```
<BaseKPI
  title="Litigation Cases"
  icon={Gavel}  <-- This is the problem
  value={totalCases}
  isLoading={false}
/>
```

The issue is that `Gavel` (imported from `lucide-react`) is a *React component* (a function component, to be precise), not a plain JavaScript object.  Client Components can only receive serializable data as props – plain objects, strings, numbers, booleans, arrays, and `null`/`undefined`.  They cannot receive functions or class instances.

**Why is this happening?**

You're using `BaseKPI`, and it's likely a Client Component.  `LitigationCasesKPI` is a Server Component, and it's trying to pass the `Gavel` component (a function) as the `icon` prop. This is the direct cause of the error.

**Solutions**

There are several ways to fix this, depending on how you want to structure your components and how flexible you need the `icon` prop to be:

**1. Pass the Icon as a String (Simplest):**

   If you only need a fixed set of icons, the easiest solution is to pass the *name* of the icon as a string and have `BaseKPI` handle rendering the correct icon based on that name.

   ```typescript:apps/app/app/(authenticated)/components/dashboard/litigation-cases-kpi.tsx
   // apps/app/app/(authenticated)/components/dashboard/litigation-cases-kpi.tsx
   // No need to import Gavel here anymore
   import { BaseKPI } from '../shared/base-kpi';
   import { getAllCases } from '@/app/actions/cases/cases-actions';

   const LitigationCasesKPI = async () => {

     const cases = await getAllCases();
     const totalCases = cases ? cases.length : 0;

     return (
       <BaseKPI
         title="Litigation Cases"
         icon="Gavel" // Pass the icon name as a string
         value={totalCases}
         isLoading={false}
       />
     );
   };

   export default LitigationCasesKPI;
   ```

   ```typescript:apps/app/app/(authenticated)/components/shared/base-kpi.tsx
   // apps/app/app/(authenticated)/components/shared/base-kpi.tsx
   "use client";

   import { Card, CardContent, CardHeader, CardTitle } from "@repo/design-system/components/ui/card";
   import { Skeleton } from "@repo/design-system/components/ui/skeleton";
   import { cn } from "@repo/design-system/utils";
    import { Gavel, /* other icons */ } from 'lucide-react'; // Import them all here

   type Props = {
     title: string;
     value: number | string;
     isLoading: boolean;
     icon?: string; // Icon is now a string
     diff?: number;
     description?: string;
     error?: string | null;
   };

   export const BaseKPI = ({
     title,
     value,
     isLoading,
     icon,
     diff,
     description,
     error,
   }: Props) => {

     const renderIcon = () => {
       if (!icon) return null;

       switch (icon) {
         case "Gavel":
           return <Gavel />;
         // Add other cases for other icons
         default:
           return null; // Or a default icon
       }
     };

     return (
       <Card className="flex flex-col">
         <CardHeader className="flex flex-row items-center justify-between pb-2">
           <CardTitle className="text-sm font-medium text-muted-foreground">
             {title}
           </CardTitle>
           {renderIcon()} {/* Render the icon here */}
         </CardHeader>
         <CardContent>
           {/* ... rest of your component ... */}
         </CardContent>
       </Card>
     );
   };

   ```

   This is the simplest and often the best approach if you have a limited set of icons.

**2. Pass Icon Props (More Flexible):**

   If you need more flexibility (e.g., to customize the icon's size, color, etc.), you can pass *props* for the icon instead of the icon component itself.

   ```typescript:apps/app/app/(authenticated)/components/dashboard/litigation-cases-kpi.tsx
   // apps/app/app/(authenticated)/components/dashboard/litigation-cases-kpi.tsx
   import { BaseKPI } from '../shared/base-kpi';
   import { getAllCases } from '@/app/actions/cases/cases-actions';

   const LitigationCasesKPI = async () => {

     const cases = await getAllCases();
     const totalCases = cases ? cases.length : 0;

     return (
       <BaseKPI
         title="Litigation Cases"
         icon={{ name: "Gavel", size: 20, color: "blue" }} // Pass icon props
         value={totalCases}
         isLoading={false}
       />
     );
   };

   export default LitigationCasesKPI;
   ```

   ```typescript:apps/app/app/(authenticated)/components/shared/base-kpi.tsx
    "use client";

   import { Card, CardContent, CardHeader, CardTitle } from "@repo/design-system/components/ui/card";
   import { Skeleton } from "@repo/design-system/components/ui/skeleton";
   import { cn } from "@repo/design-system/utils";
    import { Gavel, /* other icons */ } from 'lucide-react'; // Import them all here

   type IconProps = {
     name: string;
     size?: number;
     color?: string;
     // Add other props as needed
   };

   type Props = {
     title: string;
     value: number | string;
     isLoading: boolean;
     icon?: IconProps; // Icon is now an object with props
     diff?: number;
     description?: string;
     error?: string | null;
   };

   export const BaseKPI = ({
     title,
     value,
     isLoading,
     icon,
     diff,
     description,
     error,
   }: Props) => {

     const renderIcon = () => {
       if (!icon) return null;

       switch (icon.name) {
         case "Gavel":
           return <Gavel size={icon.size} color={icon.color} />; // Use props
         // Add other cases for other icons
         default:
           return null; // Or a default icon
       }
     };

     return (
       <Card className="flex flex-col">
         <CardHeader className="flex flex-row items-center justify-between pb-2">
           <CardTitle className="text-sm font-medium text-muted-foreground">
             {title}
           </CardTitle>
           {renderIcon()}
         </CardHeader>
         <CardContent>
           {/* ... rest of your component ... */}
         </CardContent>
       </Card>
     );
   };
   ```

   This approach gives you more control over the icon's appearance.

**3. Render the Icon in the Server Component (Least Flexible, but avoids the error):**
    If `BaseKPI` *must* be a Client Component, and you *only* need to use `Gavel` and don't need to customize it, you could render the icon *within* the Server Component and pass the rendered JSX as a prop. This is generally *not* recommended, as it reduces the flexibility of `BaseKPI`.

   ```typescript:apps/app/app/(authenticated)/components/dashboard/litigation-cases-kpi.tsx
    import { Gavel } from 'lucide-react'; // Import Gavel here
    import { BaseKPI } from '../shared/base-kpi';
    import { getAllCases } from '@/app/actions/cases/cases-actions';

    const LitigationCasesKPI = async () => {

      const cases = await getAllCases();
      const totalCases = cases ? cases.length : 0;

      return (
        <BaseKPI
          title="Litigation Cases"
          icon={<Gavel />} {/* Render the icon here */}
          value={totalCases}
          isLoading={false}
        />
      );
    };

    export default LitigationCasesKPI;
   ```
   ```typescript:apps/app/app/(authenticated)/components/shared/base-kpi.tsx
   // No changes needed in BaseKPI, as it now receives JSX
   ```

   This works because the JSX (the result of rendering `<Gavel />`) *is* serializable. However, it makes `BaseKPI` less reusable, as it can't easily switch between different icons.

**4. Make `BaseKPI` a Server Component (Best if possible):**

   If `BaseKPI` *doesn't* need to use client-side hooks (like `useState`, `useEffect`, or browser APIs), the *best* solution is to make it a Server Component.  This avoids the serialization issue entirely. Remove the `"use client"` directive from `BaseKPI`.

   ```typescript:apps/app/app/(authenticated)/components/shared/base-kpi.tsx
   // apps/app/app/(authenticated)/components/shared/base-kpi.tsx
   // REMOVE "use client";

   import { Card, CardContent, CardHeader, CardTitle } from "@repo/design-system/components/ui/card";
   import { Skeleton } from "@repo/design-system/components/ui/skeleton";
   import { cn } from "@repo/design-system/utils";
   import { type LucideIcon } from "lucide-react"

   type Props = {
     title: string;
     value: number | string;
     isLoading: boolean;
     icon?: LucideIcon; // Icon is now a component type
     diff?: number;
     description?: string;
     error?: string | null;
   };

   export const BaseKPI = ({
     title,
     value,
     isLoading,
     icon: Icon, // Rename to avoid conflict
     diff,
     description,
     error,
   }: Props) => {

     return (
       <Card className="flex flex-col">
         <CardHeader className="flex flex-row items-center justify-between pb-2">
           <CardTitle className="text-sm font-medium text-muted-foreground">
             {title}
           </CardTitle>
           {Icon && <Icon />} {/* Render the icon directly */}
         </CardHeader>
         <CardContent>
           {isLoading ? (
             <Skeleton className="h-9 w-full" />
           ) : error ? (
             <div className="text-destructive text-sm">{error}</div>
           ) : (
             <div className="text-2xl font-bold">{value}</div>
           )}
           {diff && (
             <div
               className={cn("text-sm", {
                 "text-destructive": diff < 0,
                 "text-emerald-500": diff > 0,
               })}
             >
               {diff > 0 ? "+" : ""}
               {diff}%
             </div>
           )}
           {description && (
             <div className="text-xs text-muted-foreground">{description}</div>
           )}
         </CardContent>
       </Card>
     );
   };
   ```

   This is the cleanest solution *if* `BaseKPI` can be a Server Component.

**Recommendation:**

*   **If `BaseKPI` can be a Server Component, make it one (Option 4).** This is the best solution in terms of performance and simplicity.
*   **If `BaseKPI` must be a Client Component, use Option 1 (pass the icon name as a string) or Option 2 (pass icon props).** Option 1 is simpler, while Option 2 offers more flexibility. Avoid Option 3.

Choose the solution that best fits the requirements of your `BaseKPI` component and the overall structure of your application. Remember to update the type definitions for the `icon` prop accordingly. I've included the complete code for each option above, so you can choose the one that works best and copy it directly. Remember to install `lucide-react` if you haven't.


---

_**User**_

ok i think i finally get it, how would u design the retrieving the information to display it in the page, since you are a better architect you can go ahead and make the changes necessary to make this work as of now our code is broken 

hook.js:608 Error: Element type is invalid: expected a string (for built-in components) or a class/function (for composite components) but got: <svg />. Did you accidentally export a JSX literal instead of a component?

take into account that we still have to build the whole app, so the approach u take will be useful for future retrival of data and display in components 

---

_**Assistant**_

Okay, I understand. You're getting the "Element type is invalid" error, and you want a robust, scalable architecture for fetching and displaying data. I'll address the immediate error and lay out a comprehensive plan for data handling. The error is happening because `BaseKPI` is still a client component, and we are trying to render the icon inside the server component.

Here's the combined approach, addressing the error and setting up a solid foundation:

**1. Make `BaseKPI` a Server Component (if possible)**

This is the *most important* architectural change and the best solution if it's feasible. As we discussed before, if `BaseKPI` doesn't *need* client-side interactivity (state, effects, browser APIs), it should be a Server Component. This eliminates the serialization issues and is generally more efficient.

```typescript:apps/app/app/(authenticated)/components/shared/base-kpi.tsx
// apps/app/app/(authenticated)/components/shared/base-kpi.tsx
// REMOVE "use client";  <-- This is the key change

import { Card, CardContent, CardHeader, CardTitle } from "@repo/design-system/components/ui/card";
import { Skeleton } from "@repo/design-system/components/ui/skeleton";
import { cn } from "@repo/design-system/utils/index"; // Fixed import
import { type LucideIcon } from "lucide-react";

type Props = {
  title: string;
  value: number | string;
  isLoading: boolean;
  icon?: LucideIcon;
  diff?: number;
  description?: string;
  error?: string | null;
};

export const BaseKPI = ({
  title,
  value,
  isLoading,
  icon: Icon, // Use a different name for the prop, like 'IconComponent'
  diff,
  description,
  error,
}: Props) => {
  return (
    <Card className="flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {Icon && <Icon />} {/* Render the icon directly */}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-9 w-full" />
        ) : error ? (
          <div className="text-destructive text-sm">{error}</div>
        ) : (
          <div className="text-2xl font-bold">{value}</div>
        )}
        {diff && (
          <div
            className={cn("text-sm", {
              "text-destructive": diff < 0,
              "text-emerald-500": diff > 0,
            })}
          >
            {diff > 0 ? "+" : ""}
            {diff}%
          </div>
        )}
        {description && (
          <div className="text-xs text-muted-foreground">{description}</div>
        )}
      </CardContent>
    </Card>
  );
};

```

Key changes:

*   **`"use client";` removed:** This makes `BaseKPI` a Server Component.
*   **`icon: Icon`:**  The `icon` prop is now correctly typed as `LucideIcon` (which represents a component) and renamed to `Icon` to avoid naming conflicts.
* **`utils/index`:** Added `/index` to the import path.

**2. `LitigationCasesKPI` (No Changes Needed)**

Your `LitigationCasesKPI` component is already correctly set up as a Server Component, fetching data using a Server Action. No changes are needed here.

```typescript:apps/app/app/(authenticated)/components/dashboard/litigation-cases-kpi.tsx
// apps/app/app/(authenticated)/components/dashboard/litigation-cases-kpi.tsx
import { Gavel } from 'lucide-react';
import { BaseKPI } from '../shared/base-kpi';
import { getAllCases } from '@/app/actions/cases/cases-actions';

const LitigationCasesKPI = async () => {

  const cases = await getAllCases();
  const totalCases = cases ? cases.length : 0;

  return (
    <BaseKPI
      title="Litigation Cases"
      icon={Gavel}
      value={totalCases}
      isLoading={false}
      // diff={0} // You'd calculate this based on previous data, if available
    />
  );
};

export default LitigationCasesKPI;
```

**3. `page.tsx` (No Changes Needed)**

Your `page.tsx` is also correctly set up, importing and rendering `LitigationCasesKPI`.

```typescript:apps/app/app/(authenticated)/page.tsx
import { env } from '@/env';
import { auth } from '@repo/auth/server';
import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { notFound } from 'next/navigation';
import { AvatarStack } from './components/avatar-stack';
import { Cursors } from './components/cursors';
import { Header } from './components/header';
import LitigationCasesKPI from './components/dashboard/litigation-cases-kpi'; // Import the component

const title = 'Acme Inc';
const description = 'My application.';

const CollaborationProvider = dynamic(() =>
  import('./components/collaboration-provider').then(
    (mod) => mod.CollaborationProvider
  )
);

export const metadata: Metadata = {
  title,
  description,
};

const App = async () => {
  const { orgId, userId } = await auth(); // Get Clerk user ID

  if (!orgId) {
    notFound();
  }

  return (
    <>
      <Header pages={['Building Your Application']} page="Data Fetching">
        {env.LIVEBLOCKS_SECRET && (
          <CollaborationProvider orgId={orgId}>
            <AvatarStack />
            <Cursors />
          </CollaborationProvider>
        )}
      </Header>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="grid auto-rows-min gap-4 md:grid-cols-3">
          <LitigationCasesKPI /> {/* Render the component here */}
        </div>
        <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" />
      </div>
    </>
  );
};

export default App;
```

**4.  `cases-actions.ts` (Review)**

Make sure your `cases-actions.ts` file is correctly using `getTenantDbClientUtil()` and passing the client to your query functions.

```typescript:apps/app/app/actions/cases/cases-actions.ts
'use server';

// apps/app/app/(authenticated)/dashboard/actions.ts
import { getTenantDbClientUtil } from '@/app/utils/tenant-db';
import { getAdvisoryCasesCount, getLitigationCasesCount } from '@repo/database/src/tenant-app/queries/cases-queries';
import { revalidatePath } from 'next/cache';
import { auth } from "@repo/auth/server";
import { eq } from "drizzle-orm";
import { cases } from '@repo/database/src/tenant-app/schema';

export async function getLitigationCasesKPI() {
  try {
    const tenantDb = await getTenantDbClientUtil(); // Get tenantDb inside the action
    const count = await getLitigationCasesCount(tenantDb);
    return {
      status: 'success',
      message: 'Litigation cases count retrieved',
      data: { count }
    };
  } catch (error) {
    console.error('Error in getLitigationCasesKPI:', error);
    return {
      status: 'error',
      message: 'Failed to get litigation cases count'
    };
  }
}

export async function getAdvisoryCasesKPI() { // Action now accepts tenantDb
  try {
    const tenantDb = await getTenantDbClientUtil(); // Get tenantDb inside the action
    const count = await getAdvisoryCasesCount(tenantDb); // Pass tenantDb to query
    return {
      status: 'success',
      data: { count },
      message: 'Advisory cases count retrieved successfully',
    };
  } catch (error) {
    console.error('Error in getAdvisoryCasesKPI:', error);
    return {
      status: 'error',
      message: 'Failed to get advisory cases count',
    };
  }
}

// Example: Fetch all cases for the tenant
export async function getAllCases() {
  try {
    const tenantDb = await getTenantDbClientUtil();
    const allCases = await tenantDb.select().from(cases);
    return allCases;
  } catch (error) {
    console.error("Error fetching cases:", error);
    return null; // Or throw an error, depending on your error handling
  }
}

// Example: Create a new case
export async function createCase(formData: FormData) {
    const { userId } = await auth();
    if (!userId) {
        throw new Error("User not authenticated");
    }

    const title = formData.get("title")?.toString();
    const description = formData.get("description")?.toString();

    if (!title || !description) {
        throw new Error("Title and description are required");
    }


  try {
    const tenantDb = await getTenantDbClientUtil();

    //   // TODO: Map Clerk userId to internal tenant user ID.  See section below.
    //   const internalUserId = await getInternalUserId(tenantDb, userId);

    const newCase = await tenantDb
      .insert(cases)
      .values({

        title: title,
        description: description,
        type: 'advisory',
        status: 'pending',
        riskLevel: 'low',
        startDate: new Date(),
        endDate: new Date(),
        // userId: internalUserId, // Use the internal user ID
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
      revalidatePath("/");

    return newCase[0];
  } catch (error) {
    console.error("Error creating case:", error);
    return null; // Or throw an error
  }
}

// Example: Update a case
export async function updateCase(caseId: number, formData: FormData) {
  const { userId } = await auth();
  if (!userId) {
      throw new Error("User not authenticated");
  }

  const title = formData.get("title")?.toString();
  const description = formData.get("description")?.toString();

  if (!title || !description) {
      throw new Error("Title and description are required");
  }

  try {
    const tenantDb = await getTenantDbClientUtil();

    // TODO: Map Clerk userId to internal tenant user ID.
    // const internalUserId = await getInternalUserId(tenantDb, userId);

    const updatedCase = await tenantDb
      .update(cases)
      .set({
        title,
        description,
        // userId: internalUserId, // Use the internal user ID
        updatedAt: new Date(),
      })
      .where(eq(cases.id, caseId.toString()))
      .returning();
      revalidatePath("/");

    return updatedCase[0];
  } catch (error) {
    console.error("Error updating case:", error);
    return null; // Or throw an error
  }
}

// Example: Delete a case
export async function deleteCase(caseId: number) {
    const { userId } = await auth();
    if (!userId) {
        throw new Error("User not authenticated");
    }

    try {
        const tenantDb = await getTenantDbClientUtil();

        // TODO: Consider authorization checks here, e.g., is this user allowed to delete this case?

        const deletedCase = await tenantDb.delete(cases).where(eq(cases.id, caseId.toString())).returning();
        revalidatePath("/");
        return deletedCase[0];

    } catch (error) {
        console.error("Error deleting case:", error);
        return null; // Or throw an error
    }
}
```

**5. General Data Fetching Pattern (for the Future)**

Here's the pattern you should follow for fetching and displaying data throughout your application:

*   **Server Actions:** Create Server Actions (like `getAllCases`, `getCaseById`, `createCase`, etc.) in the `app/actions` directory.  These actions should:
    *   Handle authentication (using `auth()` from `@repo/auth/server`).
    *   Get the tenant database client using `getTenantDbClientUtil()`.
    *   Call your query functions (from `@repo/database`), passing in the `tenantDb` client.
    *   Return the data (or handle errors).

*   **Query Functions:** Create focused query functions (like `getLitigationCasesCount`, `getCasesByUser`, etc.) in your `@repo/database` package. These functions should:
    *   Accept the `tenantDb` client as an argument.
    *   Construct and execute Drizzle queries.
    *   Return the results.

*   **Server Components:**
    *   For initial data loading, use Server Components.
    *   Import and call the appropriate Server Actions directly within the Server Component.
    *   Pass the data returned by the Server Actions as props to child components (either Server or Client Components).

*   **Client Components:**
    *   Use Client Components for interactivity (handling user input, managing state, using browser APIs).
    *   *Never* call Server Actions directly from `useEffect`.
    *   Receive initial data as props from parent Server Components.
    *   For updates triggered by user interaction, call Server Actions directly (using `form` actions or event handlers) and update local state using a state management library (if needed).

**Example (Adding an "Advisory Cases" KPI):**

1.  **Query Function:**

    ```typescript:packages/database/src/tenant-app/queries/cases-queries.ts
    // packages/database/src/tenant-app/queries/cases-queries.ts
    import { cases } from '../schema';
    import type { DrizzleClient } from '../tenant-connection-db'; // Type only import
    import { eq, and, count } from 'drizzle-orm';

    export async function getLitigationCasesCount(tenantDb: DrizzleClient): Promise<number> {
      // Use the tenantDb passed in as an argument
      const result = await tenantDb.select({ value: count() }).from(cases).where(eq(cases.type, 'litigation'));
      return result[0]?.value ?? 0;
    }

    // Add this function
    export async function getAdvisoryCasesCount(tenantDb: DrizzleClient): Promise<number> {
      const result = await tenantDb.select({ value: count() }).from(cases).where(eq(cases.type, 'advisory'));
      return result[0]?.value ?? 0;
    }
    ```

2.  **Server Action:**

    ```typescript:apps/app/app/actions/cases/cases-actions.ts
    // ... (existing code) ...

    export async function getAdvisoryCasesKPI() { // Action now accepts tenantDb
      try {
        const tenantDb = await getTenantDbClientUtil(); // Get tenantDb inside the action
        const count = await getAdvisoryCasesCount(tenantDb); // Pass tenantDb to query
        return {
          status: 'success',
          data: { count },
          message: 'Advisory cases count retrieved successfully',
        };
      } catch (error) {
        console.error('Error in getAdvisoryCasesKPI:', error);
        return {
          status: 'error',
          message: 'Failed to get advisory cases count',
        };
      }
    }
    ```

3.  **Component:**

    ```typescript:apps/app/app/(authenticated)/components/dashboard/advisory-cases-kpi.tsx
    // apps/app/app/(authenticated)/components/dashboard/advisory-cases-kpi.tsx
    import { BookOpen } from 'lucide-react'; // Example icon
    import { BaseKPI } from '../shared/base-kpi';
    import { getAdvisoryCasesKPI } from '@/app/actions/cases/cases-actions';

    const AdvisoryCasesKPI = async () => {
      const { data, status, message } = await getAdvisoryCasesKPI();
      const totalCases = data?.count ?? 0;
      const error = status === 'error' ? message : undefined;

      return (
        <BaseKPI
          title="Advisory Cases"
          icon={BookOpen}
          value={totalCases}
          isLoading={status !== 'error' && !data}
          error={error}
        />
      );
    };

    export default AdvisoryCasesKPI;
    ```

4.  **Add to `page.tsx`:**

    ```typescript:apps/app/app/(authenticated)/page.tsx
    // ... (existing imports) ...
    import LitigationCasesKPI from './components/dashboard/litigation-cases-kpi';
    import AdvisoryCasesKPI from './components/dashboard/advisory-cases-kpi'; // Import

    // ... (rest of your page.tsx) ...

    <div className="grid auto-rows-min gap-4 md:grid-cols-3">
      <LitigationCasesKPI />
      <AdvisoryCasesKPI /> {/* Add the new KPI here */}
    </div>
    ```

This consistent pattern will make your application much easier to maintain, scale, and debug. By making `BaseKPI` a Server Component, you've eliminated the root cause of the error and established a solid foundation for future development. Remember to always prioritize Server Components for data fetching and initial rendering whenever possible.


---

_**User**_

ok can you write some guidelines and rules of how this type of fetching data components need to be designed. 

save the rules in this file @data-flow.md 

---

_**Assistant**_

```markdown:.cursor/research/data-flow.md
# Data Fetching Guidelines and Rules

This document outlines the guidelines and rules for designing data fetching components in our Next.js application with a multi-tenant architecture. These rules ensure consistency, efficiency, security, and maintainability.

**I. Core Principles**

1.  **Server-Centric Data Fetching:** Prioritize fetching data on the server using Server Components and Server Actions. This improves performance, reduces client-side load, and enhances security.
2.  **Centralized Connection Management:** Use `getTenantDbClientUtil()` to obtain the tenant database connection *exclusively* within Server Actions. This function handles tenant identification, connection URL retrieval (with caching), and Drizzle client creation/reuse.
3.  **Separation of Concerns:** Clearly separate data fetching logic (Server Actions), database query logic (query functions), and presentation logic (components).
4.  **Caching:** Leverage Next.js's built-in request memoization and Redis caching (for connection URLs) to minimize database load and improve response times.
5.  **Error Handling:** Implement robust error handling in Server Actions and propagate errors appropriately to the UI.
6.  **Authentication and Authorization:** Always verify user authentication (using Clerk) within Server Actions *before* accessing any data. Implement authorization checks as needed to ensure users only access data they are permitted to see.
7. **Type Safety:** Use TypeScript throughout to ensure type safety and catch errors early.

**II. Component Design Rules**

1.  **Server Components for Initial Data:**
    *   Use Server Components for fetching initial data required to render a page or component.
    *   Call Server Actions directly within Server Components to fetch data.
    *   Pass fetched data as props to child components (Server or Client).

2.  **Client Components for Interactivity:**
    *   Use Client Components for handling user interactions, managing local state, and using browser APIs.
    *   Receive initial data as props from parent Server Components.
    *   *Never* call Server Actions directly from `useEffect`.
    *   For data updates triggered by user actions, call Server Actions directly (e.g., using form actions or event handlers). Use a state management library (Zustand, Redux, etc.) if needed for complex state updates.

3.  **`BaseKPI` and Similar Components:**
    *   Reusable UI components like `BaseKPI` should ideally be Server Components if they don't require client-side interactivity.
    *   If a component *must* be a Client Component, pass only serializable data (plain objects, strings, numbers, etc.) as props. Avoid passing functions or class instances.  If you need to pass a component (like an icon), make sure the parent is also a server component.

4.  **Avoid Prop Drilling:** While passing data as props is the primary method, avoid excessive prop drilling. If a deeply nested component needs data, consider:
    *   Creating a more specific Server Action that fetches only the data needed by that subtree.
    *   Using a lightweight context (but be mindful of re-renders in Client Components).  Context is generally *not* needed for Server Components, as data fetching is colocated.

**III. Server Action Rules**

1.  **Location:** Place all Server Actions in the `app/actions` directory, organized by resource (e.g., `cases/cases-actions.ts`, `users/user-actions.ts`).
2.  **Authentication:** Always check user authentication using `auth()` from `@repo/auth/server` at the beginning of each Server Action.
3.  **Tenant DB Connection:** Use `getTenantDbClientUtil()` to obtain the tenant database client *inside* each Server Action.
4.  **Query Functions:** Call query functions (from `@repo/database`) to perform database operations. Pass the `tenantDb` client as an argument to these functions.
5.  **Error Handling:**
    *   Use `try...catch` blocks to handle potential errors.
    *   Log errors appropriately (e.g., using `console.error`).
    *   Return error information in a consistent format (e.g., `{ status: 'error', message: '...' }`).
    *   Consider using a dedicated error parsing/handling utility.
6.  **Data Validation:** Validate any data received from the client (e.g., form data) *before* interacting with the database. Use a schema validation library like Zod.
7.  **Revalidation:** Use `revalidatePath` or `revalidateTag` after data mutations (create, update, delete) to ensure data consistency.
8. **Return Values:** Server actions should return plain, serializable objects.

**IV. Query Function Rules**

1.  **Location:** Place query functions within the `@repo/database` package, organized by resource (e.g., `src/tenant-app/queries/cases-queries.ts`).
2.  **Database Client:** Accept the `tenantDb` (Drizzle client) as an argument.
3.  **Focus:** Query functions should *only* contain Drizzle query logic.  Do *not* handle authentication, authorization, or connection management here.
4.  **Return Values:** Return the results of the Drizzle queries directly.
5. **Type Safety:** Use the types generated by Drizzle.

**V. Example Structure**

```
apps/
  app/
    app/
      (authenticated)/
        page.tsx         <- Server Component (fetches data via Server Actions)
        components/
          dashboard/
            litigation-cases-kpi.tsx  <- Server Component (fetches data via Server Action)
            advisory-cases-kpi.tsx   <- Server Component (fetches data via Server Action)
          shared/
            base-kpi.tsx     <- Server Component (ideally)
      actions/
        cases/
          cases-actions.ts  <- Server Actions (get data, call query functions)
        users/
          user-actions.ts
      utils/
        tenant-db.ts      <- getTenantDbClientUtil()
        tenant-identifier.ts

packages/
  database/
    src/
      main-app/
        queries/
          organization-queries.ts
        schema/
          organizations-schema.ts
      tenant-app/
        queries/
          cases-queries.ts  <- Drizzle query functions
        schema/
          cases-schema.ts
        tenant-connection-db.ts
```

**VI. Summary of Key Functions**

*   **`getTenantDbClientUtil()`:** (Server Action Utility) Gets the tenant database Drizzle client. Handles tenant identification, connection URL retrieval (with caching), and client creation/reuse.
*   **`getTenantIdentifier()`:** (Server Action Utility) Extracts the tenant identifier (subdomain) from the request headers.
*   **`getTenantConnectionUrl()` / `getTenantConnectionUrlAction()`:** (Server Action) Retrieves the database connection URL for a given tenant, using Redis caching.
*   **`auth()`:** (from `@repo/auth/server`) Verifies user authentication in Server Actions.
*   **Server Actions (e.g., `getAllCases`, `createCase`)**: Handle authentication, get the tenant DB client, call query functions, and return data or errors.
*   **Query Functions (e.g., `getLitigationCasesCount`, `getCasesByUser`)**: Execute Drizzle queries against the tenant database.

By following these guidelines, you'll create a robust, maintainable, and scalable data fetching architecture for your multi-tenant application.
```


---

_**User**_

this is great, now how can we incorporate the user id, remember i mentioned about using specific information for certain users in our schema we do have the clerk id @users-schema.ts so we can do the mapping here no need for an additional table

---

_**Assistant**_

You're right, we can definitely leverage the existing `clerkId` in your `users` table within the *tenant* database to map to the internal `userId`. This simplifies things and avoids an extra table. Here's how we'll adapt the architecture and code:

**1. Conceptual Overview**

*   **Clerk Authentication:** As before, the user logs in via Clerk, providing the `userId` (Clerk's ID).
*   **Tenant Identification:** We extract the subdomain (tenant identifier) from the request.
*   **Tenant DB Connection:** We connect to the correct tenant database using `getTenantDbClientUtil()`.
*   **Internal User ID Lookup:** *Within the Server Action*, we query the tenant's `users` table using the Clerk `userId` to find the corresponding internal `id`.
*   **Data Query:** We use the internal `id` to filter data within the tenant database.

**2. Code Modifications**

*   **`user-actions.ts` (New Server Action - `getInternalUserId`)**: We'll create a new Server Action to encapsulate the logic for retrieving the internal user ID.

```typescript:apps/app/app/actions/users/user-actions.ts
// apps/app/app/actions/users/user-actions.ts
"use server"

import { getTenantDbClientUtil } from "@/app/utils/tenant-db";
import { users } from "@repo/database/src/tenant-app/schema"; // Import tenant's users schema
import { auth } from "@repo/auth/server";
import { eq } from "drizzle-orm";

export async function getInternalUserId(): Promise<number | null> {
  const { userId } = await auth();
  if (!userId) {
    return null; // Or throw an error, depending on your needs
  }

  try {
    const tenantDb = await getTenantDbClientUtil();
    const user = await tenantDb.query.users.findFirst({
      where: eq(users.externalId, userId), // Use externalId (Clerk ID)
      columns: { id: true }, // Only select the internal id
    });

    return user?.id ?? null;
  } catch (error) {
    console.error("Error getting internal user ID:", error);
    return null; // Or throw an error
  }
}
```

*   **`cases-actions.ts` (Modified Server Actions):** We'll update the Server Actions that need the internal user ID to call `getInternalUserId()`.

```typescript:apps/app/app/actions/cases/cases-actions.ts
'use server';

// apps/app/app/(authenticated)/dashboard/actions.ts
import { getTenantDbClientUtil } from '@/app/utils/tenant-db';
import { getAdvisoryCasesCount, getLitigationCasesCount } from '@repo/database/src/tenant-app/queries/cases-queries';
import { revalidatePath } from 'next/cache';
import { auth } from "@repo/auth/server";
import { eq } from "drizzle-orm";
import { cases } from '@repo/database/src/tenant-app/schema';
import { getInternalUserId } from '../users/user-actions'; // Import the new action

export async function getLitigationCasesKPI() {
  try {
    const tenantDb = await getTenantDbClientUtil(); // Get tenantDb inside the action
    const count = await getLitigationCasesCount(tenantDb);
    return {
      status: 'success',
      message: 'Litigation cases count retrieved',
      data: { count }
    };
  } catch (error) {
    console.error('Error in getLitigationCasesKPI:', error);
    return {
      status: 'error',
      message: 'Failed to get litigation cases count'
    };
  }
}

export async function getAdvisoryCasesKPI() { // Action now accepts tenantDb
  try {
    const tenantDb = await getTenantDbClientUtil(); // Get tenantDb inside the action
    const count = await getAdvisoryCasesCount(tenantDb); // Pass tenantDb to query
    return {
      status: 'success',
      data: { count },
      message: 'Advisory cases count retrieved successfully',
    };
  } catch (error) {
    console.error('Error in getAdvisoryCasesKPI:', error);
    return {
      status: 'error',
      message: 'Failed to get advisory cases count',
    };
  }
}

// Example: Fetch all cases for the tenant
export async function getAllCases() {
  try {
    const tenantDb = await getTenantDbClientUtil();
    const allCases = await tenantDb.select().from(cases);
    return allCases;
  } catch (error) {
    console.error("Error fetching cases:", error);
    return null; // Or throw an error, depending on your error handling
  }
}

// Example: Create a new case
export async function createCase(formData: FormData) {
    const internalUserId = await getInternalUserId(); // Get internal user ID
    if (!internalUserId) {
        throw new Error("User not authenticated or not found in tenant DB");
    }

    const title = formData.get("title")?.toString();
    const description = formData.get("description")?.toString();

    if (!title || !description) {
        throw new Error("Title and description are required");
    }


  try {
    const tenantDb = await getTenantDbClientUtil();

    const newCase = await tenantDb
      .insert(cases)
      .values({

        title: title,
        description: description,
        type: 'advisory',
        status: 'pending',
        riskLevel: 'low',
        startDate: new Date(),
        endDate: new Date(),
        userId: internalUserId, // Use the internal user ID
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
      revalidatePath("/");

    return newCase[0];
  } catch (error) {
    console.error("Error creating case:", error);
    return null; // Or throw an error
  }
}

// Example: Update a case
export async function updateCase(caseId: number, formData: FormData) {
  const internalUserId = await getInternalUserId(); // Get internal user ID.
  if (!internalUserId) {
      throw new Error("User not authenticated or not found in tenant DB");
  }

  const title = formData.get("title")?.toString();
  const description = formData.get("description")?.toString();

  if (!title || !description) {
      throw new Error("Title and description are required");
  }

  try {
    const tenantDb = await getTenantDbClientUtil();

    const updatedCase = await tenantDb
      .update(cases)
      .set({
        title,
        description,
        userId: internalUserId, // Use the internal user ID
        updatedAt: new Date(),
      })
      .where(eq(cases.id, caseId.toString()))
      .returning();
      revalidatePath("/");

    return updatedCase[0];
  } catch (error) {
    console.error("Error updating case:", error);
    return null; // Or throw an error
  }
}

// Example: Delete a case
export async function deleteCase(caseId: number) {
    const internalUserId = await getInternalUserId(); // Get internal user ID
    if (!internalUserId) {
        throw new Error("User not authenticated or not found in tenant DB");
    }

    try {
        const tenantDb = await getTenantDbClientUtil();

        // TODO: Consider authorization checks here, e.g., is this user allowed to delete this case?

        const deletedCase = await tenantDb.delete(cases).where(eq(cases.id, caseId.toString())).returning();
        revalidatePath("/");
        return deletedCase[0];

    } catch (error) {
        console.error("Error deleting case:", error);
        return null; // Or throw an error
    }
}
```

*   **`cases-queries.ts` (No Changes):** Your query functions remain unchanged; they continue to receive the `tenantDb` client and now can use the `userId` (which is the *internal* ID) for filtering.

* **Schema changes:**
```typescript:packages/database/src/tenant-app/schema/users-schema.ts
// packages/database/src/tenant-app/schema/users-schema.ts
import {
    timestamp,
    pgTable,
    text,
    primaryKey,
    integer,
    serial,
    varchar,
  } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

export const users = pgTable("users", {
    id: serial("id").primaryKey(), // Auto-incrementing internal ID
    name: varchar("name", { length: 255 }),
    image: text('image'),
    externalId: text('external_id'), // to store the clerk id.
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  });

// Types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

// Zod schemas (optional, but recommended for validation)
export const usersInsertSchema = createInsertSchema(users);
export const usersSelectSchema = createSelectSchema(users);
```

```typescript:packages/database/src/tenant-app/schema/cases-schema.ts
// packages/database/src/tenant-app/schema/cases-schema.ts
import {
    timestamp,
    pgTable,
    text,
    primaryKey,
    integer,
    serial,
    varchar,
  } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { users } from './users-schema';

export const cases = pgTable("cases", {
    id: serial("id").primaryKey(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text('description').notNull(),
    type: varchar("type", { length: 255 }).notNull(),
    status: varchar("status", { length: 255 }).notNull(),
    riskLevel: varchar("risk_level", { length: 255 }).notNull(),
    startDate: timestamp("start_date").notNull(),
    endDate: timestamp("end_date").notNull(),
    userId: integer('user_id').references(() => users.id), //references internal user id.
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  });

// Types
export type Case = typeof cases.$inferSelect;
export type CaseInsert = typeof cases.$inferInsert;

// Zod schemas (optional, but recommended for validation)
export const casesInsertSchema = createInsertSchema(cases);
export const casesSelectSchema = createSelectSchema(cases);
```

**3. Key Improvements**

*   **Simplified Mapping:** We've eliminated the need for a separate `user_mappings` table.
*   **Centralized Lookup:** The `getInternalUserId()` Server Action provides a single, reusable place to get the internal user ID.
*   **Efficiency:**  The internal ID lookup is a simple query on the tenant's `users` table, which should be fast (especially with an index on `externalId`).
*   **Type Safety:** We're using TypeScript throughout, ensuring that the correct types are used for user IDs.
*   **Consistency:** This approach aligns with the overall data fetching architecture we've established.

**4.  Important Considerations**

*   **User Creation/Onboarding:**  You'll need to ensure that when a user signs up (or joins a tenant), a record is created in the tenant's `users` table, storing their Clerk `userId` in the `externalId` field. This is crucial for the mapping to work.  You'd typically do this in a Server Action triggered after the user successfully signs up with Clerk.
*   **Authorization:**  While we've handled *authentication* (verifying who the user is), remember to implement *authorization* (checking what the user is allowed to do) within your Server Actions.  This might involve checking user roles or permissions associated with the internal `userId`.

This revised approach provides a clean and efficient way to handle user-specific data within your multi-tenant application. By leveraging the existing `clerkId` field and creating a dedicated Server Action for the internal ID lookup, you've simplified the architecture while maintaining security and performance. Remember to handle the user creation/onboarding process to ensure the `externalId` is correctly populated in the tenant database.


---

_**User**_

now lets say that for this card componets i want to be able to drag and drop them in a way that the user sets where it must be, so the user has to be able to drag a component and set it wherever he wants in the main wrapper, how do we design this, which one would be the parent component how is this handled ? do we need a warapper? whats the architecture for this type of cases?

---

_**Assistant**_

Okay, let's design the drag-and-drop functionality for your KPI cards. This involves both client-side interaction (dragging) and server-side persistence (saving the order).

**1. Component Hierarchy and Responsibilities**

*   **`page.tsx` (Server Component):**
    *   Remains a Server Component.
    *   Fetches the *initial* order of the KPIs (if any saved order exists).
    *   Passes the KPI data *and* the initial order to a new `DashboardGrid` component.

*   **`DashboardGrid` (Client Component):**
    *   This is a *new* Client Component that will manage the drag-and-drop functionality and the layout.
    *   Receives the KPI data and initial order as props.
    *   Uses a drag-and-drop library (I recommend `dnd-kit`) to handle the dragging and dropping.
    *   Manages the *local* state of the KPI order.
    *   Calls a Server Action to *persist* the order whenever it changes.

*   **`LitigationCasesKPI`, `AdvisoryCasesKPI` (Server Components):**
    *   Remain Server Components.
    *   Their primary responsibility is to fetch data.
    *   They are rendered *within* `DashboardGrid`.

**2. Data Flow**

1.  **Initial Load:**
    *   `page.tsx` fetches the KPI data and the saved order (from the database).
    *   `page.tsx` passes this data to `DashboardGrid`.
2.  **Drag and Drop:**
    *   The user drags a KPI card within `DashboardGrid`.
    *   `dnd-kit` handles the visual dragging and dropping.
    *   `DashboardGrid` updates its *local* state to reflect the new order.
3.  **Persistence:**
    *   Whenever the order changes (e.g., on drag end), `DashboardGrid` calls a Server Action (e.g., `updateKPIOrder`) to save the new order to the database.
    *   The Server Action updates the order in the database.
    *   (Optional) The Server Action could revalidate the page to ensure the UI reflects the saved order, but this might not be necessary if you manage the local state correctly.

**3. Database Schema (Main App)**

You'll need a way to store the KPI order in your *main* application database. A simple approach is to add a table:

```typescript:packages/database/src/main-app/schema/kpi-order-schema.ts
// packages/database/src/main-app/schema/kpi-order-schema.ts
import {
  pgTable,
  text,
  timestamp,
  uuid,
  primaryKey,
  integer,
} from 'drizzle-orm/pg-core';

export const kpiOrder = pgTable('kpi_order', {
  // organizationId: text('organization_id').notNull(), // Or userId, depending on your needs
  organizationId: uuid('organization_id').notNull().references(() => organizations.id),
  kpiId: text('kpi_id').notNull(), // e.g., 'litigation-cases', 'advisory-cases'
  order: integer('order').notNull(), // The order of the KPI
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return {
    pk: primaryKey(table.organizationId, table.kpiId), // Composite primary key
  };
});

// Types (optional, but recommended)
export type KPIOrder = typeof kpiOrder.$inferSelect;
export type NewKPIOrder = typeof kpiOrder.$inferInsert;

```
Add the relations:
```typescript:packages/database/src/main-app/schema/organizations-schema.ts
// packages/database/src/main-app/schema/organizations-schema.ts
import { relations } from 'drizzle-orm';
import {
  boolean,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { organizationMembers } from './organizations-members-schema';
import { projects } from './projects-schema';
import { kpiOrder } from './kpi-order-schema';

export const organizations = pgTable('organizations', {
  id: uuid('id').primaryKey().defaultRandom(),
  clerkId: text('clerk_id').unique(),
  name: text('name'),
  slug: text('slug').unique(),
  subdomainSlug: text('subdomain_slug').unique(),
  logoUrl: text('logo_url'),
  hasProject: boolean('has_project').default(false).notNull(),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  createdBy: uuid('created_by'),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const organizationsRelations = relations(organizations, ({ many }) => ({
  members: many(organizationMembers),
  projects: many(projects),
  kpiOrder: many(kpiOrder),
}));

// Types
export type Organization = typeof organizations.$inferSelect;
export type NewOrganization = typeof organizations.$inferInsert;

export const organizationInsertSchema = createInsertSchema(organizations);
export const organizationSelectSchema = createSelectSchema(organizations);
```

*   `organizationId`:  Links the order to a specific organization (or user, depending on your requirements).  You could use `userId` instead if the order is user-specific rather than organization-wide.
*   `kpiId`: A unique identifier for each KPI (e.g., "litigation-cases", "advisory-cases").  This is a string, *not* a foreign key to another table.
*   `order`: An integer representing the position of the KPI in the grid.

**4. Code Implementation**

*   **Install `dnd-kit`:**

    ```bash
    npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
    ```

*   **`page.tsx` (Server Component):**

    ```typescript:apps/app/app/(authenticated)/page.tsx
    import { env } from '@/env';
    import { auth } from '@repo/auth/server';
    import type { Metadata } from 'next';
    import dynamic from 'next/dynamic';
    import { notFound } from 'next/navigation';
    import { AvatarStack } from './components/avatar-stack';
    import { Cursors } from './components/cursors';
    import { Header } from './components/header';
    // import LitigationCasesKPI from './components/dashboard/litigation-cases-kpi'; // No longer directly imported
    // import AdvisoryCasesKPI from './components/dashboard/advisory-cases-kpi'; // No longer directly imported
    import DashboardGrid from './components/dashboard/dashboard-grid'; // Import the new component
    import { getKPIOrder } from '@/app/actions/kpi-actions';
    import { getTenantOrganizationId } from '@/app/actions/organizations-actions';

    const title = 'Acme Inc';
    const description = 'My application.';

    const CollaborationProvider = dynamic(() =>
      import('./components/collaboration-provider').then(
        (mod) => mod.CollaborationProvider
      )
    );

    export const metadata: Metadata = {
      title,
      description,
    };

    const App = async () => {
      const { orgId, userId } = await auth(); // Get Clerk user ID

      if (!orgId) {
        notFound();
      }

      const organizationId = await getTenantOrganizationId();

      if(!organizationId) {
        notFound();
      }

      // Fetch initial KPI order
      const initialKPIOrder = await getKPIOrder(organizationId);

      // Define KPI data (including IDs and initial order)
      const kpis = [
        { id: 'litigation-cases', component: 'LitigationCasesKPI', title: 'Litigation Cases' },
        { id: 'advisory-cases', component: 'AdvisoryCasesKPI', title: 'Advisory Cases' },
        // Add other KPIs here
      ];

        // Combine initial order from the database with the KPI data
        const orderedKPIs = kpis.map(kpi => {
            const orderEntry = initialKPIOrder.find(entry => entry.kpiId === kpi.id);
            return {
                ...kpi,
                order: orderEntry ? orderEntry.order : Infinity, // Default to end if not found
            };
        }).sort((a, b) => a.order - b.order); // Sort by order


      return (
        <>
          <Header pages={['Building Your Application']} page="Data Fetching">
            {env.LIVEBLOCKS_SECRET && (
              <CollaborationProvider orgId={orgId}>
                <AvatarStack />
                <Cursors />
              </CollaborationProvider>
            )}
          </Header>
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            {/* Pass KPI data and initial order to DashboardGrid */}
            <DashboardGrid kpis={orderedKPIs} />
          </div>
          <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" />
        </>
      );
    };

    export default App;
    ```

* **Create `app/actions/organizations-actions.ts`**
```typescript:apps/app/app/actions/organizations-actions.ts
"use server";

import { db } from "@repo/database/src/db";
import { organizations } from "@repo/database/src/main-app/schema";
import { eq } from "drizzle-orm";
import { auth } from "@repo/auth/server";
import { getTenantIdentifier } from "../utils/tenant-identifier";

export const getTenantOrganizationId = async () => {
    const { orgId } = await auth();
    const tenantId = await getTenantIdentifier();

    if(!orgId || !tenantId) {
        return null;
    }

    const organization = await db.query.organizations.findFirst({
        where: eq(organizations.slug, tenantId)
    });

    return organization?.id;
}
```

*   **`DashboardGrid` (Client Component):**

    ```typescript:apps/app/app/(authenticated)/components/dashboard/dashboard-grid.tsx
    "use client";

    import {
      DndContext,
      DragEndEvent,
      DragOverEvent,
      DragOverlay,
      DragStartEvent,
      PointerSensor,
      useSensor,
      useSensors,
    } from "@dnd-kit/core";
    import {
      SortableContext,
      arrayMove,
      sortableKeyboardCoordinates,
      useSortable,
    } from "@dnd-kit/sortable";
    import { CSS } from "@dnd-kit/utilities";
    import { useState } from "react";
    import { updateKPIOrder } from "@/app/actions/kpi-actions"; // Import the Server Action
    import LitigationCasesKPI from "./litigation-cases-kpi"; // Import the KPI components
    import AdvisoryCasesKPI from "./advisory-cases-kpi";

    type KPI = {
      id: string;
      component: string;
      title: string;
      order: number;
    };

    type Props = {
      kpis: KPI[];
    };

    const SortableKPI = ({ kpi }: { kpi: KPI }) => {
      const { attributes, listeners, setNodeRef, transform, transition } =
        useSortable({ id: kpi.id });

      const style = {
        transform: CSS.Transform.toString(transform),
        transition,
      };

      const renderKPIComponent = () => {
        switch (kpi.component) {
          case "LitigationCasesKPI":
            return <LitigationCasesKPI />;
          case "AdvisoryCasesKPI":
            return <AdvisoryCasesKPI />;
          // Add other cases for other KPIs
          default:
            return null; // Or a default component/error message
        }
      };

      return (
        <div
          ref={setNodeRef}
          style={style}
          {...attributes}
          {...listeners}
          className="cursor-grab"
        >
          {renderKPIComponent()}
        </div>
      );
    };

    const DashboardGrid = ({ kpis: initialKPIs }: Props) => {
      const [kpis, setKPIs] = useState(initialKPIs);
      const [activeId, setActiveId] = useState<string | null>(null);

      const sensors = useSensors(
        useSensor(PointerSensor, {
          activationConstraint: {
            distance: 8, // Require movement of 8px before dragging starts
          },
        })
      );

      const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id.toString());
      };

      const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event;

        if (active.id !== over?.id) {
          setKPIs((kpis) => {
            const oldIndex = kpis.findIndex((kpi) => kpi.id === active.id);
            const newIndex = kpis.findIndex((kpi) => kpi.id === over?.id);
            return arrayMove(kpis, oldIndex, newIndex);
          });
        }
      };

      const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (active.id !== over?.id) {
          // Update local state (already done in handleDragOver)

          // Persist the new order to the database
          const newOrder = kpis.map((kpi, index) => ({
            kpiId: kpi.id,
            order: index,
          }));
          await updateKPIOrder(newOrder); // Call the Server Action
        }
        setActiveId(null);
      };

      return (
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={kpis.map((kpi) => kpi.id)}
            strategy={sortableKeyboardCoordinates}
          >
            <div className="grid auto-rows-min gap-4 md:grid-cols-3">
              {kpis.map((kpi) => (
                <SortableKPI key={kpi.id} kpi={kpi} />
              ))}
            </div>
          </SortableContext>
          <DragOverlay>
            {activeId ? (
              <div className="bg-white p-4 rounded-md shadow-lg">
                {/* You might want to render a preview of the active KPI here */}
                {kpis.find(kpi=> kpi.id === activeId)?.title}
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      );
    };

    export default DashboardGrid;
    ```

*   **`kpi-actions.ts` (Server Actions):**

    ```typescript:apps/app/app/actions/kpi-actions.ts
    "use server";

    import { db } from "@repo/database/src/db";
    import { kpiOrder } from "@repo/database/src/main-app/schema/kpi-order-schema";
    import { auth } from "@repo/auth/server";
    import { and, eq } from "drizzle-orm";
    import { revalidatePath } from "next/cache";
    import { getTenantOrganizationId } from "./organizations-actions";

    // Fetch KPI order for an organization
    export async function getKPIOrder(organizationId: string) {
      try {
        const order = await db
          .select()
          .from(kpiOrder)
          .where(eq(kpiOrder.organizationId, organizationId))
          .orderBy(kpiOrder.order)
          .execute();
        return order;
      } catch (error) {
        console.error("Error fetching KPI order:", error);
        return []; // Return an empty array on error
      }
    }

    // Update KPI order for an organization
    export async function updateKPIOrder(newOrder: { kpiId: string; order: number }[]) {
        const organizationId = await getTenantOrganizationId();

        if(!organizationId) {
            throw new Error("Organization not found");
        }

      try {
        // Use a transaction to ensure atomicity
        await db.transaction(async (tx) => {
          // Delete existing order for the organization
          await tx.delete(kpiOrder).where(eq(kpiOrder.organizationId, organizationId));

          // Insert the new order
          if (newOrder.length) {
            const insertValues = newOrder.map(item => ({
                organizationId: organizationId,
                kpiId: item.kpiId,
                order: item.order
            }));

            await tx.insert(kpiOrder).values(insertValues);
          }
        });

        revalidatePath("/"); // Revalidate the dashboard page
      } catch (error) {
        console.error("Error updating KPI order:", error);
        throw new Error("Failed to update KPI order"); // Re-throw for better error handling
      }
    }

    ```

**5.  Key Improvements and Explanations**

*   **`dnd-kit`:**  We're using `dnd-kit`, a powerful and flexible drag-and-drop library for React.  It handles all the complexities of drag-and-drop interactions.
*   **`SortableContext` and `useSortable`:** These are from `dnd-kit/sortable` and make it easy to create sortable lists.
*   **`DragOverlay`:**  Provides a visual representation of the item being dragged.
*   **Server Action for Persistence:** The `updateKPIOrder` Server Action handles saving the new order to the database.  It uses a transaction to ensure that the order is updated atomically (all changes succeed or fail together).
*   **Initial Order:** The `page.tsx` component fetches the initial order from the database and passes it to `DashboardGrid`.
*   **Local State:** `DashboardGrid` manages the *local* state of the KPI order using `useState`. This provides immediate feedback to the user during dragging.
*   **Clear Separation of Concerns:** Each component has a well-defined responsibility, making the code easier to understand and maintain.
* **Error Handling:** Includes error handling in the server actions.
* **Organization ID:** Uses the organization id to save the order of the components.

**6. Further Considerations**

*   **Accessibility:** `dnd-kit` provides good accessibility support, but you should test and ensure your implementation is fully accessible.
*   **Performance:** For a very large number of KPIs, you might need to optimize the rendering (e.g., using virtualization).
*   **User Experience:** Consider adding visual cues (e.g., drop shadows, animations) to enhance the drag-and-drop experience.
*   **Mobile Support:**  `dnd-kit` supports touch events, but you'll need to test and potentially adjust the configuration for optimal mobile use.

This comprehensive setup provides a robust and user-friendly drag-and-drop experience for your KPI cards, with proper data persistence and a clean architecture. Remember to adapt the database schema and code to your specific needs (e.g., user-specific vs. organization-wide order).


---

_**User**_

ok i really like this, we can actually as well allow the users to filter data in the component, for example right now we are retriving all the cases in the table, but perhaps the user just wants to know how many cases he has assigned, how would we do this? 

can we allow the user to determine what "data" to "retrieve" so it would be like allowing the user to set the settings for that component. 

lets make an analaysis and a correct planning, also instead of creating this in the main app database, we need to do it in the respective database of the user in this case the @tenant-app in here we can create a schema for settings, in this schema we can store the information reggarding the possition and settings not just for the kpis but for other components. 

lets think big and plan for the future 

---

_**Assistant**_

Okay, let's design a flexible system for user-configurable component settings, including filtering, and store this within the *tenant* database. This is a significant enhancement, so we'll break it down carefully.

**1. Core Concepts and Requirements**

*   **User-Specific Settings:** Each user within a tenant should be able to customize the settings of various components (KPIs, tables, charts, etc.).
*   **Component-Specific Settings:** Settings should be specific to individual component instances.  For example, one instance of a "Cases" KPI might show *all* cases, while another instance on the same dashboard shows only *assigned* cases.
*   **Extensible Settings:** The system should be designed to accommodate new components and new types of settings easily. We shouldn't have to modify the core schema every time we add a new filter option.
*   **Filtering:** Users should be able to define filters for data displayed in components. This includes:
    *   Filtering by user assignment (e.g., "My Cases").
    *   Filtering by status (e.g., "Active Cases").
    *   Filtering by date ranges (e.g., "Cases Created This Week").
    *   Potentially other criteria specific to the data type.
*   **Persistence:** Settings should be saved in the tenant database and loaded when the user accesses the application.
*   **Default Settings:** There should be sensible default settings for components.
*   **UI for Configuration:** We'll need a UI (eventually) to allow users to modify these settings. For now, we'll focus on the data model and backend logic.

**2. Database Schema (Tenant App)**

We'll create a `component_settings` table in the tenant database.

```typescript:packages/database/src/tenant-app/schema/main/component-settings-schema.ts
// packages/database/src/tenant-app/schema/main/component-settings-schema.ts
import {
  pgTable,
  text,
  timestamp,
  uuid,
  primaryKey,
  jsonb,
  integer,
} from 'drizzle-orm/pg-core';
import { users } from './users-schema';
import { relations } from 'drizzle-orm';

export const componentSettings = pgTable('component_settings', {
  id: uuid('id').primaryKey().defaultRandom(), // Unique ID for each setting instance
  userId: integer('user_id').notNull().references(() => users.id), // Link to the user
  componentId: text('component_id').notNull(), // e.g., 'litigation-cases-kpi', 'cases-table'
  instanceId: text('instance_id').notNull(), // Unique ID for *this instance* of the component (allows multiple instances)
  settings: jsonb('settings').notNull().$type<any>(), // Flexible JSON to store settings
  order: integer('order').notNull().default(0), //for dashboard grid.
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return {
    pk: primaryKey(table.userId, table.componentId, table.instanceId), // Composite primary key
  };
});

export const componentSettingsRelations = relations(componentSettings, ({ one }) => ({
	user: one(users, {
		fields: [componentSettings.userId],
		references: [users.id],
	}),
}));

// Types (optional, but recommended)
export type ComponentSetting = typeof componentSettings.$inferSelect;
export type NewComponentSetting = typeof componentSettings.$inferInsert;
```

Key aspects of this schema:

*   **`id`:** A unique ID for each setting entry.
*   **`userId`:**  Links the settings to a specific user *within the tenant*.
*   **`componentId`:**  A string identifier for the *type* of component (e.g., "litigation-cases-kpi", "cases-table", "cases-chart").  This is *not* a foreign key.
*   **`instanceId`:** A unique identifier for *this specific instance* of the component. This allows a user to have multiple "Cases" KPIs on their dashboard, each with different settings.  This ID will be generated on the client-side when the component is added to the dashboard.
*   **`settings`:**  A `jsonb` column to store the actual settings.  This provides flexibility.  The structure of this JSON will be determined by the component.
*   **`order`:** The order in the dashboard.
*   **`createdAt` / `updatedAt`:** Standard audit fields.

**3. Example `settings` JSON Structures**

Here are examples of what the `settings` JSON might look like for different components and filter scenarios:

*   **Litigation Cases KPI (All Cases):**

    ```json
    {
      "filter": {
        "type": "all"
      }
    }
    ```

*   **Litigation Cases KPI (Assigned to Me):**

    ```json
    {
      "filter": {
        "type": "assignedToMe"
      }
    }
    ```

*   **Litigation Cases KPI (Specific Status):**

    ```json
    {
      "filter": {
        "type": "status",
        "status": "active"
      }
    }
    ```

*   **Cases Table (Filtered by Date Range):**

    ```json
    {
      "filter": {
        "type": "dateRange",
        "startDate": "2024-01-01",
        "endDate": "2024-06-30"
      },
      "columns": ["title", "status", "startDate"] // Example: also store visible columns
    }
    ```

* **Advisory Cases KPI (All Cases):**
```json
{
    "filter": {
        "type": "all"
    }
}
```

**4. Server Actions**

We'll need Server Actions to:

*   **`getComponentSettings(userId, componentId, instanceId)`:**  Retrieves the settings for a specific component instance.
*   **`setComponentSettings(userId, componentId, instanceId, settings)`:**  Saves (creates or updates) the settings for a component instance.
*   **`getAllComponentSettings(userId)`:** Retrieves all settings for a user. This is useful for loading the entire dashboard configuration.
*   **`deleteComponentSettings(userId, componentId, instanceId)`:** Deletes settings (e.g., when a component is removed from the dashboard).

```typescript:apps/app/app/actions/component-settings-actions.ts
// apps/app/app/actions/component-settings-actions.ts
"use server";

import { getTenantDbClientUtil } from "@/app/utils/tenant-db";
import { componentSettings } from "@repo/database/src/tenant-app/schema";
import { and, eq } from "drizzle-orm";
import { getInternalUserId } from "./users/user-actions";

// Get settings for a specific component instance
export async function getComponentSettings(componentId: string, instanceId: string) {
  const internalUserId = await getInternalUserId();
  if (!internalUserId) {
    return null;
  }

  try {
    const tenantDb = await getTenantDbClientUtil();
    const settings = await tenantDb.query.componentSettings.findFirst({
      where: and(
        eq(componentSettings.userId, internalUserId),
        eq(componentSettings.componentId, componentId),
        eq(componentSettings.instanceId, instanceId)
      ),
    });
    return settings;
  } catch (error) {
    console.error("Error getting component settings:", error);
    return null;
  }
}

// Get all settings for a user
export async function getAllComponentSettings() {
    const internalUserId = await getInternalUserId();
    if (!internalUserId) {
      return [];
    }

    try {
      const tenantDb = await getTenantDbClientUtil();
      const allSettings = await tenantDb.query.componentSettings.findMany({
        where: eq(componentSettings.userId, internalUserId),
      });
      return allSettings;
    } catch (error) {
      console.error("Error getting all component settings:", error);
      return [];
    }
}

// Set settings for a component instance (create or update)
export async function setComponentSettings(
  componentId: string,
  instanceId: string,
  settings: any,
  order: number
) {
  const internalUserId = await getInternalUserId();
  if (!internalUserId) {
    throw new Error("User not authenticated or not found in tenant DB");
  }

  try {
    const tenantDb = await getTenantDbClientUtil();
    // Attempt to update existing settings
    const updateResult = await tenantDb
      .update(componentSettings)
      .set({ settings, updatedAt: new Date(), order: order })
      .where(
        and(
          eq(componentSettings.userId, internalUserId),
          eq(componentSettings.componentId, componentId),
          eq(componentSettings.instanceId, instanceId)
        )
      )
      .returning();

    // If no rows were updated, insert new settings
    if (updateResult.length === 0) {
      const insertResult = await tenantDb.insert(componentSettings).values({
        userId: internalUserId,
        componentId,
        instanceId,
        settings,
        order
      }).returning();
      return insertResult[0];
    }

    return updateResult[0];
  } catch (error) {
    console.error("Error setting component settings:", error);
    throw new Error("Failed to set component settings");
  }
}

// Delete settings for a component instance
export async function deleteComponentSettings(componentId: string, instanceId: string) {
  const internalUserId = await getInternalUserId();
  if (!internalUserId) {
    throw new Error("User not authenticated or not found in tenant DB");
  }

  try {
    const tenantDb = await getTenantDbClientUtil();
    const result = await tenantDb
      .delete(componentSettings)
      .where(
        and(
          eq(componentSettings.userId, internalUserId),
          eq(componentSettings.componentId, componentId),
          eq(componentSettings.instanceId, instanceId)
        )
      )
      .returning();
    return result[0];
  } catch (error) {
    console.error("Error deleting component settings:", error);
    throw new Error("Failed to delete component settings");
  }
}
```

**5. Query Function Modifications**

Your query functions (e.g., `getLitigationCasesCount`, `getCases`) will need to be modified to accept a `filter` object as an argument.  They will then use this filter to construct the appropriate Drizzle query.

```typescript:packages/database/src/tenant-app/queries/cases-queries.ts
// packages/database/src/tenant-app/queries/cases-queries.ts
import { cases, Case, CaseInsert, combinedSchema } from '../schema';
import { eq, and, sql, type SQLWrapper } from 'drizzle-orm';
import type { NeonDatabase } from 'drizzle-orm/neon-serverless';
import type { DrizzleClient } from '../tenant-connection-db'; // Type only import
import { count } from 'drizzle-orm';

/**
 * Retrieves a count of litigation cases based on provided filters.
 * @param tenantDb - The database client for the tenant.
 * @param filter - An object specifying the filter criteria.
 * @returns The number of litigation cases matching the filter.
 */
export async function getLitigationCasesCount(
  tenantDb: NeonDatabase<typeof combinedSchema>,
  filter: { type: string; status?: string; userId?: number } = { type: "all" }
): Promise<number> {
  const whereClause = buildCasesWhereClause(filter);
  const result = await tenantDb
    .select({ value: count() })
    .from(cases)
    .where(and(eq(cases.type, 'litigation'), whereClause)) // Always filter by litigation type
    .execute();

  return result[0]?.value ?? 0;
}

/**
 * Retrieves advisory cases based on provided filters.
 * @param tenantDb - The database client for the tenant.
 * @param filter - An object specifying the filter criteria.
 * @returns An array of advisory cases matching the filter.
 */
export async function getAdvisoryCases(
    tenantDb: NeonDatabase<typeof combinedSchema>,
    filter: { type: string; status?: string; userId?: number } = { type: "all" }
): Promise<Case[]> {
    const whereClause = buildCasesWhereClause(filter);
    return tenantDb.select()
        .from(cases)
        .where(and(eq(cases.type, 'advisory'), whereClause)) // Always filter by advisory type
        .execute();
}

/**
 * Retrieves a count of advisory cases based on provided filters.
 * @param tenantDb - The database client for the tenant.
 * @param filter - An object specifying the filter criteria.
 * @returns The number of advisory cases matching the filter.
 */
export async function getAdvisoryCasesCount(
    tenantDb: NeonDatabase<typeof combinedSchema>,
    filter: { type: string; status?: string; userId?: number } = { type: "all" }
): Promise<number> {
    const whereClause = buildCasesWhereClause(filter);
    const result = await tenantDb.select({ value: count() })
        .from(cases)
        .where(and(eq(cases.type, 'advisory'), whereClause)) // Always filter by advisory type
        .execute();
    return result[0]?.value ?? 0;
}

/**
 * Builds a WHERE clause for cases queries based on the provided filter.
 * @param filter - An object specifying the filter criteria.
 * @returns A Drizzle SQL WHERE clause.
 */
function buildCasesWhereClause(filter: { type: string; status?: string; userId?: number }): SQLWrapper {
    const conditions: (SQLWrapper | undefined)[] = [];

    switch (filter.type) {
        case "all":
            // No additional conditions needed
            break;
        case "assignedToMe":
            if (filter.userId) {
                conditions.push(eq(cases.leadAttorneyId, filter.userId));
            }
            break;
        case "status":
            if (filter.status) {
                conditions.push(eq(cases.status, filter.status));
            }
            break;
        // Add other filter types as needed
        default:
            break;
    }

    return and(...conditions.filter(c => c !== undefined)) as SQLWrapper;
}

/**
 * Retrieves all cases for a given user.
 * @param tenantDb - The database client.
 * @param userId - The ID of the user.
 * @returns An array of cases.
 */
export async function getAllCases(tenantDb: DrizzleClient, userId: string): Promise<Case[]> {
  return tenantDb.select().from(cases).where(eq(cases.leadAttorneyId, userId)).execute();
}

/**
 * Creates a new case.
 * @param tenantDb - The database client.
 * @param newCase - The data for the new case.
 * @returns The newly created case.
 */
export async function createCase(tenantDb: DrizzleClient, newCase: CaseInsert): Promise<Case> {
  const result = await tenantDb.insert(cases).values(newCase).returning().execute();
  return result[0];
}

/**
 * Updates an existing case.
 * @param tenantDb - The database client.
 * @param caseId - The ID of the case to update.
 * @param updatedCase - The updated data for the case.
 * @returns The updated case.
 */
export async function updateCase(tenantDb: DrizzleClient, caseId: string, updatedCase: Partial<Case>): Promise<Case> {
  const result = await tenantDb.update(cases).set(updatedCase).where(eq(cases.id, caseId)).returning().execute();
  return result[0];
}

/**
 * Deletes a case.
 * @param tenantDb - The database client.
 * @param caseId - The ID of the case to delete.
 * @returns The deleted case.
 */
export async function deleteCase(tenantDb: DrizzleClient, caseId: string): Promise<Case> {
  const result = await tenantDb.delete(cases).where(eq(cases.id, caseId)).returning().execute();
  return result[0];
}
```

Key changes in the query functions:

*   **`filter` Argument:**  Each relevant query function now accepts a `filter` object.
*   **`buildCasesWhereClause` Function:** This helper function takes the `filter` object and constructs the appropriate Drizzle `WHERE` clause.  This keeps the query logic clean and organized.
*   **Filter Types:** The `switch` statement in `buildCasesWhereClause` handles different filter types ("all", "assignedToMe", "status").  You'll extend this as you add more filter options.
*   **Type Safety:** The `filter` object has a type definition (`{ type: string; status?: string; userId?: number }`) to help ensure type safety.

**6. Component Modifications**

The components (e.g., `LitigationCasesKPI`, `AdvisoryCasesKPI`) will need to:

1.  **Receive `instanceId` as a prop.**
2.  **Call `getComponentSettings`** to retrieve their settings.
3.  **Call the appropriate Server Action (e.g., `getLitigationCasesKPI`)**, passing the retrieved filter.
4.  **Render based on the data returned by the Server Action.**

```typescript:apps/app/app/(authenticated)/components/dashboard/litigation-cases-kpi.tsx
// apps/app/app/(authenticated)/components/dashboard/litigation-cases-kpi.tsx
import { Gavel } from 'lucide-react';
import { BaseKPI } from '../shared/base-kpi';
import { getLitigationCasesKPI } from '@/app/actions/cases/cases-actions';
import { getComponentSettings } from '@/app/actions/component-settings-actions';

interface LitigationCasesKPIProps {
  instanceId: string;
}

const LitigationCasesKPI = async ({ instanceId }: LitigationCasesKPIProps) => {
  // Get component settings
  const settings = await getComponentSettings('litigation-cases-kpi', instanceId);
  const filter = settings?.settings?.filter || { type: 'all' }; // Default to all

  const { data, status, message } = await getLitigationCasesKPI(filter);
  const totalCases = data?.count ?? 0;
  const error = status === 'error' ? message : undefined;

  return (
    <BaseKPI
      title="Litigation Cases"
      icon={Gavel}
      value={totalCases}
      isLoading={status !== 'error' && !data}
      error={error}
    />
  );
};

export default LitigationCasesKPI;
```

```typescript:apps/app/app/(authenticated)/components/dashboard/advisory-cases-kpi.tsx
// apps/app/app/(authenticated)/components/dashboard/advisory-cases-kpi.tsx
import { BookOpen } from 'lucide-react'; // Example icon
import { BaseKPI } from '../shared/base-kpi';
import { getAdvisoryCasesKPI } from '@/app/actions/cases/cases-actions';
import { getComponentSettings } from '@/app/actions/component-settings-actions';

interface AdvisoryCasesKPIProps {
    instanceId: string;
}

const AdvisoryCasesKPI = async ({instanceId}: AdvisoryCasesKPIProps) => {
    // Get component settings
    const settings = await getComponentSettings('advisory-cases-kpi', instanceId);
    const filter = settings?.settings?.filter || { type: 'all' }; // Default to "all"

    const { data, status, message } = await getAdvisoryCasesKPI(filter);
    const totalCases = data?.count ?? 0;
    const error = status === 'error' ? message : undefined;

    return (
        <BaseKPI
            title="Advisory Cases"
            icon={BookOpen}
            value={totalCases}
            isLoading={status !== 'error' && !data}
            error={error}
        />
    );
};

export default AdvisoryCasesKPI;
```

```typescript:apps/app/app/actions/cases/cases-actions.ts
'use server';

// apps/app/app/(authenticated)/dashboard/actions.ts
import { getTenantDbClientUtil } from '@/app/utils/tenant-db';
import { getAdvisoryCasesCount, getLitigationCasesCount } from '@repo/database/src/tenant-app/queries/cases-queries';
import { revalidatePath } from 'next/cache';
import { auth } from "@repo/auth/server";
import { eq } from "drizzle-orm";
import { cases } from '@repo/database/src/tenant-app/schema';
import { getInternalUserId } from '../users/user-actions'; // Import the new action

export async function getLitigationCasesKPI(filter: { type: string; status?: string; userId?: number } = { type: 'all' }) {
  try {
    const tenantDb = await getTenantDbClientUtil(); // Get tenantDb inside the action
    // Pass filter to the query function
    const count = await getLitigationCasesCount(tenantDb, filter);
    return {
      status: 'success',
      message: 'Litigation cases count retrieved',
      data: { count }
    };
  } catch (error) {
    console.error('Error in getLitigationCasesKPI:', error);
    return {
      status: 'error',
      message: 'Failed to get litigation cases count'
    };
  }
}

export async function getAdvisoryCasesKPI(filter: { type: string; status?: string; userId?: number } = { type: 'all' }) { // Action now accepts tenantDb
    try {
      const tenantDb = await getTenantDbClientUtil(); // Get tenantDb inside the action
        // Pass filter to the query function
      const count = await getAdvisoryCasesCount(tenantDb, filter); // Pass tenantDb to query
      return {
        status: 'success',
        data: { count },
        message: 'Advisory cases count retrieved successfully',
      };
    } catch (error) {
      console.error('Error in getAdvisoryCasesKPI:', error);
      return {
        status: 'error',
        message: 'Failed to get advisory cases count',
      };
    }
  }

// Example: Create a new case
export async function createCase(formData: FormData) {
    const internalUserId = await getInternalUserId(); // Get internal user ID
    if (!internalUserId) {
        throw new Error("User not authenticated or not found in tenant DB");
    }

    const title = formData.get("title")?.toString();
    const description = formData.get("description")?.toString();

    if (!title || !description) {
        throw new Error("Title and description are required");
    }


  try {
    const tenantDb = await getTenantDbClientUtil();

    const newCase = await tenantDb
      .insert(cases)
      .values({

        title: title,
        description: description,
        type: 'advisory',
        status: 'pending',
        riskLevel: 'low',
        startDate: new Date(),
        endDate: new Date(),
        userId: internalUserId, // Use the internal user ID
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
      revalidatePath("/");

    return newCase[0];
  } catch (error) {
    console.error("Error creating case:", error);
    return null; // Or throw an error
  }
}

// Example: Update a case
export async function updateCase(caseId: number, formData: FormData) {
  const internalUserId = await getInternalUserId(); // Get internal user ID.
  if (!internalUserId) {
      throw new Error("User not authenticated or not found in tenant DB");
  }

  const title = formData.get("title")?.toString();
  const description = formData.get("description")?.toString();

  if (!title || !description) {
      throw new Error("Title and description are required");
  }

  try {
    const tenantDb = await getTenantDbClientUtil();

    const updatedCase = await tenantDb
      .update(cases)
      .set({
        title,
        description,
        userId: internalUserId, // Use the internal user ID
        updatedAt: new Date(),
      })
      .where(eq(cases.id, caseId.toString()))
      .returning();
      revalidatePath("/");

    return updatedCase[0];
  } catch (error) {
    console.error("Error updating case:", error);
    return null; // Or throw an error
  }
}

// Example: Delete a case
export async function deleteCase(caseId: number) {
    const internalUserId = await getInternalUserId(); // Get internal user ID
    if (!internalUserId) {
        throw new Error("User not authenticated or not found in tenant DB");
    }

    try {
        const tenantDb = await getTenantDbClientUtil();

        // TODO: Consider authorization checks here, e.g., is this user allowed to delete this case?

        const deletedCase = await tenantDb.delete(cases).where(eq(cases.id, caseId.toString())).returning();
        revalidatePath("/");
        return deletedCase[0];

    } catch (error) {
        console.error("Error deleting case:", error);
        return null; // Or throw an error
    }
}
```

```typescript:apps/app/app/(authenticated)/components/dashboard/dashboard-grid.tsx
"use client";

import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState, useEffect } from "react";
import { updateKPIOrder } from "@/app/actions/kpi-actions"; // Import the Server Action
import LitigationCasesKPI from "./litigation-cases-kpi"; // Import the KPI components
import AdvisoryCasesKPI from "./advisory-cases-kpi";
import { setComponentSettings, getAllComponentSettings, deleteComponentSettings } from "@/app/actions/component-settings-actions";
import { v4 as uuidv4 } from 'uuid';

type KPI = {
  id: string;
  component: string;
  title: string;
  order: number;
};

type Props = {
  kpis: KPI[];
};

const SortableKPI = ({ kpi }: { kpi: KPI }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: kpi.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

    // Add an instanceId prop
    const [instanceId, setInstanceId] = useState<string>("");

    // Generate a unique instance ID when the component mounts
    useEffect(() => {
        setInstanceId(uuidv4());
    }, []);

  const renderKPIComponent = () => {
    switch (kpi.component) {
      case "LitigationCasesKPI":
        return <LitigationCasesKPI instanceId={instanceId}/>; // Pass instanceId
      case "AdvisoryCasesKPI":
        return <AdvisoryCasesKPI instanceId={instanceId}/>; // Pass instanceId
      // Add other cases for other KPIs
      default:
        return null; // Or a default component/error message
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="cursor-grab"
    >
      {renderKPIComponent()}
    </div>
  );
};

const DashboardGrid = ({ kpis: initialKPIs }: Props) => {
  const [kpis, setKPIs] = useState(initialKPIs);
  const [activeId, setActiveId] = useState<string | null>(null);
    const [dbLoaded, setDbLoaded] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require movement of 8px before dragging starts
      },
    })
  );

    useEffect(() => {
        const initializeDashboard = async () => {
            const allSettings = await getAllComponentSettings();

            // Initialize component settings if not already present
            for (const kpi of initialKPIs) {
                const existingSetting = allSettings.find(
                    (setting) => setting.componentId === kpi.id
                );
                if (!existingSetting) {
                    // Generate a unique instance ID for each KPI
                    const instanceId = uuidv4();
                    await setComponentSettings(kpi.id, instanceId, { filter: { type: 'all' } }, kpi.order);
                }
            }
            setDbLoaded(true);
        };

        initializeDashboard();
    }, [initialKPIs]);

    //keep dashboard in sync.
    useEffect(() => {
        if(!dbLoaded) return;

        const syncDashboard = async () => {
            const allSettings = await getAllComponentSettings();
            const sortedKPIs = allSettings.sort((a, b) => a.order - b.order)
            .map(setting => {
                const kpiData = initialKPIs.find(kpi => kpi.id === setting.componentId);
                return {
                    id: setting.componentId,
                    component: setting.componentId === 'litigation-cases' ? 'LitigationCasesKPI': 'AdvisoryCasesKPI',
                    title: kpiData ? kpiData.title : 'Unknown KPI',
                    order: setting.order
                }
            });
            setKPIs(sortedKPIs);
        }

        syncDashboard();

    }, [dbLoaded, initialKPIs]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id.toString());
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setKPIs((kpis) => {
        const oldIndex = kpis.findIndex((kpi) => kpi.id === active.id);
        const newIndex = kpis.findIndex((kpi) => kpi.id === over?.id);
        return arrayMove(kpis, oldIndex, newIndex);
      });
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      // Update local state (already done in handleDragOver)
        const newOrder = kpis.map((kpi, index) => ({
            kpiId: kpi.id,
            order: index,
        }));

        // Find the settings for the active KPI and update its order
        const activeComponent = kpis.find(kpi => kpi.id === active.id);

        if (activeComponent) {
            const allSettings = await getAllComponentSettings();
            const activeSetting = allSettings.find(setting => setting.componentId === activeComponent.id);

            if (activeSetting) {
                await setComponentSettings(activeSetting.componentId, activeSetting.instanceId, activeSetting.settings, newOrder.find(item => item.kpiId === active.id)?.order || 0);
            }
        }
    }
    setActiveId(null);
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={kpis.map((kpi) => kpi.id)}
        strategy={sortableKeyboardCoordinates}
      >
        <div className="grid auto-rows-min gap-4 md:grid-cols-3">
          {kpis.map((kpi) => (
            <SortableKPI key={kpi.id} kpi={kpi} />
          ))}
        </div>
      </SortableContext>
      <DragOverlay>
        {activeId ? (
          <div className="bg-white p-4 rounded-md shadow-lg">
            {kpis.find(kpi=> kpi.id === activeId)?.title}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default DashboardGrid;
```

**7.  DashboardGrid and `instanceId`**

The `DashboardGrid` component is responsible for:

*   Generating a unique `instanceId` for each KPI component when it's first added to the grid.  We use the `uuid` library for this.
*   Passing the `instanceId` down to each KPI component (e.g., `LitigationCasesKPI`).
*   When the drag-and-drop order changes, it calls `setComponentSettings` to update *both* the `order` *and* potentially other settings (if you add a UI for configuring filters directly within the grid).
*   Loading all component settings on the initial load, and using this to determine the initial order and which components to display.

**8.  Putting It All Together (Flow)**

1.  **User visits the dashboard (`page.tsx`).**
2.  **`page.tsx` fetches the user's organization ID.**
3.  **`page.tsx` renders `DashboardGrid`, passing an array of *possible* KPIs.**
4.  **`DashboardGrid` fetches *all* component settings for the user (using `getAllComponentSettings`).**
5.  **`DashboardGrid` uses the fetched settings to determine which KPI components to render and in what order.**
6.  **For *each* KPI component:**
    *   A unique `instanceId` is generated (if it's a new component).
    *   The KPI component is rendered, receiving the `instanceId` as a prop.
    *   The KPI component calls `getComponentSettings` (using its `componentId` and `instanceId`) to get its settings.
    *   The KPI component calls the appropriate Server Action (e.g., `getLitigationCasesKPI`), passing the `filter` from its settings.
    *   The Server Action calls the query function (e.g., `getLitigationCasesCount`), passing the filter.
    *   The query function builds the Drizzle query with the appropriate `WHERE` clause.
    *   The data is

---

_**User**_

ok lets do the following for now lets focus on the dashboard order, we will set the settings part aside for the moment. 

here are the updated schemas @component-settings-schema.ts @kpi-order-schema.ts 

what do we need to modify in the @kpi-actions.ts in the @page.tsx and in the @dashboard-grid.tsx 

another fundamental doubt i have is how are we getting the actual user id @users-schema.ts remmeber we have an interal id and the clerk id in the schema. and we have our @sign-in.mdx flow to dtermine the user database

---

_**Assistant**_

Okay, let's focus on implementing the dashboard component ordering, and I'll also clarify the user ID handling.

**1. User ID Handling (Clarification)**

*   **Clerk Authentication (`@sign-in.mdx` flow):** When a user signs in with Clerk, you get a `userId` from Clerk. This is the *external* ID (Clerk's ID).
*   **`getInternalUserId` (Server Action):** This function, in `apps/app/app/actions/users/user-actions.ts`, is *crucial*. It takes the Clerk `userId` (obtained via `auth()`) and queries the *tenant's* `users` table to find the corresponding *internal* `id`.  This internal `id` is what you use for all relationships within the tenant database. The code snippet you provided is correct:

    ```typescript:apps/app/app/actions/users/user-actions.ts
    "use server"

    import { getTenantDbClientUtil } from "@/app/utils/tenant-db";
    import { users } from "@repo/database/src/tenant-app/schema"; // Import tenant's users schema
    import { auth } from "@repo/auth/server";
    import { eq } from "drizzle-orm";

    export async function getInternalUserId(): Promise<number | null> {
      const { userId } = await auth();
      if (!userId) {
        return null; // Or throw an error, depending on your needs
      }

      try {
        const tenantDb = await getTenantDbClientUtil();
        const user = await tenantDb.query.users.findFirst({
          where: eq(users.externalId, userId), // Use externalId (Clerk ID)
          columns: { id: true }, // Only select the internal id
        });

        return user?.id ?? null;
      } catch (error) {
        console.error("Error getting internal user ID:", error);
        return null; // Or throw an error
      }
    }
    ```
    **Important:** The `users` table in your *tenant* database schema should have an `externalId` column (to store the Clerk ID) and an `id` column (auto-incrementing internal ID).  The provided code snippet uses `eq(users.externalId, userId)`.  Make sure your schema reflects this. I noticed in a previous response, I used `clerkId` in the `where` clause. I have corrected it here to use `externalId`.

* **Organization ID:** We are using the `getTenantOrganizationId` to get the organization id, this id is used to store the order of the kpis.

**2. Schema Files (Provided - For Reference)**

You mentioned updated schemas. I'll assume these are correct based on our previous discussion.  Just to be absolutely clear, here are the schemas we're working with:

```typescript:packages/database/src/tenant-app/schema/main/component-settings-schema.ts
// packages/database/src/tenant-app/schema/main/component-settings-schema.ts
import {
  pgTable,
  text,
  timestamp,
  uuid,
  primaryKey,
  jsonb,
  integer,
} from 'drizzle-orm/pg-core';
import { users } from './users-schema';
import { relations } from 'drizzle-orm';

export const componentSettings = pgTable('component_settings', {
  id: uuid('id').primaryKey().defaultRandom(), // Unique ID for each setting instance
  userId: integer('user_id').notNull().references(() => users.id), // Link to the user
  componentId: text('component_id').notNull(), // e.g., 'litigation-cases-kpi', 'cases-table'
  instanceId: text('instance_id').notNull(), // Unique ID for *this instance* of the component (allows multiple instances)
  settings: jsonb('settings').notNull().$type<any>(), // Flexible JSON to store settings
  order: integer('order').notNull().default(0), //for dashboard grid.
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return {
    pk: primaryKey(table.userId, table.componentId, table.instanceId), // Composite primary key
  };
});

export const componentSettingsRelations = relations(componentSettings, ({ one }) => ({
	user: one(users, {
		fields: [componentSettings.userId],
		references: [users.id],
	}),
}));

// Types (optional, but recommended)
export type ComponentSetting = typeof componentSettings.$inferSelect;
export type NewComponentSetting = typeof componentSettings.$inferInsert;
```

```typescript:packages/database/src/main-app/schema/kpi-order-schema.ts
// packages/database/src/main-app/schema/kpi-order-schema.ts
import {
  pgTable,
  text,
  timestamp,
  uuid,
  primaryKey,
  integer,
} from 'drizzle-orm/pg-core';
import {organizations} from './organizations-schema';

export const kpiOrder = pgTable('kpi_order', {
  // organizationId: text('organization_id').notNull(), // Or userId, depending on your needs
  organizationId: uuid('organization_id').notNull().references(() => organizations.id),
  kpiId: text('kpi_id').notNull(), // e.g., 'litigation-cases', 'advisory-cases'
  order: integer('order').notNull(), // The order of the KPI
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return {
    pk: primaryKey(table.organizationId, table.kpiId), // Composite primary key
  };
});

// Types (optional, but recommended)
export type KPIOrder = typeof kpiOrder.$inferSelect;
export type NewKPIOrder = typeof kpiOrder.$inferInsert;
```

```typescript:packages/database/src/main-app/schema/organizations-schema.ts
// packages/database/src/main-app/schema/organizations-schema.ts
import { relations } from 'drizzle-orm';
import {
  boolean,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { organizationMembers } from './organizations-members-schema';
import { projects } from './projects-schema';
import { kpiOrder } from './kpi-order-schema';

export const organizations = pgTable('organizations', {
  id: uuid('id').primaryKey().defaultRandom(),
  clerkId: text('clerk_id').unique(),
  name: text('name'),
  slug: text('slug').unique(),
  subdomainSlug: text('subdomain_slug').unique(),
  logoUrl: text('logo_url'),
  hasProject: boolean('has_project').default(false).notNull(),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  createdBy: uuid('created_by'),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const organizationsRelations = relations(organizations, ({ many }) => ({
  members: many(organizationMembers),
  projects: many(projects),
  kpiOrder: many(kpiOrder),
}));

// Types
export type Organization = typeof organizations.$inferSelect;
export type NewOrganization = typeof organizations.$inferInsert;

export const organizationInsertSchema = createInsertSchema(organizations);
export const organizationSelectSchema = createSelectSchema(organizations);
```

**3. Code Modifications**

*   **`kpi-actions.ts` (Server Actions):**

```typescript:apps/app/app/actions/kpi-actions.ts
"use server";

import { db } from "@repo/database/src/db";
import { kpiOrder } from "@repo/database/src/main-app/schema/kpi-order-schema";
import { auth } from "@repo/auth/server";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getTenantOrganizationId } from "./organizations-actions";

// Fetch KPI order for an organization
export async function getKPIOrder(organizationId: string) {
  try {
    const order = await db
      .select()
      .from(kpiOrder)
      .where(eq(kpiOrder.organizationId, organizationId))
      .orderBy(kpiOrder.order)
      .execute();
    return order;
  } catch (error) {
    console.error("Error fetching KPI order:", error);
    return []; // Return an empty array on error
  }
}

// Update KPI order for an organization
export async function updateKPIOrder(newOrder: { kpiId: string; order: number }[]) {
    const organizationId = await getTenantOrganizationId();

    if(!organizationId) {
        throw new Error("Organization not found");
    }

  try {
    // Use a transaction to ensure atomicity
    await db.transaction(async (tx) => {
      // Delete existing order for the organization
      await tx.delete(kpiOrder).where(eq(kpiOrder.organizationId, organizationId));

      // Insert the new order
      if (newOrder.length) {
        const insertValues = newOrder.map(item => ({
            organizationId: organizationId,
            kpiId: item.kpiId,
            order: item.order
        }));

        await tx.insert(kpiOrder).values(insertValues);
      }
    });

    revalidatePath("/"); // Revalidate the dashboard page
  } catch (error) {
    console.error("Error updating KPI order:", error);
    throw new Error("Failed to update KPI order"); // Re-throw for better error handling
  }
}
```

*   **`page.tsx` (Server Component):**

```typescript:apps/app/app/(authenticated)/page.tsx
import { env } from '@/env';
import { auth } from '@repo/auth/server';
import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { notFound } from 'next/navigation';
import { AvatarStack } from './components/avatar-stack';
import { Cursors } from './components/cursors';
import { Header } from './components/header';
// import LitigationCasesKPI from './components/dashboard/litigation-cases-kpi'; // No longer directly imported
// import AdvisoryCasesKPI from './components/dashboard/advisory-cases-kpi'; // No longer directly imported
import DashboardGrid from './components/dashboard/dashboard-grid'; // Import the new component
import { getKPIOrder } from '@/app/actions/kpi-actions';
import { getTenantOrganizationId } from '@/app/actions/organizations-actions';

const title = 'Acme Inc';
const description = 'My application.';

const CollaborationProvider = dynamic(() =>
  import('./components/collaboration-provider').then(
    (mod) => mod.CollaborationProvider
  )
);

export const metadata: Metadata = {
  title,
  description,
};

const App = async () => {
  const { orgId, userId } = await auth(); // Get Clerk user ID

  if (!orgId) {
    notFound();
  }

  const organizationId = await getTenantOrganizationId();

  if(!organizationId) {
    notFound();
  }

  // Fetch initial KPI order
  const initialKPIOrder = await getKPIOrder(organizationId);

  // Define KPI data (including IDs and initial order)
  const kpis = [
    { id: 'litigation-cases', component: 'LitigationCasesKPI', title: 'Litigation Cases' },
    { id: 'advisory-cases', component: 'AdvisoryCasesKPI', title: 'Advisory Cases' },
    // Add other KPIs here
  ];

    // Combine initial order from the database with the KPI data
    const orderedKPIs = kpis.map(kpi => {
        const orderEntry = initialKPIOrder.find(entry => entry.kpiId === kpi.id);
        return {
            ...kpi,
            order: orderEntry ? orderEntry.order : Infinity, // Default to end if not found
        };
    }).sort((a, b) => a.order - b.order); // Sort by order


  return (
    <>
      <Header pages={['Building Your Application']} page="Data Fetching">
        {env.LIVEBLOCKS_SECRET && (
          <CollaborationProvider orgId={orgId}>
            <AvatarStack />
            <Cursors />
          </CollaborationProvider>
        )}
      </Header>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        {/* Pass KPI data and initial order to DashboardGrid */}
        <DashboardGrid kpis={orderedKPIs} />
      </div>
      <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" />
    </>
  );
};

export default App;
```

*   **`dashboard-grid.tsx` (Client Component):**

```typescript:apps/app/app/(authenticated)/components/dashboard/dashboard-grid.tsx
"use client";

import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState, useEffect } from "react";
import { updateKPIOrder } from "@/app/actions/kpi-actions"; // Import the Server Action
import LitigationCasesKPI from "./litigation-cases-kpi"; // Import the KPI components
import AdvisoryCasesKPI from "./advisory-cases-kpi";
import { setComponentSettings, getAllComponentSettings, deleteComponentSettings } from "@/app/actions/component-settings-actions";
import { v4 as uuidv4 } from 'uuid';

type KPI = {
  id: string;
  component: string;
  title: string;
  order: number;
};

type Props = {
  kpis: KPI[];
};

const SortableKPI = ({ kpi }: { kpi: KPI }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: kpi.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

    // Add an instanceId prop
    const [instanceId, setInstanceId] = useState<string>("");

    // Generate a unique instance ID when the component mounts
    useEffect(() => {
        setInstanceId(uuidv4());
    }, []);

  const renderKPIComponent = () => {
    switch (kpi.component) {
      case "LitigationCasesKPI":
        return <LitigationCasesKPI instanceId={instanceId}/>; // Pass instanceId
      case "AdvisoryCasesKPI":
        return <AdvisoryCasesKPI instanceId={instanceId}/>; // Pass instanceId
      // Add other cases for other KPIs
      default:
        return null;
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="cursor-grab"
    >
      {renderKPIComponent()}
    </div>
  );
};

const DashboardGrid = ({ kpis: initialKPIs }: Props) => {
  const [kpis, setKPIs] = useState(initialKPIs);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require movement of 8px before dragging starts
      },
    })
  );

    useEffect(() => {
        setKPIs(initialKPIs);
    }, [initialKPIs]);


  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id.toString());
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setKPIs((kpis) => {
        const oldIndex = kpis.findIndex((kpi) => kpi.id === active.id);
        const newIndex = kpis.findIndex((kpi) => kpi.id === over?.id);
        return arrayMove(kpis, oldIndex, newIndex);
      });
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      // Update local state (already done in handleDragOver)

      // Persist the new order to the database
      const newOrder = kpis.map((kpi, index) => ({
        kpiId: kpi.id,
        order: index,
      }));
      await updateKPIOrder(newOrder); // Call the Server Action
    }
    setActiveId(null);
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={kpis.map((kpi) => kpi.id)}
        strategy={sortableKeyboardCoordinates}
      >
        <div className="grid auto-rows-min gap-4 md:grid-cols-3">
          {kpis.map((kpi) => (
            <SortableKPI key={kpi.id} kpi={kpi} />
          ))}
        </div>
      </SortableContext>
      <DragOverlay>
        {activeId ? (
          <div className="bg-white p-4 rounded-md shadow-lg">
            {/* You might want to render a preview of the active KPI here */}
            {kpis.find(kpi=> kpi.id === activeId)?.title}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default DashboardGrid;
```

**Key Changes and Explanations:**
* **DashboardGrid:**
    *   The `useEffect` with `setKPIs(initialKPIs)` is added. This ensures that if the `initialKPIs` prop changes (e.g., due to a revalidation after saving the order), the local state is updated.  This prevents a situation where the UI doesn't reflect the saved order.
    * We no longer need to call `getAllComponentSettings` or `setComponentSettings` within `handleDragEnd`. We are now solely updating the `kpi_order` table in the main database. The `updateKPIOrder` Server Action handles this.
    * The KPI components (`LitigationCasesKPI`, `AdvisoryCasesKPI`) still receive an `instanceId`, but this is now *only* used for the component settings (which we're not focusing on right now). It's good to keep this in place for when you re-implement the settings functionality.
* **page.tsx:**
    *   Fetches the `initialKPIOrder` using the `getKPIOrder` Server Action and the `organizationId`.
    *   Combines the `initialKPIOrder` with the `kpis` array to create `orderedKPIs`. This ensures the correct initial order.  If an entry isn't found in `initialKPIOrder`, it defaults to `Infinity`, placing it at the end.
    *   Passes `orderedKPIs` to `DashboardGrid`.
* **kpi-actions.ts:**
    *   `getKPIOrder` fetches the order from the `kpi_order` table, using the `organizationId`.
    *   `updateKPIOrder` now correctly updates the `kpi_order` table:
        *   It uses a transaction for atomicity.
        *   It deletes the *existing* order for the organization.
        *   It inserts the *new* order.
        *   It revalidates the dashboard page.

This revised setup focuses *exclusively* on the drag-and-drop ordering, storing the order in the `kpi_order` table in the *main* application database. It correctly handles the internal user ID and organization ID, and it ensures that the UI reflects the saved order after dragging. The component settings functionality is temporarily removed but the structure (instance IDs) is kept for future re-implementation.


---

_**User**_

ok theres a fundamental error you are making, you are assuming we make relationships through organization and thats not the case, each tenant has its own database so we have to access it through the users id not the organization

---

_**Assistant**_

You are absolutely correct! My apologies, I got caught up in the previous organization-based logic and missed the core tenant-specific nature of the KPI ordering. We need to store and retrieve the KPI order within the *tenant* database, linked to the *user*, not the organization in the main database.

Here's the corrected approach and code modifications:

**1. Corrected Concept**

*   **KPI Order Storage:** The `kpi_order` table should reside in the *tenant* database, not the main application database.
*   **User-Based Ordering:** The order should be associated with the *internal* user ID within the tenant database.
*   **No Organization Relationship:** We *don't* need to involve the `organizations` table in the main database for this functionality.

**2. Schema Changes (Tenant Database)**

We'll create (or modify) the `kpi_order` table within the *tenant* database schema.

````typescript:packages/database/src/tenant-app/schema/main/kpi-order-schema.ts
import { pgSchema, text, timestamp, uuid, primaryKey, integer } from 'drizzle-orm/pg-core';
import { users } from './users-schema';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

export const mainSchema = pgSchema('main')

export const kpiOrder = mainSchema.table('kpi_order', {
  userId: uuid('user_id').notNull().references(() => users.id),
  kpiId: text('kpi_id').notNull(), // e.g., 'litigation-cases', 'advisory-cases'
  order: integer('order').notNull(), // The order of the KPI
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return {
    pk: primaryKey(table.userId, table.kpiId), // Composite primary key
  };
});

export type KPIOrder = typeof kpiOrder.$inferSelect;
export type NewKPIOrder = typeof kpiOrder.$inferInsert; 

export const kpiOrderInsertSchema = createInsertSchema(kpiOrder)
export const kpiOrderSelectSchema = createSelectSchema(kpiOrder)

````

Key changes:

*   **`userId`:**  This now correctly references the `users.id` column *within the tenant database*.  This is the *internal* user ID.
* **Schema:** The schema is now in the tenant-app.

**3. Server Actions (Corrected)**

The Server Actions now operate on the *tenant* database and use the internal user ID.

````typescript:apps/app/app/actions/components/kpi-actions.ts
"use server";

import { getTenantDbClientUtil } from "@/app/utils/tenant-db";
import { kpiOrder } from "@repo/database/src/tenant-app/schema/main/kpi-order-schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getInternalUserId } from "../users/user-actions";

// Fetch KPI order for an organization
export async function getKPIOrder() {
  const userId = await getInternalUserId();

  if(!userId) {
      throw new Error("User not found");
  }

  try {
    const tenantDb = await getTenantDbClientUtil();
    const order = await tenantDb
      .select()
      .from(kpiOrder)
      .where(eq(kpiOrder.userId, userId))
      .orderBy(kpiOrder.order)
      .execute();
    return order;
  } catch (error) {
    console.error("Error fetching KPI order:", error);
    return []; // Return an empty array on error
  }
}

// Update KPI order for an organization
export async function updateKPIOrder(newOrder: { kpiId: string; order: number }[]) {
    const userId = await getInternalUserId();

    if(!userId) {
        throw new Error("User not found");
    }

  try {
    const tenantDb = await getTenantDbClientUtil();
    // Use a transaction to ensure atomicity
    await tenantDb.transaction(async (tx) => {
      // Delete existing order for the organization
      await tx.delete(kpiOrder).where(eq(kpiOrder.userId, userId as any));

      // Insert the new order
      if (newOrder.length) {
        const insertValues = newOrder.map(item => ({
            userId: userId,
            kpiId: item.kpiId,
            order: item.order
        }));

        await tx.insert(kpiOrder).values(insertValues as any);
      }
    });

    revalidatePath("/"); // Revalidate the dashboard page
  } catch (error) {
    console.error("Error updating KPI order:", error);
    throw new Error("Failed to update KPI order"); // Re-throw for better error handling
  }
}
````

Key changes:

*   **`getInternalUserId`:**  Both `getKPIOrder` and `updateKPIOrder` now correctly use `getInternalUserId` to get the user's internal ID within the tenant.
*   **`getTenantDbClientUtil`:** They use `getTenantDbClientUtil` to get the correct *tenant* database client.
*   **`kpiOrder` (Tenant Schema):** They now correctly use the `kpiOrder` table from the *tenant* database schema.
* **Removed Organization:** Removed the organization id.

**4. `page.tsx` (Corrected)**

````typescript:apps/app/app/(authenticated)/page.tsx
import { env } from '@/env';
import { auth } from '@repo/auth/server';
import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { notFound } from 'next/navigation';
import { AvatarStack } from './components/avatar-stack';
import { Cursors } from './components/cursors';
import { Header } from './components/header';
// import LitigationCasesKPI from './components/dashboard/litigation-cases-kpi'; // No longer directly imported
// import AdvisoryCasesKPI from './components/dashboard/advisory-cases-kpi'; // No longer directly imported
import DashboardGrid from './components/dashboard/dashboard-grid'; // Import the new component
import { getKPIOrder } from '@/app/actions/components/kpi-actions';
import { getTenantOrganizationId } from '@/app/actions/organizations-actions';

const title = 'Acme Inc';
const description = 'My application.';

const CollaborationProvider = dynamic(() =>
  import('./components/collaboration-provider').then(
    (mod) => mod.CollaborationProvider
  )
);

export const metadata: Metadata = {
  title,
  description,
};

const App = async () => {
  const { orgId, userId } = await auth(); // Get Clerk user ID

  if (!orgId) {
    notFound();
  }

  // Fetch initial KPI order
  const initialKPIOrder = await getKPIOrder();

  // Define KPI data (including IDs and initial order)
  const kpis = [
    { id: 'litigation-cases', component: 'LitigationCasesKPI', title: 'Litigation Cases' },
    { id: 'advisory-cases', component: 'AdvisoryCasesKPI', title: 'Advisory Cases' },
    // Add other KPIs here
  ];

    // Combine initial order from the database with the KPI data
    const orderedKPIs = kpis.map(kpi => {
        const orderEntry = initialKPIOrder.find(entry => entry.kpiId === kpi.id);
        return {
            ...kpi,
            order: orderEntry ? orderEntry.order : Infinity, // Default to end if not found
        };
    }).sort((a, b) => a.order - b.order); // Sort by order


  return (
    <>
      <Header pages={['Building Your Application']} page="Data Fetching">
        {env.LIVEBLOCKS_SECRET && (
          <CollaborationProvider orgId={orgId}>
            <AvatarStack />
            <Cursors />
          </CollaborationProvider>
        )}
      </Header>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        {/* Pass KPI data and initial order to DashboardGrid */}
        <DashboardGrid kpis={orderedKPIs} />
      </div>
      <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" />
    </>
  );
};

export default App;
````

Key changes:

* **Removed Organization:** Removed the organization id.
*   **`getKPIOrder()`:**  Calls `getKPIOrder` *without* any arguments, as it now uses `getInternalUserId` internally.

**5. `dashboard-grid.tsx` (No Changes)**

The `dashboard-grid.tsx` component *doesn't need any changes*. It continues to:

*   Receive the initial KPI order as a prop.
*   Manage the local state of the order.
*   Call the `updateKPIOrder` Server Action when the order changes.

**Summary of Corrections**

The critical correction was to move the `kpi_order` table to the *tenant* database and associate the order with the *internal* user ID. The Server Actions were updated to use `getInternalUserId` and `getTenantDbClientUtil` to interact with the correct database and user. The `page.tsx` component was simplified to remove the unnecessary organization ID lookup for this specific feature. The `dashboard-grid.tsx` remains unchanged, as it correctly handles the local state and calls the Server Action.


---

_**User**_

For the code present, we get this error:
```
No overload matches this call.
  Overload 1 of 3, '(left: PgColumn<{ name: "user_id"; tableName: "kpi_order"; dataType: "string"; columnType: "PgUUID"; data: string; driverParam: string; notNull: true; hasDefault: false; isPrimaryKey: false; isAutoincrement: false; ... 4 more ...; generated: undefined; }, {}, {}>, right: string | SQLWrapper): SQL<...>', gave the following error.
    Argument of type 'number' is not assignable to parameter of type 'string | SQLWrapper'.
  Overload 2 of 3, '(left: Aliased<number>, right: number | SQLWrapper): SQL<unknown>', gave the following error.
    Argument of type 'PgColumn<{ name: "user_id"; tableName: "kpi_order"; dataType: "string"; columnType: "PgUUID"; data: string; driverParam: string; notNull: true; hasDefault: false; isPrimaryKey: false; isAutoincrement: false; ... 4 more ...; generated: undefined; }, {}, {}>' is not assignable to parameter of type 'Aliased<number>'.
      Type 'PgColumn<{ name: "user_id"; tableName: "kpi_order"; dataType: "string"; columnType: "PgUUID"; data: string; driverParam: string; notNull: true; hasDefault: false; isPrimaryKey: false; isAutoincrement: false; ... 4 more ...; generated: undefined; }, {}, {}>' is missing the following properties from type 'Aliased<number>': sql, fieldAlias
  Overload 3 of 3, '(left: never, right: unknown): SQL<unknown>', gave the following error.
    Argument of type 'PgColumn<{ name: "user_id"; tableName: "kpi_order"; dataType: "string"; columnType: "PgUUID"; data: string; driverParam: string; notNull: true; hasDefault: false; isPrimaryKey: false; isAutoincrement: false; ... 4 more ...; generated: undefined; }, {}, {}>' is not assignable to parameter of type 'never'.
```
How can I resolve this? If you propose a fix, please make it concise.

---

_**Assistant**_

```typescript:apps/app/app/actions/users/user-actions.ts
export async function getInternalUserId(): Promise<string | null> { // Changed to string
  const { userId } = await auth();
  if (!userId) {
    return null;
  }

  try {
    const tenantDb = await getTenantDbClientUtil();
    const user = await tenantDb.query.users.findFirst({
      where: eq(users.clerkId, userId),
      columns: { id: true },
    });

    // Return the ID as a string
    return user?.id ?? null;

  } catch (error) {
    console.error("Error getting internal user ID:", error);
    return null;
  }
}
```

**Reasoning:**

The error message indicates a type mismatch.  Drizzle's `eq` function, when used with a UUID column (like your `kpi_order.userId`), expects a `string` value, not a `number`.  Your `getInternalUserId` function was returning a `number | null`.  The fix is to change the return type of `getInternalUserId` to `string | null` and to make sure you return the id as string. This aligns the types and resolves the error. The rest of your code (using `getInternalUserId` in the kpi actions, etc.) is already correct in how it uses the result, so no other changes are needed.


---

_**User**_

For the code present, we get this error:
```
Property 'users' does not exist on type '{}'.
```
How can I resolve this? If you propose a fix, please make it concise.

---

_**Assistant**_

```typescript:apps/app/app/actions/users/user-actions.ts
import { getTenantDbClientUtil } from "@/app/utils/tenant-db";
import { users } from "@repo/database/src/tenant-app/schema/main/users-schema";
import { auth } from "@repo/auth/server";
import { eq } from "drizzle-orm";
import { combinedSchema } from "@repo/database/src/tenant-app/schema";

export async function getInternalUserId(): Promise<string | null> {
  const { userId } = await auth();
  if (!userId) {
    return null;
  }

  try {
    const tenantDb = await getTenantDbClientUtil();
    const user = await tenantDb.query.main.users.findFirst({ // Access through .main
      where: eq(users.clerkId, userId),
      columns: { id: true },
    });

    return user?.id ?? null;
  } catch (error) {
    console.error("Error getting internal user ID:", error);
    return null;
  }
}
```

**Reasoning:**

The error "Property 'users' does not exist on type '{}'" arises because `tenantDb.query` doesn't directly expose the `users` table in the way you were trying to access it.  In your multi-schema setup (with `main`, `reference`, and `embeddings`), Drizzle structures the query interface differently.

The fix is to access the `users` table through the schema name (in this case, `main`) like this: `tenantDb.query.main.users`.  This correctly navigates the Drizzle query builder to the `users` table within the `main` schema of your tenant database. I also added the `combinedSchema` import, this is needed to make sure that the types are correctly inferred.


---

_**User**_

it didnt work we still have the linter

---

_**Assistant**_

```typescript:apps/app/app/actions/users/user-actions.ts
import { getTenantDbClientUtil } from "@/app/utils/tenant-db";
import { users } from "@repo/database/src/tenant-app/schema/main/users-schema";
import { auth } from "@repo/auth/server";
import { eq } from "drizzle-orm";
import { combinedSchema } from "@repo/database/src/tenant-app/schema";

export async function getInternalUserId(): Promise<string | null> {
  const { userId } = await auth();
  if (!userId) {
    return null;
  }

  try {
    const tenantDb = await getTenantDbClientUtil();
    const user = await tenantDb.query.users.findFirst({ // Remove .main
      where: eq(users.clerkId, userId),
      columns: { id: true },
    });

    return user?.id ?? null;
  } catch (error) {
    console.error("Error getting internal user ID:", error);
    return null;
  }
}
```

**Reasoning:**

I made a mistake in the previous fix. While accessing schemas through `tenantDb.query.main` is correct for multi-schema setups *within* a single database, the `combinedSchema` approach you're using in `packages/database/src/tenant-app/schema/index.ts` already merges all the schemas (main, reference, embeddings) into a single `query` object.

Therefore, you should access the `users` table directly via `tenantDb.query.users`, *not* `tenantDb.query.main.users`. The `combinedSchema` already handles the schema organization internally. The import of `combinedSchema` is correct and necessary for type inference, but the way you *use* the `tenantDb.query` object needs to be adjusted.


---

_**User**_

the linter persists 

---

_**Assistant**_

```typescript:apps/app/app/actions/users/user-actions.ts
import { getTenantDbClientUtil } from "@/app/utils/tenant-db";
import { users } from "@repo/database/src/tenant-app/schema/main/users-schema";
import { auth } from "@repo/auth/server";
import { eq } from "drizzle-orm";
// No need to import combinedSchema here

export async function getInternalUserId(): Promise<string | null> {
  const { userId } = await auth();
  if (!userId) {
    return null;
  }

  try {
    const tenantDb = await getTenantDbClientUtil();
    const user = await tenantDb.query.users.findFirst({
      where: eq(users.externalId, userId), // Corrected: Use externalId
      columns: { id: true },
    });

    return user?.id ?? null;
  } catch (error) {
    console.error("Error getting internal user ID:", error);
    return null;
  }
}
```

**Reasoning and Explanation of the *Persistent* Error (and the Fix):**

The linter error *persisted* despite the previous attempts because I had missed a crucial detail in *your own provided code* in a previous turn, and I apologize for that.  You had already corrected the field name in `user-actions.ts` to use `externalId`, but I missed that change when focusing on the schema access.

The core issue was *not* how you were accessing the `users` table ( `tenantDb.query.users` is correct). The problem was the field you were using in the `where` clause.

1.  **`users.clerkId` vs. `users.externalId`:**  Your *tenant* database schema (which you provided earlier) defines the column for storing the Clerk user ID as `externalId`, *not* `clerkId`.  The code in `getInternalUserId` *must* use the correct column name from the schema.  You had already made this correction, but I missed it in my previous responses.

2.  **Why `combinedSchema` Import Wasn't the (Main) Issue:** The `combinedSchema` import is generally good practice for type safety when working with multiple schemas, but it wasn't the *root cause* of this specific linter error.  The error was a direct result of using the wrong field name (`clerkId`) in the query. Removing the import makes the code slightly less robust in the long run (if you were to add more complex queries involving multiple tables from different sub-schemas), but it doesn't *cause* the error in this simple case.

By changing `eq(users.clerkId, userId)` to `eq(users.externalId, userId)`, we are now querying the correct column in the `users` table, and the linter error should be resolved. This, combined with the correct `tenantDb.query.users` access, addresses the root cause.


---



---

