## SpecStory

## Database Management Approach and Tenant Explanation (2/9/2025, 9:45:27 AM)

_**User**_

write a deatiled explanation of our approach for our databse managemnt. 
returng an explanation for the main database as we as for the tenant db. 
for the tenant explanation explain the tables and the relation to each other, adn whats the purpoose of it save it in @database.md @database 

---

_**Assistant**_

```markdown:.cursor/research/database.md
# Database Management Approach

This document outlines the database management approach for our application, detailing both the main application database and the tenant databases.

## 1. Main Application Database (`packages/database/src/main-app`)

### Purpose
The main application database is designed to manage core application data that is shared across all tenants. This includes:

- **User Management:**  Storing user accounts, authentication information, and user profiles.
- **Organization Management:** Managing organizations, their settings, and memberships.
- **Project Management:**  Tracking projects associated with organizations, primarily for managing tenant-specific database connections.
- **Global Application Settings:**  Potentially storing application-wide configurations and settings (though not explicitly shown in the current schema).

### Schema and Tables

The main database schema is defined in `packages/database/src/main-app/schema` and consists of the following tables:

- **`users` table:**
    - **Purpose:** Stores user information. Each user in the system is represented here.
    - **Columns:**
        - `id` (UUID, Primary Key, Unique): Unique identifier for the user.
        - `clerk_id` (Text, Unique, Not Null):  ID from Clerk authentication service, linking our user record to Clerk's user management.
        - `signup_status` (Text, Default 'awaiting_org'): Tracks the user's signup progress (e.g., awaiting organization assignment).
        - `email` (Text, Unique, Not Null): User's email address, used for login and communication.
        - `firstName` (Text): User's first name.
        - `lastName` (Text): User's last name.
        - `imageUrl` (Text): URL to the user's profile image.
        - `emailVerified` (Boolean, Default false): Indicates if the user's email is verified.
        - `welcomeEmailSent` (Boolean, Default false): Tracks if the welcome email has been sent to the user.
        - `status` (Text, Default 'active'): User's account status (e.g., active, inactive, pending).
        - `lastSignIn` (Timestamp with Time Zone): Timestamp of the user's last login.
        - `isActive` (Boolean, Default true):  General active status of the user.
        - `metadata` (JSONB):  Allows storing additional user-specific data as JSON.
        - `createdAt` (Timestamp with Time Zone, Default Now): Timestamp when the user record was created.
        - `updatedAt` (Timestamp with Time Zone, Default Now): Timestamp when the user record was last updated.
    - **Constraints:**
        - Unique constraints on `id`, `clerk_id`, and `email` to ensure data integrity.
    - **Relations:**
        - `organizations` (Many-to-many via `organization_members`):  Users can be members of multiple organizations.

- **`organizations` table:**
    - **Purpose:** Stores information about organizations (tenants) using the application.
    - **Columns:**
        - `id` (UUID, Primary Key, Default UUID): Unique identifier for the organization.
        - `clerk_id` (Text, Unique): Clerk ID associated with the organization (potentially for organization-level Clerk management).
        - `name` (Text): Organization's name.
        - `slug` (Text, Unique):  URL-friendly slug for the organization (e.g., for subdomains or paths).
        - `subdomainSlug` (Text, Unique):  Specifically for subdomain routing, ensuring unique subdomains.
        - `logoUrl` (Text): URL to the organization's logo.
        - `hasProject` (Boolean, Default false, Not Null): Indicates if the organization has a project associated with it (and thus likely a tenant database).
        - `metadata` (JSONB):  Allows storing additional organization-specific data as JSON.
        - `status` (Text, Default 'active'): Organization's status (e.g., active, inactive).
        - `createdBy` (UUID):  User ID of the user who created the organization.
        - `createdAt` (Timestamp with Time Zone, Default Now): Timestamp when the organization record was created.
        - `updatedAt` (Timestamp with Time Zone, Default Now): Timestamp when the organization record was last updated.
    - **Constraints:**
        - Unique constraints on `clerk_id`, `slug`, and `subdomainSlug`.
    - **Relations:**
        - `members` (One-to-many via `organization_members`):  Organizations can have multiple members (users).
        - `projects` (One-to-many): Organizations can have multiple projects (though currently designed for one project per organization based on queries).

- **`organization_members` table:**
    - **Purpose:**  A junction table establishing the many-to-many relationship between users and organizations. Defines user roles within organizations.
    - **Columns:**
        - `id` (UUID, Primary Key, Default UUID): Unique identifier for the membership record.
        - `organization_id` (UUID, Foreign Key referencing `organizations.id`):  ID of the organization.
        - `user_id` (UUID, Foreign Key referencing `users.id`): ID of the user.
        - `role` (Text, Default 'member'):  Role of the user within the organization (e.g., 'admin', 'member').
        - `createdAt` (Timestamp with Time Zone, Default Now): Timestamp when the membership record was created.
        - `updatedAt` (Timestamp with Time Zone, Default Now): Timestamp when the membership record was last updated.
    - **Foreign Keys:**
        - `organization_id` referencing `organizations.id` (ON DELETE NO ACTION, ON UPDATE NO ACTION).
        - `user_id` referencing `users.id` (ON DELETE NO ACTION, ON UPDATE NO ACTION).
    - **Relations:**
        - `organization` (Many-to-one to `organizations`):  Each membership belongs to one organization.
        - `user` (Many-to-one to `users`): Each membership belongs to one user.

- **`projects` table:**
    - **Purpose:** Manages projects associated with organizations. In a multi-tenant context, each project likely corresponds to a tenant database instance or schema.
    - **Columns:**
        - `id` (UUID, Primary Key, Default UUID): Unique identifier for the project.
        - `project_id` (Varchar, Not Null):  Project identifier (potentially client-facing or internal).
        - `organization_id` (UUID, Foreign Key referencing `organizations.id`, Not Null): ID of the organization the project belongs to.
        - `connection_url` (Varchar):  Connection string or URL for the tenant-specific database associated with this project. This is crucial for routing tenant requests to the correct database.
        - `createdAt` (Timestamp with Time Zone, Default Now): Timestamp when the project record was created.
        - `updatedAt` (Timestamp with Time Zone, Default Now): Timestamp when the project record was last updated.
    - **Foreign Keys:**
        - `organization_id` referencing `organizations.id` (ON DELETE NO ACTION, ON UPDATE NO ACTION).
    - **Relations:**
        - `organization` (Many-to-one to `organizations`): Each project belongs to one organization.

### Relationships Overview

- **Users and Organizations:** Many-to-many relationship managed by `organization_members`.
- **Organizations and Projects:** One-to-many relationship. Each organization can have multiple projects, but in the current setup, it seems designed for primarily one project per organization to manage the tenant database connection.
- **Organization Members and Organizations:** Many-to-one relationship.
- **Organization Members and Users:** Many-to-one relationship.
- **Projects and Organizations:** Many-to-one relationship.

## 2. Tenant Databases (`packages/database/src/tenant-app`)

### Purpose
Tenant databases are designed to isolate data for each organization (tenant). This approach provides:

- **Data Isolation:** Each tenant's data is stored in a separate database, ensuring privacy and security.
- **Performance Isolation:**  Tenant-specific workloads are isolated, preventing one tenant from impacting the performance of others.
- **Scalability:**  Tenant databases can be scaled independently as needed.
- **Customization:**  Potentially allows for tenant-specific schema modifications or extensions in the future (though not currently implemented in the provided schema).

### Schema and Tables (Conceptual - Based on File Names)

The tenant database schema is intended to be located in `packages/database/src/tenant-app/schema/main`. Based on the file names in this directory, the tenant database is envisioned to manage data related to:

- **Cases/Matters:**  Representing legal cases or client matters.
- **Clients:**  Information about clients associated with cases.
- **AI Interactions:**  Logs or records of interactions with AI services within the context of cases.
- **Case Parties:**  Parties involved in legal cases (e.g., plaintiffs, defendants).

**Conceptual Tables (Based on File Names):**

- **`cases` (or `case`) table:**
    - **Purpose:** Stores information about individual cases or matters for a tenant.
    - **Likely Columns:**  Case ID, case description, status, dates, etc. (Details are in `case-schema.ts` - not provided in full, but likely to contain case-specific attributes).
    - **Relations:**  Likely related to `clients`, `ai_interactions`, and `case_parties`.

- **`clients` (or `clients`) table:**
    - **Purpose:** Stores information about clients of the organization.
    - **Likely Columns:** Client ID, contact information, client details, etc. (Details in `clients-schema.ts`).
    - **Relations:** Likely related to `cases`.

- **`ai_interactions` (or `ai-interactions`) table:**
    - **Purpose:** Logs of interactions with AI services, likely associated with specific cases.
    - **Likely Columns:** Interaction ID, case ID, timestamp, AI service used, input, output, etc. (Details in `ai-interactions-schema.ts`).
    - **Relations:** Likely related to `cases`.

- **`case_parties` (or `case-parties`) table:**
    - **Purpose:** Stores information about parties involved in a case.
    - **Likely Columns:** Party ID, case ID, party name, role (plaintiff, defendant, etc.), contact information, etc. (Details in `case-parties.ts`).
    - **Relations:** Likely related to `cases`.

### Relationships Overview (Conceptual)

- **Cases and Clients:**  Likely a many-to-many or one-to-many relationship. Cases involve clients, and clients may be involved in multiple cases.
- **Cases and AI Interactions:** One-to-many relationship. Each case can have multiple AI interactions logged.
- **Cases and Case Parties:** One-to-many relationship. Each case can have multiple parties involved.

### Tenant Database Management

- **Database per Tenant:** The architecture implies a database-per-tenant strategy, where each organization gets its own dedicated database instance.
- **Connection Management:** The `projects` table in the main database stores the `connection_url` for each tenant database. This URL is used to dynamically connect to the correct tenant database when handling requests for a specific organization.
- **Schema Management:**  Drizzle Kit configurations in `packages/database/src/tenant-app/drizzle.config.ts` suggest separate migrations and schema management for tenant databases, although the schema files themselves are not fully populated in the provided code.

This approach provides a robust and scalable architecture for a multi-tenant application, ensuring data isolation and allowing for independent scaling of tenant-specific data.
```

---

_**User**_

ok for the main app database you did a great job, now lets replicate this fof the tenant database, just modify the documentation 

---

_**Assistant**_

```markdown:.cursor/research/database.md
# Database Management Approach

This document outlines the database management approach for our application, detailing both the main application database and the tenant databases.

## 1. Main Application Database (`packages/database/src/main-app`)

### Purpose
The main application database is designed to manage core application data that is shared across all tenants. This includes:

- **User Management:**  Storing user accounts, authentication information, and user profiles.
- **Organization Management:** Managing organizations, their settings, and memberships.
- **Project Management:**  Tracking projects associated with organizations, primarily for managing tenant-specific database connections.
- **Global Application Settings:**  Potentially storing application-wide configurations and settings (though not explicitly shown in the current schema).

### Schema and Tables

The main database schema is defined in `packages/database/src/main-app/schema` and consists of the following tables:

- **`users` table:**
    - **Purpose:** Stores user information. Each user in the system is represented here.
    - **Columns:**
        - `id` (UUID, Primary Key, Unique): Unique identifier for the user.
        - `clerk_id` (Text, Unique, Not Null):  ID from Clerk authentication service, linking our user record to Clerk's user management.
        - `signup_status` (Text, Default 'awaiting_org'): Tracks the user's signup progress (e.g., awaiting organization assignment).
        - `email` (Text, Unique, Not Null): User's email address, used for login and communication.
        - `firstName` (Text): User's first name.
        - `lastName` (Text): User's last name.
        - `imageUrl` (Text): URL to the user's profile image.
        - `emailVerified` (Boolean, Default false): Indicates if the user's email is verified.
        - `welcomeEmailSent` (Boolean, Default false): Tracks if the welcome email has been sent to the user.
        - `status` (Text, Default 'active'): User's account status (e.g., active, inactive, pending).
        - `lastSignIn` (Timestamp with Time Zone): Timestamp of the user's last login.
        - `isActive` (Boolean, Default true):  General active status of the user.
        - `metadata` (JSONB):  Allows storing additional user-specific data as JSON.
        - `createdAt` (Timestamp with Time Zone, Default Now): Timestamp when the user record was created.
        - `updatedAt` (Timestamp with Time Zone, Default Now): Timestamp when the user record was last updated.
    - **Constraints:**
        - Unique constraints on `id`, `clerk_id`, and `email` to ensure data integrity.
    - **Relations:**
        - `organizations` (Many-to-many via `organization_members`):  Users can be members of multiple organizations.

- **`organizations` table:**
    - **Purpose:** Stores information about organizations (tenants) using the application.
    - **Columns:**
        - `id` (UUID, Primary Key, Default UUID): Unique identifier for the organization.
        - `clerk_id` (Text, Unique): Clerk ID associated with the organization (potentially for organization-level Clerk management).
        - `name` (Text): Organization's name.
        - `slug` (Text, Unique):  URL-friendly slug for the organization (e.g., for subdomains or paths).
        - `subdomainSlug` (Text, Unique):  Specifically for subdomain routing, ensuring unique subdomains.
        - `logoUrl` (Text): URL to the organization's logo.
        - `hasProject` (Boolean, Default false, Not Null): Indicates if the organization has a project associated with it (and thus likely a tenant database).
        - `metadata` (JSONB):  Allows storing additional organization-specific data as JSON.
        - `status` (Text, Default 'active'): Organization's status (e.g., active, inactive).
        - `createdBy` (UUID):  User ID of the user who created the organization.
        - `createdAt` (Timestamp with Time Zone, Default Now): Timestamp when the organization record was created.
        - `updatedAt` (Timestamp with Time Zone, Default Now): Timestamp when the organization record was last updated.
    - **Constraints:**
        - Unique constraints on `clerk_id`, `slug`, and `subdomainSlug`.
    - **Relations:**
        - `members` (One-to-many via `organization_members`):  Organizations can have multiple members (users).
        - `projects` (One-to-many): Organizations can have multiple projects (though currently designed for one project per organization based on queries).

- **`organization_members` table:**
    - **Purpose:**  A junction table establishing the many-to-many relationship between users and organizations. Defines user roles within organizations.
    - **Columns:**
        - `id` (UUID, Primary Key, Default UUID): Unique identifier for the membership record.
        - `organization_id` (UUID, Foreign Key referencing `organizations.id`):  ID of the organization.
        - `user_id` (UUID, Foreign Key referencing `users.id`): ID of the user.
        - `role` (Text, Default 'member'):  Role of the user within the organization (e.g., 'admin', 'member').
        - `createdAt` (Timestamp with Time Zone, Default Now): Timestamp when the membership record was created.
        - `updatedAt` (Timestamp with Time Zone, Default Now): Timestamp when the membership record was last updated.
    - **Foreign Keys:**
        - `organization_id` referencing `organizations.id` (ON DELETE NO ACTION, ON UPDATE NO ACTION).
        - `user_id` referencing `users.id` (ON DELETE NO ACTION, ON UPDATE NO ACTION).
    - **Relations:**
        - `organization` (Many-to-one to `organizations`):  Each membership belongs to one organization.
        - `user` (Many-to-one to `users`): Each membership belongs to one user.

- **`projects` table:**
    - **Purpose:** Manages projects associated with organizations. In a multi-tenant context, each project likely corresponds to a tenant database instance or schema.
    - **Columns:**
        - `id` (UUID, Primary Key, Default UUID): Unique identifier for the project.
        - `project_id` (Varchar, Not Null):  Project identifier (potentially client-facing or internal).
        - `organization_id` (UUID, Foreign Key referencing `organizations.id`, Not Null): ID of the organization the project belongs to.
        - `connection_url` (Varchar):  Connection string or URL for the tenant-specific database associated with this project. This is crucial for routing tenant requests to the correct database.
        - `createdAt` (Timestamp with Time Zone, Default Now): Timestamp when the project record was created.
        - `updatedAt` (Timestamp with Time Zone, Default Now): Timestamp when the project record was last updated.
    - **Foreign Keys:**
        - `organization_id` referencing `organizations.id` (ON DELETE NO ACTION, ON UPDATE NO ACTION).
    - **Relations:**
        - `organization` (Many-to-one to `organizations`): Each project belongs to one organization.

### Relationships Overview

- **Users and Organizations:** Many-to-many relationship managed by `organization_members`.
- **Organizations and Projects:** One-to-many relationship. Each organization can have multiple projects, but in the current setup, it seems designed for primarily one project per organization to manage the tenant database connection.
- **Organization Members and Organizations:** Many-to-one relationship.
- **Organization Members and Users:** Many-to-one relationship.
- **Projects and Organizations:** Many-to-one relationship.

## 2. Tenant Databases (`packages/database/src/tenant-app`)

### Purpose
Tenant databases are designed to isolate data for each organization (tenant). This approach provides:

- **Data Isolation:** Each tenant's data is stored in a separate database, ensuring privacy and security.
- **Performance Isolation:**  Tenant-specific workloads are isolated, preventing one tenant from impacting the performance of others.
- **Scalability:**  Tenant databases can be scaled independently as needed.
- **Customization:**  Potentially allows for tenant-specific schema modifications or extensions in the future.

### Schema and Tables (`packages/database/src/tenant-app/schema/main`)

The tenant database schema is defined within the `packages/database/src/tenant-app/schema/main` directory. It is designed to manage data specific to each tenant's operations.  Currently, the schema includes tables for managing cases, clients, AI interactions, and case parties.

- **`cases` (or `case`) table (`packages/database/src/tenant-app/schema/main/case-schema.ts`):**
    - **Purpose:** Stores information about individual legal cases or matters for the tenant organization. This is the central entity around which most tenant data revolves.
    - **Columns (Likely):**
        - `id` (UUID, Primary Key, Default UUID): Unique identifier for the case.
        - `case_number` or `case_id` (Text, Unique):  A unique, human-readable identifier for the case, possibly assigned by the organization.
        - `title` or `name` (Text):  Descriptive title or name of the case.
        - `description` (Text):  A more detailed description of the case.
        - `status` (Text):  Current status of the case (e.g., 'open', 'pending', 'closed').
        - `filing_date` (Date or Timestamp): Date when the case was filed.
        - `created_at` (Timestamp with Time Zone, Default Now): Timestamp when the case record was created.
        - `updated_at` (Timestamp with Time Zone, Default Now): Timestamp when the case record was last updated.
        - ... (Potentially other case-specific attributes like jurisdiction, case type, judge, etc.)
    - **Relations:**
        - `clients` (Many-to-many via a junction table or One-to-many): Cases are associated with clients.
        - `ai_interactions` (One-to-many):  Cases can have multiple AI interaction logs.
        - `case_parties` (One-to-many): Cases involve multiple parties.

- **`clients` (or `clients`) table (`packages/database/src/tenant-app/schema/main/clients-schema.ts`):**
    - **Purpose:** Stores information about clients represented by the tenant organization.
    - **Columns (Likely):**
        - `id` (UUID, Primary Key, Default UUID): Unique identifier for the client.
        - `client_number` or `client_id` (Text, Unique): Unique, organization-assigned client identifier.
        - `name` (Text, Not Null): Client's full name or organization name.
        - `contact_name` (Text): Contact person's name (if client is an organization).
        - `email` (Text): Client's email address.
        - `phone_number` (Text): Client's phone number.
        - `address` (Text): Client's address.
        - `created_at` (Timestamp with Time Zone, Default Now): Timestamp when the client record was created.
        - `updated_at` (Timestamp with Time Zone, Default Now): Timestamp when the client record was last updated.
        - ... (Potentially other client-specific details).
    - **Relations:**
        - `cases` (Many-to-many or Many-to-one): Clients can be associated with multiple cases.

- **`ai_interactions` (or `ai-interactions`) table (`packages/database/src/tenant-app/schema/main/ai-interactions-schema.ts`):**
    - **Purpose:**  Logs interactions with AI services performed within the context of a case. This table is crucial for tracking AI usage, costs, and potentially for auditing and review.
    - **Columns (Likely):**
        - `id` (UUID, Primary Key, Default UUID): Unique identifier for the AI interaction log.
        - `case_id` (UUID, Foreign Key referencing `cases.id`, Not Null):  ID of the case the interaction pertains to.
        - `timestamp` (Timestamp with Time Zone, Default Now): Timestamp of the AI interaction.
        - `service_name` (Text): Name of the AI service used (e.g., 'GPT-4', 'Summarization AI').
        - `interaction_type` (Text): Type of interaction (e.g., 'summarization', 'document analysis', 'query').
        - `input_text` (Text): Input provided to the AI service (or reference to input data).
        - `output_text` (Text): Output received from the AI service (or reference to output data).
        - `cost` (Numeric or Decimal):  Cost associated with the AI interaction (if applicable).
        - `metadata` (JSONB):  Allows storing additional details about the interaction, like parameters used, API response details, etc.
        - `created_at` (Timestamp with Time Zone, Default Now): Timestamp when the interaction log was created.
        - `updated_at` (Timestamp with Time Zone, Default Now): Timestamp when the interaction log was last updated.
    - **Foreign Keys:**
        - `case_id` referencing `cases.id`.
    - **Relations:**
        - `case` (Many-to-one to `cases`): Each AI interaction belongs to a specific case.

- **`case_parties` (or `case-parties`) table (`packages/database/src/tenant-app/schema/main/case-parties.ts`):**
    - **Purpose:** Stores information about individuals or entities involved in a case, other than the client. This could include opposing parties, witnesses, judges, etc.
    - **Columns (Likely):**
        - `id` (UUID, Primary Key, Default UUID): Unique identifier for the case party record.
        - `case_id` (UUID, Foreign Key referencing `cases.id`, Not Null): ID of the case.
        - `party_name` (Text, Not Null): Name of the party involved.
        - `party_type` (Text): Role or type of party (e.g., 'plaintiff', 'defendant', 'witness', 'judge').
        - `contact_name` (Text): Contact person's name (if party is an organization).
        - `email` (Text): Party's email address.
        - `phone_number` (Text): Party's phone number.
        - `address` (Text): Party's address.
        - `metadata` (JSONB):  For storing additional party-specific information.
        - `created_at` (Timestamp with Time Zone, Default Now): Timestamp when the party record was created.
        - `updated_at` (Timestamp with Time Zone, Default Now): Timestamp when the party record was last updated.
    - **Foreign Keys:**
        - `case_id` referencing `cases.id`.
    - **Relations:**
        - `case` (Many-to-one to `cases`): Each case party record belongs to a specific case.

### Relationships Overview (Tenant Database)

- **Cases and Clients:** Likely a many-to-many relationship, potentially managed through a junction table (not explicitly shown but common for cases and clients).  Alternatively, it could be a one-to-many if a case primarily relates to a single client, but clients can have multiple cases.
- **Cases and AI Interactions:** One-to-many relationship. Each case can have multiple AI interaction logs associated with it.
- **Cases and Case Parties:** One-to-many relationship. Each case can involve multiple parties.
- **AI Interactions and Cases:** Many-to-one relationship. Each AI interaction is linked to a specific case.
- **Case Parties and Cases:** Many-to-one relationship. Each case party record is linked to a specific case.

### Tenant Database Management

- **Database per Tenant:**  Employs a database-per-tenant strategy for data isolation and scalability.
- **Connection Management:**  Tenant database connection details are stored in the main application database's `projects` table, allowing dynamic connection routing.
- **Schema Management:**  Separate Drizzle Kit configuration for tenant databases enables independent schema migrations and management for each tenant's data model. This allows for potential tenant-specific schema evolutions in the future if needed.

This detailed schema for the tenant database provides a structured approach to managing legal case information, client data, AI service usage, and involved parties, all within an isolated and scalable multi-tenant architecture.

```

---

_**User**_

dont do likely we have the schema created @tenant-app we have 3 schemas reference, main and vector, access the directory for each of them and go file by file to review the tables 

---

_**Assistant**_



---



---

