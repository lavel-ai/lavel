// apps/app/middleware.ts
import { authMiddleware } from '@repo/auth/middleware';
import { tenantMiddleware } from './app/middleware/tenant-middleware'; // Import tenantMiddleware
import { NextResponse } from 'next/server';
import {
  noseconeMiddleware,
  noseconeOptions,
  noseconeOptionsWithToolbar,
} from '@repo/security/middleware'; // Keep import for noseconeMiddleware
import { env } from '@/env';

// const securityHeaders = env.FLAGS_SECRET             // {{ Comment out securityHeaders again }}
//   ? noseconeMiddleware(noseconeOptionsWithToolbar)
//   : noseconeMiddleware(noseconeOptions);

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
    '/(api|trpc)(.*)',
  ],
};


export default authMiddleware(async (auth, request) => { // Re-introduce async wrapper
  // Determine the hostname.
  const hostname = request.headers.get('host') || '';
  // Check if the request is on the main domain.

  //Correct Main Domain Check
  const appUrlWithoutProtocol = env.NEXT_PUBLIC_APP_URL?.replace(/^https?:\/\//, '');
  const isMainDomain = hostname === appUrlWithoutProtocol || hostname === 'localhost:3000';

  // Only run tenantMiddleware if we're NOT on the main domain.
  if (!isMainDomain) {
    const tenantResponse = await tenantMiddleware(request);
    if (tenantResponse instanceof NextResponse) {
      return tenantResponse;
    }
  }

  // Finally, add the security headers.          // {{ Keep securityHeaders commented out }}
  // return securityHeaders();
});