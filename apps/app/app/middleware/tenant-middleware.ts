// apps/app/app/middleware/tenant-middleware.ts
import { NextResponse, type NextRequest } from 'next/server';
import { getTenantConnectionUrl } from '@repo/database/src/tenant-app/queries/tenant-lookup';
import { createTenantConnection } from '@repo/database/src/tenant-app/tenant-connection-db';
import * as schema from '@repo/database/src/tenant-app/schema';  // Import your tenant schema
import { env } from '@/env'; // Your environment variable utility

// Extend NextRequest to store the tenant Drizzle client as "tenantDb"
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

  // Correctly remove protocol (http:// or https://) for comparison
  const appUrlWithoutProtocol = env.NEXT_PUBLIC_APP_URL?.replace(/^https?:\/\//, '');
  // Check if it's the main domain (including localhost:3000)
  const isMainDomain = hostname === appUrlWithoutProtocol || hostname === 'localhost:3000';


  const isStaticAsset =
    req.nextUrl.pathname.startsWith('/_next') ||
    req.nextUrl.pathname.startsWith('/static');

  if (isMainDomain || isStaticAsset) {
    return NextResponse.next(); // Proceed without tenant DB setup
  }

  // Extract the subdomain from the hostname (e.g. "tenant-a" from "tenant-a.lavel.ai")
  let subdomain = '';
  if (hostname !== 'localhost:3000') { // {{ Skip split for localhost:3000 }}
    subdomain = hostname.split('.')[0];
  }


  const connectionUrl = await getTenantConnectionUrl(subdomain); // Uses Redis caching
  console.log('connection url', connectionUrl)
  if (!connectionUrl) {
    // Tenant not found, redirect to the main domain (or a 404 page)
    return NextResponse.redirect(new URL('/', env.NEXT_PUBLIC_APP_URL));
  }

  try {
    // Use the dedicated connection helper, passing in the tenant schema.
    // Casting schema as any helps resolve type mismatches.
    const tenantDb = createTenantConnection(connectionUrl, schema);
    console.log('here is the connection', tenantDb)
    req.tenantDb = tenantDb; // Attach the client to the request

    return NextResponse.next();
  } catch (error) {
    console.error('Tenant middleware error (DB connection):', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}