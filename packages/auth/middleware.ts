// packages/auth/middleware.ts
// This file is a wrapper around the Clerk middleware.
// It is used to handle authentication and authorization for the application.
// It is used in the apps/app/middleware.ts file to handle authentication and authorization for the application.

export { clerkMiddleware as authMiddleware } from '@clerk/nextjs/server';
