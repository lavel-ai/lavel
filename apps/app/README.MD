# Lavel Application Architecture

## Project Overview

## Main Application Structure

The main application follows Next.js App Router architecture with a clear separation between authenticated and unauthenticated routes:

```
/apps/app/app/
├── (authenticated)/         # All authenticated routes
│   ├── dashboard/           # Dashboard pages
│   ├── clients/             # Client management feature
│   ├── cases/               # Case management feature
│   ├── teams/               # Team management feature
│   ├── documents/           # Document management feature
│   ├── tasks/               # Task management feature
│   └── settings/            # Application settings
│
├── (unauthenticated)/       # Unauthenticated routes
│   ├── login/               # Login page
│   ├── signup/              # Signup page
│   └── reset-password/      # Password reset flow
│
├── api/                     # API routes (for webhooks, etc.)
│
├── actions/                 # Server actions
│   ├── form/                # Form handling base actions
│   └── entity/              # Entity-specific actions
│
├── hooks/                   # Custom React hooks
│
├── components/              # Shared components
│   ├── ui/                  # Basic UI components
│   ├── layout/              # Layout components
│   ├── data-display/        # Data display components
│   └── form/                # Form components
│
├── lib/                     # Client-side libraries
│
├── utils/                   # Server-side utilities
│
└── config/                  # App configuration
```

## Feature-Based Organization

Each feature area follows a consistent pattern:

```
/feature/
├── page.tsx                 # Main feature page
├── layout.tsx               # Feature-specific layout
├── /[entityId]/             # Dynamic routes for entity details
│   ├── page.tsx             # Entity detail page
│   └── /sub-feature/        # Nested sub-features
├── /new/                    # Create new entity page
│   └── page.tsx
└── /components/             # Feature-specific components
    ├── entity-form.tsx      # Entity form component
    ├── entity-list.tsx      # Entity list component
    └── entity-detail.tsx    # Entity detail component
```

## Server Actions Architecture

Server actions follow an entity-based organization:

```
/actions/
├── form/                    # Form handling base actions
│   ├── create-form-action.ts
│   └── create-authenticated-form-action.ts
│
└── entity/                  # Entity-specific actions
    ├── client/              # Client entity actions
    │   ├── create.ts
    │   ├── update.ts
    │   ├── delete.ts
    │   ├── list.ts
    │   └── get.ts
    │
    ├── case/                # Case entity actions
    └── ...                  # Other entity actions
```

## Database Package Structure

The database package is organized by entity operations:

```
/packages/database/
└── src/
    └── tenant-app/          # Multi-tenant app database
        ├── schema/          # Database schema
        │   ├── index.ts     # Schema exports
        │   └── ...          # Entity schemas
        │
        ├── operations/      # Database operations by entity
        │   ├── client/      # Client operations
        │   ├── case/        # Case operations
        │   └── ...          # Other entity operations
        │
        ├── migrations/      # Database migrations
        └── config/          # Database configuration
```

## Development Guidelines

### Creating New Features

1. Define the schema in `packages/schema/src/entities/`
2. Create database operations in `packages/database/src/tenant-app/operations/`
3. Create server actions in `apps/app/app/actions/entity/`
4. Create UI components in `apps/app/app/(authenticated)/[feature]/components/`
5. Create pages in `apps/app/app/(authenticated)/[feature]/`

### Component Organization Principles

- **Common Components**: Reusable across multiple features, placed in `/components/`
- **Feature-Specific Components**: Specific to a single feature, placed in `/[feature]/components/`

### Form Implementation

Forms follow a factory pattern with a standardized pipeline:
- Sanitization → Normalization → Validation → Processing
- Comprehensive error handling and analytics tracking
- Authentication via HOC pattern

## Technology Stack

- **Frontend**: Next.js with App Router, React 19, TypeScript
- **UI**: Custom design system based on shadcn/ui
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Clerk
- **Form Handling**: Zod for validation, custom form actions
- **Analytics**: Custom analytics implementation

## Further Documentation

For detailed implementation guides, see the docs application:
- [Forms Guide](/apps/docs/guides/forms-guides.mdx) - Comprehensive guide to our form factory system
- [Server Actions Guide](/apps/docs/guides/server-actions-guide.mdx) - Authentication, error handling, and analytics integration
- [Data Processing Pipeline](/apps/docs/guides/data-processing-pipeline.mdx) - Form data processing architecture
- [Database Operations Guide](/apps/docs/guides/database-operations-guide.mdx) - Best practices for database operations
- [Creating Forms Guide](/apps/docs/guides/creating-forms-guide.mdx) - Step-by-step guide to creating new forms
- [Form Components Guide](/apps/docs/guides/form-components-guide.mdx) - Guide to using and creating reusable form components