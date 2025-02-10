// apps/app/app/middleware/tenant-middleware.ts

import { NextResponse, type NextRequest } from 'next/server';
import { getTenantConnectionUrl } from '@repo/database/src/tenant-app/queries/tenant-lookup';
import { createTenantConnection } from '@repo/database/src/tenant-app/tenant-connection-db';
import * as schema from '@repo/database/src/tenant-app/schema';
import { env } from '@/env';

declare module 'next/server' {
  interface NextRequest {
    tenantDb?: ReturnType<typeof createTenantConnection>;
  }
}

export async function tenantMiddleware(req: NextRequest) {
  const hostname = req.headers.get('host');

  if (!hostname) {
    return new NextResponse('No hostname found', { status: 400 });
  }

  // 1. Determine if it's the main app domain (app.lavel.ai or localhost:3000)
  const appDomain = env.NEXT_PUBLIC_APP_URL?.replace(/^https?:\/\//, ''); // Remove protocol
  const isMainAppDomain = hostname === appDomain || hostname === 'localhost:3000';

  // 2.  Bypass tenant logic for main app domain and static assets
  const isStaticAsset = req.nextUrl.pathname.startsWith('/_next') || req.nextUrl.pathname.startsWith('/static');

  if (isMainAppDomain || isStaticAsset) {
    console.log(`[Tenant Middleware] Main app domain or static asset. Bypassing tenant logic. Hostname: ${hostname}`);
    return NextResponse.next(); // Proceed without tenant DB setup
  }

  // 3. Extract the subdomain (tenant identifier)
  //    For tenant-a.app.lavel.ai, we want "tenant-a"
  const subdomain = hostname.split('.')[0];  //  Gets "tenant-a"

  console.log(`[Tenant Middleware] Subdomain: ${subdomain}, Hostname: ${hostname}`);

  // 4. Get the tenant's database connection URL (using caching)
  const connectionUrl = await getTenantConnectionUrl(subdomain);

  if (!connectionUrl) {
    console.warn(`[Tenant Middleware] No connection URL found for subdomain: ${subdomain}`);
    // Redirect to the main application or a 404 page
    return NextResponse.redirect(new URL('/', env.NEXT_PUBLIC_APP_URL));
  }

  // 5. Create the tenant-specific Drizzle client and attach it to the request
  try {
    const tenantDb = createTenantConnection(connectionUrl, schema);
    req.tenantDb = tenantDb;
    console.log(`[Tenant Middleware] Tenant DB connection established for: ${subdomain}`);
    return NextResponse.next();
  } catch (error) {
    console.error('[Tenant Middleware] Error connecting to tenant DB:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}