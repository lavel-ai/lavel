## Implementation Plan: Multi-Tenant Login Middleware

This plan outlines the steps to implement a multi-tenant login middleware for a Next.js application, as described in `login-middleware-database.md`.

**Goal**: Implement middleware to identify tenants based on subdomains, establish tenant-specific database connections, and manage user redirection after login.

**Components to Modify:**

-   `apps/app/middleware.ts`: Implement Tenant Middleware and integrate with existing middleware.
-   `@repo/database/src/tenant-app/tenant-db.ts`: Implement `getTenantConnectionUrl` utility function.
-   `@repo/database/src/main-app/queries/organization-queries.ts`: Implement `fetchDefaultOrganizationForUser` query.
-   `apps/app/app/(authenticated)/layout.tsx`: Modify authentication layout for redirection logic.
-   `apps/app/utils/tenant-db.ts`: Create utility file to access tenant DB client from request context.
-   Potentially: `@repo/database/package.json`, `@repo/database/keys.ts`, `@repo/database/index.ts` (if adjustments are needed for tenant DB setup).

**Step-by-Step Plan:**

**Step 1: Set up Tenant Database Connection Utility (`@repo/database/src/tenant-app/tenant-lookup.ts`)**

    *   **Implement `getTenantConnectionUrl(subdomain: string)` function:**
        *   This function will take the subdomain as input.
        *   It will query the **Main Application Database** (using `@repo/database/db` - main app client) to find the organization based on the subdomain (`organizations` table).
        *   If the organization is found, it will retrieve the associated tenant database connection URL from the `projects` table (linked to the organization).
        *   Implement caching (e.g., using `Map`) to store connection URLs for subsequent requests to the same subdomain.
        *   Return the connection URL or `null` if not found.
    *   **Implement `getTenantDbClient(req: NextRequest)` helper function:**
        *   This function will retrieve the tenant database client from the Next.js Request Context (`req.dbClient`), which will be set by the Tenant Middleware.
        *   Throw an error if `req.dbClient` is not initialized, indicating that the middleware was not applied.

**Step 2: Implement Tenant Identification Middleware (`apps/app/middleware.ts`)**

    *   **Create `tenantMiddleware(req: NextRequest)` function:**
        *   Extract the hostname from the `req.headers.get('host')`.
        *   Determine if it's a subdomain request or the root domain.
        *   **For Subdomain Requests:**
            *   Extract the subdomain.
            *   Call `getTenantConnectionUrl(subdomain)` to get the database connection URL.
            *   If no connection URL is found (tenant not found), return a `404` or redirect to a default page.
            *   Establish a Drizzle ORM client using `@neondatabase/serverless` and the retrieved connection URL.
            *   Store the Drizzle client in the Next.js Request Context: `req.dbClient = tenantDbClient;`.
            *   Handle potential database connection errors gracefully (return `500` error).
        *   **For Root Domain Requests (e.g., `lavel.ai`):**
            *   Bypass tenant-specific logic. The middleware should just proceed without setting `req.dbClient`.
    *   **Integrate `tenantMiddleware` into the main middleware:**
        *   In `apps/app/middleware.ts`, ensure `tenantMiddleware` is executed **first**, before `authMiddleware` and `securityHeaders`.
        *   Modify the default middleware export to chain `tenantMiddleware` with the existing middleware functions.
        *   Conditionally apply `securityHeaders` and `authMiddleware` only if `tenantMiddleware` successfully establishes a tenant database connection (check if `req.dbClient` is set). This is crucial to avoid errors on the main domain or for requests that don't require a tenant DB.

**Step 3: Implement Default Organization Fetch Query (`@repo/database/src/main-app/queries/organization-queries.ts`)**

    *   **Create `fetchDefaultOrganizationForUser(userId: string)` function:**
        *   This function will query the **Main Application Database** to find the default organization for a given user ID.
        *   It should query the `organization_members` table to find organizations the user is a member of.
        *   For now, it can simply return the **first** organization the user is a member of.  *(In a real application, you might have logic to determine a "default" organization, e.g., based on user settings or roles)*.
        *   Return an object containing the `id` and `subdomainSlug` of the default organization, or `null` if the user is not a member of any organization.

**Step 4: Modify Authentication Layout for Redirection (`apps/app/app/(authenticated)/layout.tsx`)**

    *   **Post-Login Redirection Logic:**
        *   In the `AppLayout` component (for authenticated routes), after successful authentication (user login on the main domain `lavel.ai`).
        *   Call `fetchDefaultOrganizationForUser(user.id)` (from `@repo/database/queries/organization-queries.ts`) to get the user's default organization.
        *   If a default organization is found (and has a `subdomainSlug`), **redirect** the user to the subdomain URL of their default organization (e.g., `https://<subdomainSlug>.lavel.ai/dashboard`).
        *   If no default organization is found, the user might remain on the main domain or be redirected to a default application page on the main domain (depending on desired behavior).
    *   **Subdomain Access:**
        *   If the user directly accesses a subdomain URL (e.g., `tenant-a.lavel.ai/dashboard`) or is redirected to a subdomain after login, `AppLayout` should proceed to render the authenticated application layout as usual, relying on the Tenant Middleware to have set up the `req.dbClient`.

**Step 5: Create Utility File to Access Tenant DB Client (`apps/app/utils/tenant-db.ts`)**

    *   Create a new file `apps/app/utils/tenant-db.ts`.
    *   Move the `getTenantDbClient(req: NextRequest)` function (initially defined in `apps/app/middleware.ts`) into this utility file.
    *   Update imports in `apps/app/middleware.ts` and any route handlers that need to access the tenant DB client to import `getTenantDbClient` from this utility file.

**Step 6: Testing**

    *   **Unit Tests (for utility functions):**
        *   Test `getTenantConnectionUrl` function in isolation: mock database queries to simulate different scenarios (organization found, organization not found, project with connection URL, project without, database errors).
    *   **Integration Tests (for middleware):**
        *   Set up test subdomains (e.g., using `localhost` and different ports or hostnames in a test environment).
        *   Test middleware behavior for:
            *   Valid subdomain requests: Verify that `req.dbClient` is correctly set up with a valid database connection.
            *   Invalid subdomain requests: Verify that the middleware returns a `404` or appropriate error response.
            *   Root domain requests: Verify that tenant middleware is bypassed and no errors occur.
            *   Database connection errors: Simulate database connection failures and verify that the middleware handles them gracefully (returns `500` error).
    *   **End-to-End Tests (for login redirection):**
        *   Test the complete login flow:
            *   Log in on the main domain (`lavel.ai`).
            *   Verify redirection to the correct subdomain URL based on the user's default organization.
            *   Access application pages on the subdomain and verify data is being fetched from the correct tenant database (you'll need to set up test data in tenant databases).

**Step 7: Documentation and Code Cleanup**

    *   Add comments to the code to explain the logic of the Tenant Middleware and related functions.
    *   Update any relevant documentation (like `login-middleware-database.md` or other architecture documents) to reflect the implementation details.
    *   Review and refactor code for clarity and maintainability.


**Rollback Plan:**

    *   If issues arise during implementation, revert changes to `apps/app/middleware.ts`, `@repo/database/src/tenant-app/tenant-db.ts`, `@repo/database/src/main-app/queries/organization-queries.ts`, and `apps/app/app/(authenticated)/layout.tsx` to their previous states.
    *   Remove the newly created `apps/app/utils/tenant-db.ts` file.
    *   Thoroughly test the application after rollback to ensure stability.

This plan provides a structured approach to implementing the multi-tenant login middleware. Each step should be implemented and tested incrementally to ensure a smooth integration.
