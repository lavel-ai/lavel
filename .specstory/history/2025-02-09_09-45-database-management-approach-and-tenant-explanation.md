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

### Schema and Tables (`packages/database/src/tenant-app/schema`)

The tenant database is divided into multiple schemas: `main`, `reference`, and `vector` (though `vector` schema is not yet defined in the provided files). Below are the tables defined within the `main` and `reference` schemas.

#### 2.1. `main` Schema Tables (`packages/database/src/tenant-app/schema/main`)

This schema contains the core operational data for each tenant, focusing on case management, client information, and related entities.

- **`ai_interactions` table (`packages/database/src/tenant-app/schema/main/ai-interactions-schema.ts`):**
    - **Purpose:**  Logs interactions with AI services within the context of document processing.
    - **Columns:**
        - `id` (UUID, Primary Key, Default UUID): Unique identifier for the AI interaction.
        - `document_id` (UUID, Not Null, Foreign Key referencing `documents.id`):  ID of the document related to the interaction.
        - `user_id` (UUID, Not Null, Foreign Key referencing `users.id`): ID of the user who initiated the interaction.
        - `user_query` (Text, Not Null): The query or prompt submitted by the user to the AI.
        - `query_metadata` (JSONB):  Metadata related to the user's query.
        - `ai_response` (Text, Not Null): The response received from the AI service.
        - `suggested_operations` (JSONB):  Operations suggested by the AI based on the interaction.
        - `response_time` (Integer):  Time taken by the AI to respond.
        - `token_count` (Integer): Number of tokens used in the AI interaction.
        - `was_helpful` (Boolean): User feedback on whether the AI response was helpful.
        - `user_feedback` (Text):  Textual feedback provided by the user.
        - `created_at` (Timestamp with Time Zone, Not Null, Default Now): Timestamp when the interaction was logged.
    - **Foreign Keys:**
        - `document_id` referencing `documents.id`.
        - `user_id` referencing `users.id`.

- **`case_parties` table (`packages/database/src/tenant-app/schema/main/case-parties.ts`):**
    - **Purpose:**  Stores information about parties involved in legal cases.
    - **Columns:**
        - `id` (UUID, Primary Key, Default UUID): Unique identifier for the case party.
        - `case_id` (UUID, Not Null, Foreign Key referencing `cases.id`): ID of the case this party is involved in.
        - `name` (Text, Not Null): Name of the case party.
        - `type` (Text, Not Null, Enum: 'individual', 'corporation', 'government', 'other'): Type of the case party.
        - `is_client` (Boolean, Default false):  Indicates if this party is a client of the organization.
        - `client_id` (UUID, Foreign Key referencing `clients.id`):  ID of the client if `is_client` is true.
        - `corporation_id` (UUID, Foreign Key referencing `corporations.id`): ID of the corporation if the party is a corporation from the organization's records.
        - `role` (Text, Not Null): Role of the party in the case.
        - `start_date` (Timestamp, Not Null): Date when the party's involvement in the case began.
        - `end_date` (Timestamp): Date when the party's involvement ended.
        - `is_active` (Boolean, Default true):  Indicates if the party's involvement is currently active.
        - `contact_info` (JSONB): Contact information for the party.
        - `notes` (Text):  Additional notes about the party.
        - `created_at` (Timestamp, Not Null, Default Now): Timestamp when the record was created.
        - `updated_at` (Timestamp, Not Null, Default Now): Timestamp when the record was last updated.
        - `created_by` (UUID, Not Null, Foreign Key referencing `users.id`): ID of the user who created the record.
        - `updated_by` (UUID, Not Null, Foreign Key referencing `users.id`): ID of the user who last updated the record.
    - **Foreign Keys:**
        - `case_id` referencing `cases.id`.
        - `client_id` referencing `clients.id`.
        - `corporation_id` referencing `corporations.id`.
        - `created_by` referencing `users.id`.
        - `updated_by` referencing `users.id`.
    - **Relations:**
        - `case` (Many-to-one to `cases`): Each case party belongs to a case.
        - `createdByUser` (Many-to-one to `users`): User who created the record.
        - `updatedByUser` (Many-to-one to `users`): User who updated the record.

- **`cases` table (`packages/database/src/tenant-app/schema/main/case-schema.ts`):**
    - **Purpose:**  Stores core information about legal cases or matters.
    - **Columns:**
        - `id` (UUID, Primary Key, Default UUID): Unique identifier for the case.
        - `title` (Text, Not Null): Title of the case.
        - `description` (Text): Description of the case.
        - `state_id` (Integer, Foreign Key referencing `reference.states.id`): ID of the state where the case is located.
        - `city_id` (Integer, Foreign Key referencing `reference.cities.id`): ID of the city where the case is located.
        - `type` (Text, Not Null, Enum: 'advisory', 'litigation'): Type of case (advisory or litigation).
        - `case_law_branch_id` (Integer, Foreign Key referencing `reference.law_branches.id`): ID of the law branch relevant to the case.
        - `is_active` (Boolean, Not Null, Default true):  Indicates if the case is currently active.
        - `status` (Text, Not Null, Enum: 'pending', 'active', 'closed', 'archived', 'other'): Current status of the case.
        - `risk_level` (Text, Not Null, Enum: 'low', 'medium', 'high'): Risk level associated with the case.
        - `original_case_id` (UUID, Foreign Key referencing `cases.id`, Self-reference):  ID of the original case if this case is related.
        - `relationship_type` (Text): Type of relationship to the original case.
        - `start_date` (Timestamp, Not Null): Date when the case started.
        - `estimated_end_date` (Timestamp): Estimated end date of the case.
        - `actual_end_date` (Timestamp): Actual end date of the case.
        - `transformation_date` (Timestamp): Date of transformation (purpose unclear from schema).
        - `lead_attorney_id` (UUID, Not Null, Foreign Key referencing `users.id`): ID of the lead attorney for the case.
        - `assigned_team_id` (UUID, Not Null, Foreign Key referencing `teams.id`): ID of the team assigned to the case.
        - `last_activity_at` (Timestamp, Not Null, Default Now): Timestamp of the last activity related to the case.
        - `last_activity_by_id` (UUID, Not Null, Foreign Key referencing `users.id`): ID of the user who performed the last activity.
        - `last_activity_type` (Text, Not Null): Type of the last activity.
        - `documents_count` (Integer, Default 0): Count of documents associated with the case.
        - `private_documents_count` (Integer, Default 0): Count of private documents.
        - `tasks_count` (Integer, Default 0): Count of tasks related to the case.
        - `pending_tasks_count` (Integer, Default 0): Count of pending tasks.
        - `completed_tasks_count` (Integer, Default 0): Count of completed tasks.
        - `events_count` (Integer, Default 0): Count of events related to the case.
        - `upcoming_events_count` (Integer, Default 0): Count of upcoming events.
        - `notes_count` (Integer, Default 0): Count of notes associated with the case.
        - `private_notes_count` (Integer, Default 0): Count of private notes.
        - `last_note_at` (Timestamp): Timestamp of the last note added.
        - `last_note_by_id` (UUID, Foreign Key referencing `users.id`): ID of the user who added the last note.
        - `comments_count` (Integer, Default 0): Count of comments on the case.
        - `unread_comments_count` (Integer, Default 0): Count of unread comments.
        - `total_billable_hours` (Numeric(10, 2), Default '0'): Total billable hours for the case.
        - `total_non_billable_hours` (Numeric(10, 2), Default '0'): Total non-billable hours.
        - `total_hours` (Numeric(10, 2), Default '0'): Total hours spent on the case.
        - `total_task_hours` (Numeric(10, 2), Default '0'): Total hours spent on tasks.
        - `total_other_hours` (Numeric(10, 2), Default '0'): Total other hours.
        - `total_media_count` (Integer, Default 0): Count of media files associated with the case.
        - `total_media_size` (Integer, Default 0): Total size of media files (in bytes).
        - `created_at` (Timestamp, Not Null, Default Now): Timestamp when the case record was created.
        - `updated_at` (Timestamp, Not Null, Default Now): Timestamp when the case record was last updated.
        - `created_by` (UUID, Not Null, Foreign Key referencing `users.id`): ID of the user who created the case record.
        - `updated_by` (UUID, Not Null, Foreign Key referencing `users.id`): ID of the user who last updated the case record.
        - `version` (Integer, Default 1): Version number of the case record.
        - `deleted_at` (Timestamp): Timestamp when the case was marked as deleted.
    - **Foreign Keys:**
        - `state_id` referencing `reference.states.id`.
        - `city_id` referencing `reference.cities.id`.
        - `case_law_branch_id` referencing `reference.law_branches.id`.
        - `original_case_id` referencing `cases.id` (self-reference).
        - `lead_attorney_id` referencing `users.id`.
        - `assigned_team_id` referencing `teams.id`.
        - `last_activity_by_id` referencing `users.id`.
        - `last_note_by_id` referencing `users.id`.
        - `created_by` referencing `users.id`.
        - `updated_by` referencing `users.id`.
    - **Relations:**
        - `parentCase` (One-to-one to `cases`, self-reference):  The parent case if this case is related.
        - `childCases` (One-to-many to `cases`, self-reference): Child cases related to this case.
        - `leadAttorney` (Many-to-one to `users`): The lead attorney for the case.
        - `assignedTeam` (Many-to-one to `teams`): The team assigned to the case.
        - `lastActivityBy` (Many-to-one to `users`): User who performed the last activity.
        - `lastNoteBy` (Many-to-one to `users`): User who added the last note.
        - `createdByUser` (Many-to-one to `users`): User who created the case record.
        - `updatedByUser` (Many-to-one to `users`): User who updated the case record.
        - `parties` (One-to-many to `caseParties`): Parties involved in the case.

- **`clients` table (`packages/database/src/tenant-app/schema/main/clients-schema.ts`):**
    - **Purpose:** Stores information about clients.
    - **Columns:**
        - `id` (UUID, Primary Key, Default UUID): Unique identifier for the client.
        - `name` (Varchar(255), Not Null): Full name of the client.
        - `first_name` (Varchar(100)): First name of the client (if individual).
        - `last_name` (Varchar(100)): Last name of the client (if individual).
        - `client_type` (Varchar(50), Not Null, Default 'individual'): Type of client (individual or organization).
        - `description` (Text): Description of the client.
        - `contact_info` (JSONB):  JSON object containing contact details (name, phone, email, address, preferred contact method).
        - `preferred_language` (Varchar(5), Default 'es'): Preferred language of the client.
        - `portal_access` (Boolean, Not Null, Default false):  Indicates if the client has portal access.
        - `portal_access_email` (Text, Unique): Email used for portal access.
        - `is_active` (Boolean, Not Null, Default true):  Indicates if the client is currently active.
        - `billing_info` (JSONB): JSON object for billing details (address, tax ID, billing email, payment terms, currency).
        - `primary_team_id` (UUID, Foreign Key referencing `teams.id`): ID of the primary team assigned to the client.
        - `created_at` (Timestamp with Time Zone, Not Null, Default Now): Timestamp when the client record was created.
        - `updated_at` (Timestamp with Time Zone, Default Now): Timestamp when the client record was last updated.
        - `deleted_at` (Timestamp with Time Zone): Timestamp when the client was marked as deleted.
        - `created_by` (UUID, Not Null, Foreign Key referencing `users.id`): ID of the user who created the client record.
        - `updated_by` (UUID, Not Null, Foreign Key referencing `users.id`): ID of the user who last updated the client record.
        - `deleted_by` (UUID): ID of the user who deleted the client record.
    - **Unique Constraints:**
        - `unique_client_name`: Unique constraint on `name`.
        - `unique_portal_email`: Unique constraint on `portal_access_email`.
    - **Foreign Keys:**
        - `primary_team_id` referencing `teams.id`.
        - `created_by` referencing `users.id`.
        - `updated_by` referencing `users.id`.
    - **Relations:**
        - `corporations` (One-to-many to `corporations`): Corporations associated with this client.
        - `primaryTeam` (Many-to-one to `teams`): The primary team assigned to the client.
        - `createdByUser` (Many-to-one to `users`): User who created the client record.
        - `updatedByUser` (Many-to-one to `users`): User who updated the client record.

- **`corporations` table (`packages/database/src/tenant-app/schema/main/corporations-schema.ts`):**
    - **Purpose:** Stores information about corporations associated with clients.
    - **Columns:**
        - `id` (UUID, Primary Key, Default UUID): Unique identifier for the corporation.
        - `client_id` (UUID, Not Null, Foreign Key referencing `clients.id`): ID of the client to whom this corporation belongs.
        - `name` (Varchar(255), Not Null): Name of the corporation.
        - `rfc` (Varchar(13)): Mexican tax identification number (RFC).
        - `constitution_date` (Timestamp with Time Zone): Date of incorporation.
        - `notary_number` (Integer): Notary number for incorporation documents.
        - `notary_state` (Varchar(100)): State of the notary.
        - `instrument_number` (Varchar(100)): Instrument number of incorporation.
        - `is_active` (Boolean, Not Null, Default true):  Indicates if the corporation is currently active.
        - `status` (Varchar(50), Not Null, Default 'active'): Status of the corporation.
        - `notes` (Text): Additional notes about the corporation.
        - `created_at` (Timestamp with Time Zone, Not Null, Default Now): Timestamp when the corporation record was created.
        - `updated_at` (Timestamp with Time Zone): Timestamp when the corporation record was last updated.
        - `created_by` (UUID, Not Null, Foreign Key referencing `users.id`): ID of the user who created the corporation record.
        - `updated_by` (UUID, Not Null, Foreign Key referencing `users.id`): ID of the user who last updated the corporation record.
    - **Unique Constraints:**
        - `unique_name_per_client`: Unique constraint on `client_id` and `name` to ensure unique corporation names per client.
    - **Foreign Keys:**
        - `client_id` referencing `clients.id`.
        - `created_by` referencing `users.id`.
        - `updated_by` referencing `users.id`.
    - **Relations:**
        - `client` (Many-to-one to `clients`): The client to whom this corporation belongs.
        - `createdByUser` (Many-to-one to `users`): User who created the corporation record.
        - `updatedByUser` (Many-to-one to `users`): User who updated the corporation record.

- **`court_participations` table (`packages/database/src/tenant-app/schema/main/court-participants.ts`):**
    - **Purpose:** Stores details of a case party's participation in court proceedings.
    - **Columns:**
        - `id` (UUID, Primary Key, Default UUID): Unique identifier for the court participation record.
        - `party_id` (UUID, Not Null, Foreign Key referencing `case_parties.id`): ID of the case party involved.
        - `court_role` (Text, Not Null): The party's role in court proceedings.
        - `service_date` (Timestamp): Date of service of process.
        - `appearance_date` (Timestamp): Date of first court appearance.
        - `service_status` (Text): Status of service process.
        - `appearance_status` (Text): Status of court appearance.
        - `has_appearance` (Boolean, Default false): Indicates if the party has made a court appearance.
        - `represented_by` (Text): Information about legal representation.
        - `last_action_date` (Timestamp): Date of last court action.
        - `next_action_deadline` (Timestamp): Deadline for next court action.
        - `process_status` (Text): Overall process status in court.
        - `notes` (Text): Additional notes on court participation.
        - `created_at` (Timestamp, Not Null, Default Now): Timestamp when the record was created.
        - `updated_at` (Timestamp, Not Null, Default Now): Timestamp when the record was last updated.
        - `created_by` (UUID, Not Null, Foreign Key referencing `users.id`): ID of the user who created the record.
        - `updated_by` (UUID, Not Null, Foreign Key referencing `users.id`): ID of the user who last updated the record.
    - **Foreign Keys:**
        - `party_id` referencing `case_parties.id`.
        - `created_by` referencing `users.id`.
        - `updated_by` referencing `users.id`.
    - **Relations:**
        - `party` (Many-to-one to `caseParties`): The case party involved in this court participation.
        - `createdByUser` (Many-to-one to `users`): User who created the record.
        - `updatedByUser` (Many-to-one to `users`): User who updated the record.

- **`document_operations` table (`packages/database/src/tenant-app/schema/main/document-operations-schema.ts`):**
    - **Purpose:** Tracks operations performed on documents, potentially for collaborative editing or AI-driven suggestions.
    - **Columns:**
        - `id` (UUID, Primary Key, Default UUID): Unique identifier for the document operation.
        - `document_id` (UUID, Not Null, Foreign Key referencing `documents.id`): ID of the document being operated on.
        - `operation_type` (Text, Not Null): Type of operation performed (e.g., 'insert', 'delete', 'highlight').
        - `operation_data` (JSONB, Not Null): Data associated with the operation (e.g., text inserted, range deleted).
        - `position` (JSONB, Not Null): Position in the document where the operation occurred.
        - `sequence_number` (Integer, Not Null): Sequence number of the operation in the document's history.
        - `ai_suggested` (Boolean, Default false): Indicates if the operation was suggested by AI.
        - `ai_context` (JSONB): Context from AI related to the suggestion.
        - `ai_interaction_id` (UUID): ID of the AI interaction that suggested the operation.
        - `status` (Text, Not Null, Default 'pending'): Status of the operation (e.g., 'pending', 'resolved', 'rejected').
        - `resolved_at` (Timestamp with Time Zone): Timestamp when the operation was resolved.
        - `resolved_by` (UUID, Foreign Key referencing `users.id`): ID of the user who resolved the operation.
        - `created_at` (Timestamp with Time Zone, Not Null, Default Now): Timestamp when the operation was logged.
        - `created_by` (UUID, Not Null, Foreign Key referencing `users.id`): ID of the user who initiated the operation.
    - **Unique Constraints:**
        - `unqDocumentSequence`: Unique constraint on `document_id` and `sequence_number` to ensure operation sequence within a document.
    - **Foreign Keys:**
        - `document_id` referencing `documents.id`.
        - `resolved_by` referencing `users.id`.
        - `created_by` referencing `users.id`.

- **`document_sessions` table (`packages/database/src/tenant-app/schema/main/document-sessions-schema.ts`):**
    - **Purpose:** Tracks user sessions when working on documents, likely for collaborative editing features or activity monitoring.
    - **Columns:**
        - `id` (UUID, Primary Key, Default UUID): Unique identifier for the document session.
        - `document_id` (UUID, Not Null, Foreign Key referencing `documents.id`): ID of the document being edited.
        - `user_id` (UUID, Not Null, Foreign Key referencing `users.id`): ID of the user in the session.
        - `cursor_position` (JSONB): Current cursor position in the document during the session.
        - `selection_range` (JSONB): Current text selection range in the document.
        - `started_at` (Timestamp with Time Zone, Not Null, Default Now): Timestamp when the session started.
        - `last_active_at` (Timestamp with Time Zone, Not Null, Default Now): Timestamp of the last activity in the session.
        - `ended_at` (Timestamp with Time Zone): Timestamp when the session ended.
        - `client_info` (JSONB): Information about the client (browser, device, etc.) used for the session.
    - **Unique Constraints:**
        - `unqDocumentUser`: Unique constraint on `document_id` and `user_id` to ensure only one active session per user per document.
    - **Foreign Keys:**
        - `document_id` referencing `documents.id`.
        - `user_id` referencing `users.id`.

- **`documents` table (`packages/database/src/tenant-app/schema/main/documents-schema.ts`):**
    - **Purpose:** Stores documents, likely legal documents or case-related documents.
    - **Columns:**
        - `id` (UUID, Primary Key, Default UUID): Unique identifier for the document.
        - `title` (Text, Not Null): Title of the document.
        - `tiptap_content` (JSONB, Not Null): Content of the document, likely in Tiptap editor format.
        - `document_type` (Text, Not Null): Type of document (e.g., 'contract', 'pleading', 'memo').
        - `is_template` (Boolean, Not Null, Default false):  Indicates if the document is a template.
        - `status` (Text, Not Null, Default 'draft'): Current status of the document (e.g., 'draft', 'final', 'approved').
        - `language` (Text, Not Null, Default 'es'): Language of the document.
        - `case_id` (UUID, Foreign Key referencing `cases.id`): ID of the case to which the document is related.
        - `effective_date` (Date): Effective date of the document.
        - `expiration_date` (Date): Expiration date of the document.
        - `signature_date` (Date): Signature date of the document.
        - `metadata` (JSONB, Not Null, Default {}):  Additional metadata for the document.
        - `version_count` (Integer, Not Null, Default 1): Version count of the document.
        - `word_count` (Integer): Word count of the document.
        - `created_at` (Timestamp with Time Zone, Not Null, Default Now): Timestamp when the document record was created.
        - `updated_at` (Timestamp with Time Zone, Not Null, Default Now): Timestamp when the document record was last updated.
        - `created_by` (UUID, Not Null, Foreign Key referencing `users.id`): ID of the user who created the document record.
        - `updated_by` (UUID, Not Null, Foreign Key referencing `users.id`): ID of the user who last updated the document record.
        - `deleted_at` (Timestamp with Time Zone): Timestamp when the document was marked as deleted.
        - `deleted_by` (UUID, Foreign Key referencing `users.id`): ID of the user who deleted the document record.
    - **Foreign Keys:**
        - `case_id` referencing `cases.id`.
        - `created_by` referencing `users.id`.
        - `updated_by` referencing `users.id`.
        - `deleted_by` referencing `users.id`.

- **`events` table (`packages/database/src/tenant-app/schema/main/events-schema.ts`):**
    - **Purpose:** Stores information about events, likely calendar events related to cases or general organization events.
    - **Columns:**
        - `id` (UUID, Primary Key, Default UUID): Unique identifier for the event.
        - `title` (Varchar(255), Not Null): Title of the event.
        - `description` (Text): Description of the event.
        - `start_time` (Timestamp with Time Zone, Not Null): Start time of the event.
        - `end_time` (Timestamp with Time Zone, Not Null): End time of the event.
        - `is_all_day` (Boolean, Not Null, Default false):  Indicates if the event is an all-day event.
        - `location` (Varchar(255)): Location of the event.
        - `created_at` (Timestamp with Time Zone, Not Null, Default Now): Timestamp when the event record was created.
        - `updated_at` (Timestamp with Time Zone): Timestamp when the event record was last updated.
        - `status` (Enum: 'confirmed', 'tentative', 'cancelled', Not Null, Default 'confirmed'): Status of the event.
        - `recurrence_rule` (Text): Recurrence rule for recurring events (e.g., iCalendar RRULE).
        - `organizer_id` (UUID, Not Null): ID of the event organizer (not explicitly linked to `users.id` in schema, might need review).
        - `timezone` (Varchar(50), Not Null, Default 'UTC'): Timezone for the event.
        - `color` (Varchar(7)): Color code for the event (e.g., for calendar display).
        - `metadata` (JSONB):  Additional metadata for the event.
        - `case_id` (UUID, Foreign Key referencing `cases.id`): ID of the case to which the event is related.
        - `event_type` (Enum: 'hearing', 'appointment', 'call', 'meeting', 'other', Not Null, Default 'appointment'): Type of event.
        - `created_by` (UUID, Not Null, Foreign Key referencing `users.id`): ID of the user who created the event record.
        - `updated_by` (UUID, Not Null, Foreign Key referencing `users.id`): ID of the user who last updated the event record.
    - **Indexes:**
        - `idx_events_end_time`: Index on `end_time`.
        - `idx_events_organizer_id`: Index on `organizer_id`.
        - `idx_events_start_time`: Index on `start_time`.
    - **Foreign Keys:**
        - `case_id` referencing `cases.id` (ON DELETE SET NULL).
        - `created_by` referencing `users.id` (ON DELETE CASCADE).
        - `updated_by` referencing `users.id`.
    - **Relations:**
        - `createdBy` (Many-to-one to `users`): User who created the event record.
        - `updatedBy` (Many-to-one to `users`): User who updated the event record.

- **`litigation_details` table (`packages/database/src/tenant-app/schema/main/litigation-details-schema.ts`):**
    - **Purpose:** Stores details specific to litigation cases, extending the `cases` table.
    - **Columns:**
        - `id` (UUID, Primary Key, Default UUID): Unique identifier for litigation details.
        - `case_id` (UUID, Not Null, Foreign Key referencing `cases.id`): ID of the related case.
        - `courthouse_id` (Integer, Foreign Key referencing `reference.courthouses.id`): ID of the courthouse where the litigation is taking place.
        - `filing_number` (Text): Case filing number at the courthouse.
        - `filing_date` (Timestamp): Date of case filing.
        - `admission_date` (Timestamp): Date of court admission of the case.
        - `service_date` (Timestamp): Date of service of process to defendants.
        - `first_hearing_date` (Timestamp): Date of the first hearing.
        - `next_hearing_date` (Timestamp): Date of the next hearing.
        - `proceeding_type` (Text, Not Null): Type of legal proceeding.
        - `current_stage` (Text, Not Null): Current stage of the litigation process.
        - `claim_amount` (Numeric(15, 2)): Amount of the claim.
        - `date_of_calculation` (Timestamp): Date of claim amount calculation.
        - `real_cost` (Numeric(10, 2)): Real cost associated with the litigation.
        - `hearings_count` (Numeric, Default '0'): Number of hearings in the case.
        - `next_deadline` (Timestamp): Next important deadline in the litigation.
        - `response_deadline` (Timestamp): Deadline for response.
        - `appeal_deadline` (Timestamp): Deadline for appeal.
        - `special_instructions` (Text): Special instructions for handling the litigation.
        - `required_documents` (Text): List of required documents.
        - `total_court_hours` (Numeric(10, 2), Default '0'): Total hours spent in court.
        - `total_preparation_hours` (Numeric(10, 2), Default '0'): Total hours spent on preparation.
        - `created_at` (Timestamp, Not Null, Default Now): Timestamp when the record was created.
        - `updated_at` (Timestamp, Not Null, Default Now): Timestamp when the record was last updated.
        - `created_by` (UUID, Not Null, Foreign Key referencing `users.id`): ID of the user who created the record.
        - `updated_by` (UUID, Not Null, Foreign Key referencing `users.id`): ID of the user who last updated the record.
        - `version` (Numeric, Default '1'): Version number of the litigation details record.
    - **Foreign Keys:**
        - `case_id` referencing `cases.id`.
        - `courthouse_id` referencing `reference.courthouses.id`.
        - `created_by` referencing `users.id`.
        - `updated_by` referencing `users.id`.
    - **Relations:**
        - `case` (Many-to-one to `cases`): The related case.
        - `createdByUser` (Many-to-one to `users`): User who created the record.
        - `updatedByUser` (Many-to-one to `users`): User who updated the record.
        - `courthouse` (Many-to-one to `reference.courthouses`): The courthouse for the litigation.

- **`team_members` table (`packages/database/src/tenant-app/schema/main/team-members-schema.ts`):**
    - **Purpose:** Junction table for many-to-many relationship between teams and users (profiles), defining team membership.
    - **Columns:**
        - `id` (UUID, Primary Key, Default UUID): Unique identifier for the team membership record.
        - `team_id` (UUID, Not Null, Foreign Key referencing `teams.id`, ON DELETE CASCADE): ID of the team.
        - `profile_id` (UUID, Not Null, Foreign Key referencing `users.id`, ON DELETE CASCADE): ID of the user (profile).
        - `role` (Varchar(50), Not Null, Default 'member'): Role of the user within the team.
        - `created_at` (Timestamp with Time Zone, Not Null, Default Now): Timestamp when the membership record was created.
        - `updated_at` (Timestamp with Time Zone): Timestamp when the membership record was last updated.
        - `deleted_at` (Timestamp with Time Zone): Timestamp when the membership was marked as deleted.
        - `created_by` (UUID, Foreign Key referencing `users.id`): ID of the user who created the membership record.
        - `updated_by` (UUID, Foreign Key referencing `users.id`): ID of the user who updated the membership record.
        - `deleted_by` (UUID): ID of the user who deleted the membership record.
    - **Unique Constraints:**
        - `uniqueTeamMember`: Unique constraint on `team_id` and `profile_id` to prevent duplicate team members.
    - **Foreign Keys:**
        - `team_id` referencing `teams.id` (ON DELETE CASCADE).
        - `profile_id` referencing `users.id` (ON DELETE CASCADE).
        - `created_by` referencing `users.id`.
        - `updated_by` referencing `users.id`.
    - **Relations:**
        - `team` (Many-to-one to `teams`): The team of this membership.
        - `profile` (Many-to-one to `users`): The user (profile) in this membership.
        - `createdByUser` (Many-to-one to `users`): User who created the membership record.
        - `updatedByUser` (Many-to-one to `users`): User who updated the membership record.

- **`teams` table (`packages/database/src/tenant-app/schema/main/teams-schema.ts`):**
    - **Purpose:** Stores information about teams within the organization, for case assignment and collaboration.
    - **Columns:**
        - `id` (UUID, Primary Key, Default UUID): Unique identifier for the team.
        - `name` (Varchar(255), Not Null): Name of the team.
        - `description` (Text): Description of the team.
        - `created_at` (Timestamp with Time Zone, Not Null, Default Now): Timestamp when the team record was created.
        - `updated_at` (Timestamp with Time Zone): Timestamp when the team record was last updated.
        - `deleted_at` (Timestamp with Time Zone): Timestamp when the team was marked as deleted.
        - `created_by` (UUID, Foreign Key referencing `users.id`): ID of the user who created the team record.
        - `updated_by` (UUID, Foreign Key referencing `users.id`): ID of the user who updated the team record.
        - `deleted_by` (UUID): ID of the user who deleted the team record.
    - **Foreign Keys:**
        - `created_by` referencing `users.id`.
        - `updated_by` referencing `users.id`.
    - **Relations:**
        - `cases` (One-to-many to `cases`): Cases assigned to this team.
        - `teamMembers` (One-to-many to `teamMembers`): Members of this team.
        - `createdByUser` (Many-to-one to `users`): User who created the team record.
        - `updatedByUser` (Many-to-one to `users`): User who updated the team record.

- **`transcriptions` table (`packages/database/src/tenant-app/schema/main/transcriptions-schema.ts`):**
    - **Purpose:** Stores transcriptions of audio or video content, likely related to cases.
    - **Columns:**
        - `id` (UUID, Primary Key, Default UUID): Unique identifier for the transcription.
        - `case_id` (UUID, Not Null, Foreign Key referencing `cases.id`): ID of the case related to the transcription.
        - `transcription` (Text, Not Null): The transcribed text content.
        - `summary` (Text): Summary of the transcription.
        - `video_url` (Text, Not Null): URL of the video or audio source.
        - `video_duration` (Integer, Not Null): Duration of the video/audio in seconds.
        - `transcription_provider_id` (Text, Not Null): Identifier of the transcription service provider.
        - `metadata` (JSONB, Not Null, Default {}):  Additional metadata about the transcription.
        - `is_processed` (Boolean, Not Null, Default false):  Indicates if the transcription is fully processed.
        - `is_private` (Boolean, Not Null, Default false):  Indicates if the transcription is marked as private.
        - `created_at` (Timestamp, Not Null, Default Now): Timestamp when the transcription record was created.
        - `updated_at` (Timestamp, Not Null, Default Now): Timestamp when the transcription record was last updated.
        - `created_by` (UUID, Not Null, Foreign Key referencing `users.id`): ID of the user who created the transcription record.
        - `updated_by` (UUID, Not Null, Foreign Key referencing `users.id`): ID of the user who last updated the transcription record.
    - **Foreign Keys:**
        - `case_id` referencing `cases.id`.
        - `created_by` referencing `users.id`.
        - `updated_by` referencing `users.id`.
    - **Relations:**
        - `case` (Many-to-one to `cases`): The related case.
        - `createdBy` (Many-to-one to `users`): User who created the transcription record.
        - `updatedBy` (Many-to-one to `users`): User who updated the transcription record.

- **`users` table (`packages/database/src/tenant-app/schema/main/users-schema.ts`):**
    - **Purpose:**  Tenant-specific user information. Note: This table seems to duplicate some information from the main application's `users` table. It might be intended to store tenant-specific user settings or extend the main user profile within the tenant context.
    - **Columns:**
        - `id` (UUID, Primary Key): Unique identifier for the tenant user.
        - `clerk_id` (Text, Unique, Not Null): Clerk ID of the user, linking to the main application's user record.
        - `signup_status` (Text, Default 'awaiting_org'): Signup status within the tenant context.
        - `email` (Text, Unique, Not Null): User's email address.
        - `firstName` (Text): User's first name.
        - `lastName` (Text): User's last name.
        - `imageUrl` (Text): User's image URL.
        - `email_verified` (Boolean, Default false): Email verification status.
        - `welcome_email_sent` (Boolean, Default false): Welcome email sent status.
        - `status` (Text, Default 'active'): User status within the tenant context.
        - `last_sign_in` (Timestamp with Time Zone): Last sign-in timestamp.
        - `metadata` (JSONB):  Tenant-specific user metadata.
        - `created_at` (Timestamp with Time Zone, Default Now): Timestamp when the tenant user record was created.
        - `updated_at` (Timestamp with Time Zone, Default Now): Timestamp when the tenant user record was last updated.
    - **Unique Constraints:**
        - `clerk_id`: Unique constraint on `clerk_id`.
        - `email`: Unique constraint on `email`.

#### 2.2. `reference` Schema Tables (`packages/database/src/tenant-app/schema/reference`)

This schema contains reference data, which is generally static or slowly changing and shared across tenants. It includes things like states, cities, law branches, etc.

- **`cities` table (`packages/database/src/tenant-app/schema/reference/cities-schema.ts`):**
    - **Purpose:** Stores a list of cities.
    - **Columns:**
        - `id` (Integer, Primary Key, Auto-increment): Unique identifier for the city.
        - `name` (Varchar, Not Null): Name of the city.
        - `created_at` (Timestamp with Time Zone, Not Null, Default Now): Timestamp when the city record was created.
        - `updated_at` (Timestamp with Time Zone, Not Null, Default Now): Timestamp when the city record was last updated.
        - `state_id` (Integer, Foreign Key referencing `states.id`): ID of the state to which the city belongs.
    - **Unique Constraints:**
        - `cities_name_key`: Unique constraint on `name`.
    - **Foreign Keys:**
        - `state_id` referencing `states.id`.
    - **Relations:**
        - `state` (Many-to-one to `states`): The state to which this city belongs.

- **`courthouses` table (`packages/database/src/tenant-app/schema/reference/courthouses-schema.ts`):**
    - **Purpose:** Stores information about courthouses.
    - **Columns:**
        - `id` (Integer, Primary Key, Auto-increment): Unique identifier for the courthouse.
        - `name` (Text, Not Null): Name of the courthouse.
        - `contact_info` (JSONB): Contact information for the courthouse.
        - `judicial_district` (Text): Judicial district the courthouse belongs to.
        - `city_id` (Integer, Unique, Foreign Key referencing `cities.id`): ID of the city where the courthouse is located.
        - `law_branch_id` (Integer, Unique, Foreign Key referencing `law_branches.id`): ID of the law branch associated with the courthouse.
        - `parent_id` (Integer, Foreign Key referencing `courthouses.id`, Self-reference): ID of a parent courthouse, if any (hierarchical structure).
        - `jurisdiction_id` (Integer, Unique, Foreign Key referencing `jurisdictions.id`): ID of the jurisdiction of the courthouse.
        - `abbreviation` (Text): Abbreviation of the courthouse name.
        - `state_id` (Integer, Unique, Foreign Key referencing `states.id`): ID of the state where the courthouse is located.
        - `created_at` (Timestamp with Time Zone, Not Null, Default Now): Timestamp when the courthouse record was created.
        - `updated_at` (Timestamp with Time Zone, Not Null, Default Now): Timestamp when the courthouse record was last updated.
    - **Unique Constraints:**
        - `city_id`: Unique constraint on `city_id`.
        - `law_branch_id`: Unique constraint on `law_branch_id`.
        - `jurisdiction_id`: Unique constraint on `jurisdiction_id`.
        - `state_id`: Unique constraint on `state_id`.
    - **Foreign Keys:**
        - `city_id` referencing `cities.id`.
        - `jurisdiction_id` referencing `jurisdictions.id`.
        - `law_branch_id` referencing `law_branches.id`.
        - `parent_id` referencing `courthouses.id` (self-reference).
        - `state_id` referencing `states.id`.
    - **Relations:**
        - `city` (Many-to-one to `cities`): The city where the courthouse is located.
        - `jurisdiction` (Many-to-one to `jurisdictions`): The jurisdiction of the courthouse.
        - `lawBranch` (Many-to-one to `lawBranches`): The law branch associated with the courthouse.
        - `courthouse` (Many-to-one to `courthouses`, self-reference): Parent courthouse.
        - `courthouses` (One-to-many to `courthouses`, self-reference): Child courthouses.
        - `state` (Many-to-one to `states`): The state where the courthouse is located.

- **`jurisdictions` table (`packages/database/src/tenant-app/schema/reference/jurisdictions-schema.ts`):**
    - **Purpose:** Stores a list of legal jurisdictions.
    - **Columns:**
        - `id` (Integer, Primary Key, Auto-increment): Unique identifier for the jurisdiction.
        - `name` (Varchar, Not Null): Name of the jurisdiction.
        - `created_at` (Timestamp with Time Zone, Not Null, Default Now): Timestamp when the jurisdiction record was created.
        - `updated_at` (Timestamp with Time Zone, Not Null, Default Now): Timestamp when the jurisdiction record was last updated.
    - **Unique Constraints:**
        - `jurisdictions_name_key`: Unique constraint on `name`.
    - **Relations:**
        - `courthouses` (One-to-many to `courthouses`): Courthouses belonging to this jurisdiction.

- **`law_branches` table (`packages/database/src/tenant-app/schema/reference/law-branches-schema.ts`):**
    - **Purpose:** Stores a list of law branches or legal areas of practice.
    - **Columns:**
        - `id` (Integer, Primary Key, Auto-increment): Unique identifier for the law branch.
        - `name` (Varchar, Not Null): Name of the law branch.
        - `created_at` (Timestamp with Time Zone, Not Null, Default Now): Timestamp when the law branch record was created.
        - `updated_at` (Timestamp with Time Zone, Not Null, Default Now): Timestamp when the law branch record was last updated.
    - **Unique Constraints:**
        - `law_branches_name_key`: Unique constraint on `name`.
    - **Relations:**
        - `courthouses` (One-to-many to `courthouses`): Courthouses associated with this law branch.
        - `trialTypes` (One-to-many to `trialTypes`): Trial types within this law branch.

- **`states` table (`packages/database/src/tenant-app/schema/reference/states-schema.ts`):**
    - **Purpose:** Stores a list of states or provinces.
    - **Columns:**
        - `id` (Integer, Primary Key, Auto-increment): Unique identifier for the state.
        - `name` (Varchar, Not Null): Name of the state.
        - `code` (Varchar(2), Unique, Not Null): Two-letter state code (e.g., 'CA', 'NY').
        - `created_at` (Timestamp with Time Zone, Not Null, Default Now): Timestamp when the state record was created.
        - `updated_at` (Timestamp with Time Zone, Not Null, Default Now): Timestamp when the state record was last updated.
    - **Unique Constraints:**
        - `states_code_key`: Unique constraint on `code`.
        - `states_name_key`: Unique constraint on `name`.
    - **Relations:**
        - `cities` (One-to-many to `cities`): Cities within this state.
        - `courthouses` (One-to-many to `courthouses`): Courthouses located in this state.

- **`trial_stages` table (`packages/database/src/tenant-app/schema/reference/trial-stages-schema.ts`):**
    - **Purpose:** Stores a list of trial stages.
    - **Columns:**
        - `id` (Integer, Primary Key, Auto-increment): Unique identifier for the trial stage.
        - `name` (Varchar, Not Null): Name of the trial stage.
        - `description` (Text): Description of the trial stage.
        - `createdAt` (Timestamp with Time Zone, Not Null, Default Now): Timestamp when the trial stage record was created.
        - `updatedAt` (Timestamp with Time Zone, Not Null, Default Now): Timestamp when the trial stage record was last updated.
    - **Unique Constraints:**
        - `trial_stages_name_key`: Unique constraint on `name`.

- **`trial_stages_types` table (`packages/database/src/tenant-app/schema/reference/trial-stages-types-schema.ts`):**
    - **Purpose:** Junction table to link trial stages and trial types, likely defining valid stages for each trial type.
    - **Columns:**
        - `id` (Integer, Primary Key, Auto-increment): Unique identifier for the trial stage type link.
        - `trial_stage_id` (Integer, Foreign Key referencing `trial_stages.id`): ID of the trial stage.
        - `trial_type_id` (Integer, Foreign Key referencing `trial_types.id`): ID of the trial type.
        - `createdAt` (Timestamp with Time Zone, Not Null, Default Now): Timestamp when the link record was created.
        - `updatedAt` (Timestamp with Time Zone, Not Null, Default Now): Timestamp when the link record was last updated.
    - **Foreign Keys:**
        - `trial_stage_id` referencing `trial_stages.id`.
        - `trial_type_id` referencing `trial_types.id`.

- **`trial_types` table (`packages/database/src/tenant-app/schema/reference/trial-types-schema.ts`):**
    - **Purpose:** Stores a list of trial types.
    - **Columns:**
        - `id` (Integer, Primary Key, Auto-increment): Unique identifier for the trial type.
        - `name` (Varchar, Not Null): Name of the trial type.
        - `law_branch_id` (Integer, Foreign Key referencing `law_branches.id`): ID of the law branch to which this trial type belongs.
        - `description` (Text): Description of the trial type.
        - `createdAt` (Timestamp with Time Zone, Not Null, Default Now): Timestamp when the trial type record was created.
        - `updatedAt` (Timestamp with Time Zone, Not Null, Default Now): Timestamp when the trial type record was last updated.
    - **Unique Constraints:**
        - `trial_types_name_key`: Unique constraint on `name`.
    - **Foreign Keys:**
        - `law_branch_id` referencing `law_branches.id`.
    - **Relations:**
        - `lawBranch` (Many-to-one to `lawBranches`): The law branch to which this trial type belongs.
        - `trialStages` (Many-to-many via `trial_stages_types`): Trial stages valid for this trial type.

This detailed breakdown should provide a comprehensive understanding of the tenant database schema, including both the `main` operational schema and the `reference` data schema.
```

---



---

