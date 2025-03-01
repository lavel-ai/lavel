# Lavel AI: Multi-Tenant Legal AI Agent Platform (Next.js & Turbo Repo)

This repository contains the codebase for Lavel AI, a multi-tenant SaaS platform designed for legal professionals in Mexico.  The platform leverages AI to provide [mention specific AI functionalities, e.g., document summarization, legal research, case prediction, etc.].  A key feature of Lavel AI is its **tenant isolation**, achieved through dedicated databases for each tenant (organization).

**Key Technologies:**

*   **Next.js:** A React framework for building server-side rendered (SSR) and statically generated web applications.
*   **Turbo Repo:** A high-performance build system for JavaScript/TypeScript monorepos.
*   **Clerk:** User authentication and management.
*   **Neon:** Serverless PostgreSQL database provider (used for both the main application database and tenant databases).
*   **Drizzle ORM:** A TypeScript ORM for interacting with the database.
*   **Vercel:** Hosting platform for the Next.js applications.
*   **Liveblocks:** (Optional, based on existing code) For real-time collaboration features (cursors, presence).
*   **PostHog:** (Optional, based on existing code) Product analytics and feature flags.
*   **Vitest:**  Testing framework.
*   **Shadcn/ui:**  UI component library.
*   **Resend:** (Optional, based on existing code) For sending transactional emails (e.g., contact form submissions).
*   **Stripe:** (Optional, based on existing code) For payments/subscription management.
*   **Svix:** (Optional, based on existing code) For webhook management.

**Repository Structure:**

This repository is structured as a monorepo using Turbo Repo, organizing code into logical packages and applications:
.
├── apps/ # Next.js applications
│ ├── api/ # Serverless functions (API endpoints, webhooks)
│ ├── app/ # Main application (authenticated routes, tenant logic)
│ ├── docs/ # Documentation site (likely using Mintlify)
│ ├── email/ # Email templates (using react.email)
│ ├── storybook/ # Storybook for UI component development
│ ├── web/ # Marketing/landing page website
├── packages/ # Reusable packages
│ ├── ai/ # AI-related logic and components
│ ├── analytics/ # Analytics integration (PostHog, Google Analytics, Vercel Analytics)
│ ├── auth/ # Authentication logic (using Clerk)
│ ├── cms/ # Content Management System (Basehub)
│ ├── collaboration/ # Real-time collaboration (using Liveblocks)
│ ├── database/ # Database interactions (Drizzle ORM, Neon connection)
│ │ ├── neon/
│ │ ├── src/
│ │ │ ├── main-app/ # Main application database schema, queries, and connection
│ │ │ └── tenant-app/ # Tenant-specific database schema, queries, connection, and lookup
│ │ └── types/
│ ├── design-system/ # UI components (Shadcn/ui, Tailwind CSS)
│ ├── email/ # Email templates and sending logic (Resend)
│ ├── feature-flags/ # Feature flag management
│ ├── next-config/ # Shared Next.js configuration
│ ├── notifications/ # User notification logic
│ ├── observability/ # Logging, error tracking, and monitoring (Sentry, Logtail)
│ ├── payments/ # Payments integration (Stripe)
│ ├── rate-limit/ # API rate limiting (Upstash Redis)
│ ├── security/ # Security headers and middleware (Nosecone)
│ ├── seo/ # SEO utilities (metadata, JSON-LD)
│ ├── storage/ # Cloud storage (Vercel Blob)
│ ├── tailwind-config/ # Shared Tailwind CSS configuration
│ ├── testing/ # Shared testing configuration (Vitest)
│ ├── typescript-config/ # Shared TypeScript configuration
│ └── webhooks/ # Webhook handling (Svix)
└── scripts/ # Utility scripts (initialization, updates)


**Core Features (Based on Codebase):**

*   **Multi-Tenancy with Subdomain Routing:**  Users access their organization's workspace via a unique subdomain (e.g., `organization-slug.lavel.ai`).
*   **Tenant Isolation:** Each tenant has a separate Neon PostgreSQL database, ensuring data privacy and security.
*   **Authentication with Clerk:**  Handles user registration, login, and session management.  Users initially log in on the main domain (`lavel.ai`) and are redirected to their default organization's subdomain.
*   **Organization Management:**  (Needs further implementation based on the current codebase).  Users can belong to multiple organizations, and the platform includes a mechanism to determine the user's default organization.
*   **Database Management with Drizzle ORM:**  Provides a type-safe way to interact with both the main application database and tenant databases.
*   **Real-time Collaboration (Optional):**  Leverages Liveblocks for features like presence (cursors) and potentially other collaborative editing features.
*   **API (Serverless Functions):** Next.js API routes are used for webhooks (Clerk, Stripe), and potentially other backend logic.
*   **Feature Flags (Optional):**  Uses Vercel's Feature Flags for managing feature rollouts.
*   **Analytics (Optional):** Integrates with PostHog for product analytics and Google Analytics for website tracking.
*   **Email (Optional):** Uses Resend for sending transactional emails.
*   **Payments (Optional):**  Integrates with Stripe for subscription management.
*   **Webhooks (Optional):**  Uses Svix for managing webhooks, allowing integration with external services.
*   **Rate Limiting (Optional):**  Uses Upstash Redis for API rate limiting.
*   **Security Headers:** Uses Nosecone middleware to set HTTP security headers for enhanced security.
*   **SEO:** Includes utilities for generating metadata and JSON-LD for improved search engine optimization.
*   **Documentation:**  Uses Mintlify for generating documentation from Markdown and MDX files.
* **Content Management System:** Uses Basehub to create content, mainly for blog posts.

**Getting Started:**

1.  **Prerequisites:**
    *   Node.js (v18+) and pnpm (or your preferred package manager)
    *   Clerk account and API keys
    *   Neon account and API keys (for main and tenant databases)
    *   (Optional) Resend, Stripe, Svix, PostHog, Vercel, etc., accounts and API keys if using those features
    *   (Optional) If using Basehub, add a valid `BASEHUB_TOKEN`

2.  **Clone the repository:**

    ```bash
    git clone <repository_url>
    ```

3.  **Install dependencies:**

    ```bash
    pnpm install  # Or npm install, yarn install, bun install
    ```

4.  **Set up environment variables:**

    *   Create `.env.local` files in the `apps/api`, `apps/app`, `apps/web`, `packages/cms` and `packages/database` directories (copy the `.env.example` files and fill in the required values).
    *   Make sure to populate the necessary API keys for Clerk, Neon, and any other services you intend to use.
    *   Set `DATABASE_URL` in `packages/database/.env` to point to your **main application database**.
    *   For testing the tenant lookup, create an organization and a project that sets a database connection URL (using, for example, `pscale connect`).

5.  **Database Setup:**

    *   **Main Application Database:**
        *   Run `pnpm migrate` inside `packages/database` to create the tables in your main application database.
        *   You may need to manually create the main database through Neon first.

    *   **Tenant Databases:**
        *   The `tenant-lookup.ts` file contains logic for looking up connection URLs based on subdomains.  You'll need to ensure your main database has the `organizations` and `projects` tables populated correctly.
        *   The actual tenant database schemas are defined in `packages/database/src/tenant-app/schema`. You will need to run migrations *against each tenant database* after you create it (see below).

6.  **Run the development servers:**

    ```bash
    pnpm dev
    ```
    This command (from the root of the monorepo) will start the Next.js development servers for the different applications (app, web, api, etc.).  The default ports are:

    *   `app`: 3000 (main application, authenticated routes)
    *   `web`: 3001 (marketing website)
    *   `api`: 3002 (API endpoints)
    *   `docs`: 3004 (documentation)
    *   `storybook`: 6006

7. **Local Subdomain Setup (Important!):**
   To test multi-tenancy locally, you'll need to configure your system to resolve subdomains to `localhost`. The easiest way is to edit your hosts file:

    *   **macOS / Linux:** `/etc/hosts`
    *   **Windows:** `C:\Windows\System32\drivers\etc\hosts`
    Add entries like this:

    ```
    127.0.0.1   localhost
    127.0.0.1   tenant-a.localhost
    127.0.0.1   tenant-b.localhost
    127.0.0.1   mg.localhost
    ```

    Replace `tenant-a`, `tenant-b`, `mg` with your test subdomains (slugs). You will also need to add entries to the `organizations` table in your main database with those slugs, and a `projects` entry with a corresponding valid `connectionUrl`.

8. **Accessing Applications:**
    * **Main Application:** Access the main application at the appropriate domain and port e.g. `http://localhost:3000`.
    * **Tenant Subdomains:** Access tenant workspaces via their subdomains (e.g., `http://tenant-a.localhost:3000`).
    * **Marketing Website:** Access the marketing website at `http://localhost:3001`.
    * **Documentation:** Access the documentation site at `http://localhost:3004`.
    * **Storybook:** Access Storybook at `http://localhost:6006`.

**Deployment:**

The project is designed to be deployed on Vercel. You will need to:

1.  Create Vercel projects for each of the Next.js applications (`apps/app`, `apps/web`, `apps/api`).
2.  Set the appropriate environment variables in each Vercel project (from your `.env.local` files).
3.  Configure the domains (including wildcard subdomains for multi-tenancy) in Vercel.
4.  Ensure your DNS settings (e.g., a wildcard CNAME record) point to Vercel.

**Key Implementation Details:**

*   **Tenant Middleware (`apps/app/middleware.ts`):** This middleware is crucial for multi-tenancy. It intercepts requests, extracts the subdomain, looks up the corresponding tenant database connection URL, and sets up a Drizzle ORM client for that tenant.
*   **Database Connection Lookup (`@repo/database/src/tenant-app/tenant-lookup.ts`):** The `getTenantConnectionUrl` function is responsible for retrieving the tenant's database connection URL. It implements a simple in-memory cache to improve performance.  *Important Note:* You'll need a robust cache invalidation strategy in a production environment.
*   **Post-Login Redirection (`apps/app/app/(authenticated)/layout.tsx`):**  After a user logs in on the main domain, this layout fetches the user's default organization and redirects them to the appropriate subdomain.
*   **Accessing Tenant Database Client:** Use the `getTenantDbClient` utility function (located in `apps/app/utils/tenant-db.ts`) within route handlers to access the tenant-specific Drizzle client set up by the middleware.

**Next Steps and Further Development:**

*   **Complete Organization Management:** Implement UI and backend logic for:
    *   Creating and managing organizations.
    *   Inviting users to organizations.
    *   Setting user roles within organizations.
    *   Allowing users to switch between organizations.
    *   Implementing a proper "default organization" selection mechanism.
*   **Tenant Database Migrations:**  Develop a strategy for managing database migrations across multiple tenant databases. You'll need a way to apply schema changes to all tenant databases consistently.
*   **Robust Caching:** Implement a more robust caching mechanism for tenant connection URLs (e.g., using Redis or a similar solution) with appropriate cache invalidation.
*   **Error Handling:** Enhance error handling throughout the application, especially in the tenant middleware and database interactions.
*   **Testing:** Expand the test suite to cover more scenarios, including end-to-end tests for the login and redirection flow.
*   **AI Agent Implementation:** This README focuses on the infrastructure.  You'll need to implement the core AI agent functionality, including interactions with the chosen AI models.
*  **Security:** Add more tests to verify the role based access, to check different user roles in the app and check they only access what they are allowed to, also make test to verify the middleware.

This README provides a comprehensive overview of the Lavel AI platform, its architecture, core features, and setup instructions. Remember to adapt the instructions and feature descriptions to your specific implementation as you develop the application further.  Good luck!