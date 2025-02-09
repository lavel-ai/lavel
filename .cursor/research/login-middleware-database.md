## System Architecture Description: Simplified Multi-Tenant Application

This architecture outlines a multi-tenant SaaS application built with Next.js, leveraging subdomains for tenant separation and separate Neon databases for each tenant organization. The focus is on a streamlined user login experience starting from the main domain (lavel.ai) with immediate redirection to the user's default tenant workspace.

Components:

    User Browser: The client-side interface used by users to interact with the application (e.g., Chrome, Firefox, Safari).

    DNS Lookup: The Domain Name System (DNS) resolves domain names (like tenant-a.lavel.ai or lavel.ai) to the IP address of the application server hosted on Vercel. A wildcard CNAME record is configured in DNS for *.lavel.ai pointing to the main application domain (lavel.ai), ensuring all subdomain requests are routed to the same application server.

    Vercel Edge Network:  Vercel's global edge network and serverless functions host and serve the Next.js application.

    Load Balancer/Reverse Proxy:  (Implicit in Vercel) Vercel infrastructure includes load balancing and reverse proxy functionality to distribute incoming requests to application server instances.

    Tenant Middleware (apps/app/middleware.ts):
        Purpose: Identifies the tenant organization based on the incoming request's hostname (subdomain) and sets up the tenant-specific database connection within the request context.
        Logic:
            Receives each incoming request.
            Checks the Host header to determine if it's a root domain request (lavel.ai) or a subdomain request (tenant-a.lavel.ai).
            For Subdomain Requests: Extracts the subdomain, uses the getTenantConnectionUrl utility (leveraging caching and @repo/db queries) to fetch the Neon database connection URL for the tenant from the Main Application Database. Establishes a Drizzle ORM client connected to the tenant's database and stores it in the Next.js Request Context (req.dbClient).
            For Root Domain Requests: Bypasses tenant-specific logic and allows the request to proceed to authentication checks.
        Data Source: Interacts with the Main Application Database to retrieve tenant and project information.

    Authentication Flow (apps/app/app/(authenticated)/layout.tsx & @repo/auth):
        Purpose: Handles user authentication and initial redirection after login.
        Logic:
            AppLayout (for authenticated routes) uses @repo/auth's currentUser() to check if a user is logged in.
            If not logged in, redirects to Clerk's sign-in page.
            After Login (on Main Domain): If the user logs in via the main domain (lavel.ai), AppLayout then fetches the user's default organization (using fetchDefaultOrganizationForUser query from @repo/db). It then immediately redirects the user to the subdomain URL of their default organization (e.g., tenant-a.lavel.ai/dashboard).
            On Subdomain: If the user directly accesses a subdomain URL (or is redirected to a subdomain after login), AppLayout proceeds to render the authenticated application layout.

    Auth Middleware (@repo/auth/middleware):
        Purpose: Enforces authentication for protected routes using Clerk.
        Execution: Runs after Tenant Middleware.
        Logic: Standard Clerk authentication middleware to verify user sessions.

    Security Headers Middleware (@repo/security/middleware):
        Purpose: Sets HTTP security headers for enhanced security (using Nosecone).
        Execution: Runs after Auth Middleware.
        Logic: Applies predefined security headers to all responses.

    Application Route Handlers (apps/app/app/api, apps/app/app/(authenticated)):
        Purpose: Handle specific application logic for different routes (API endpoints, UI pages, server actions).
        Data Access: Access tenant-specific databases using the getTenantDbClient(req) helper function (from apps/app/utils/tenant-db.ts), which retrieves the tenant database client from the Request Context set up by Tenant Middleware.

    Tenant Database (Neon - per tenant):
        Purpose: Separate Neon PostgreSQL databases, one for each tenant organization.
        Data Isolation: Ensures complete data isolation between tenants.
        Scalability: Allows for independent scaling and resource management for each tenant database.

    Main Application Database (Neon):
        Purpose: A central Neon PostgreSQL database that stores application-level data, including:
            organizations table: Stores organization metadata (name, slug, subdomainSlug, etc.) and, importantly, the connection URLs for each tenant database (in the projects table, linked to organizations).
            users (or potentially Clerk user IDs linked to internal user records for role management across tenants if needed): User accounts and potentially relationships between users and organizations (e.g., organizationMembers table).
        Management: This database is managed by the platform provider and accessed by the Tenant Middleware and potentially other backend services for global application management.

    Code Packages (@repo/db, @repo/auth, @repo/security, apps/app):
        @repo/db Package: Encapsulates all database-related logic:
            Drizzle ORM schema definitions (schema).
            Database connection setup for the Main Application Database (db).
            Query functions in src/queries (e.g., organizationQueries.getConnectionUrlForSubdomain, organizationQueries.fetchDefaultOrganizationForUser).
        @repo/auth Package: Contains authentication logic, likely built using Clerk SDKs (e.g., authMiddleware, currentUser, redirectToSignIn).
        @repo/security Package: Provides security-related middleware and utilities (e.g., noseconeMiddleware).
        apps/app: The Next.js application itself:
            middleware.ts: Contains the Tenant Middleware, and wraps Auth Middleware and Security Headers Middleware.
            utils/tenant-db.ts: Utility functions for tenant database connection management and caching.
            app directory: Contains route handlers, pages, layouts, and components for the application UI and API endpoints.

User Login Workflow:

    User visits lavel.ai.
    Clicks "Login".
    Is redirected to Clerk's sign-in page on the main domain.
    Logs in successfully via Clerk.
    AppLayout on lavel.ai runs after login.
    AppLayout fetches the user's default organization and its subdomainSlug.
    AppLayout redirects the user to https://<subdomainSlug>.lavel.ai/dashboard.
    On subdomain, Tenant Middleware sets up the tenant database connection.
    User accesses the application within their tenant workspace.

Organization Switching (Optional - via Org Switcher Component):

    Users can use an "Organization Switcher" component within the application UI (e.g., in the sidebar).
    The switcher fetches the list of organizations the user belongs to.
    When a user selects an organization, the switcher navigates them to the corresponding subdomain URL.

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