// apps/app/middleware.ts
import { authMiddleware } from '@repo/auth/middleware';
import { NextResponse } from 'next/server';
import {
  noseconeMiddleware,
  noseconeOptions,
  noseconeOptionsWithToolbar,
} from '@repo/security/middleware';
import { env } from '@/env';

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
    '/(api|trpc)(.*)',
  ],
};

const securityHeaders = env.FLAGS_SECRET
  ? noseconeMiddleware(noseconeOptionsWithToolbar)
  : noseconeMiddleware(noseconeOptions);

export default authMiddleware(async (_auth, request) => {
  // Add security headers FIRST
  const response = securityHeaders();

  // Check for auth and run remaining middleware

  return response;
});