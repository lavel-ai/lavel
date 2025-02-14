// packages/database/src/tenant-app/utils/tenant-identifier.ts
"use server"; //Important
import { headers } from 'next/headers';
import { env } from '@/env'; // Import env

export const getTenantIdentifier = async (): Promise<string> => { //This is now an async function
  const headersList = await headers();
  const host = headersList.get('host');

  if (!host) {
    throw new Error('Host header not found'); // Still throw if no host at all.
  }

  // Handle both production (yourdomain.com) and development (localhost:3000)
  const appUrlWithoutProtocol = env.NEXT_PUBLIC_APP_URL?.replace(/^https?:\/\//, '');
  const isMainDomain = host === appUrlWithoutProtocol || host === 'localhost:3000';

  if (isMainDomain) {
      // Handle the case where no subdomain is present, you are on the main domain.
      return ""; // Return empty, do not throw.
  }

  // Extract subdomain
  const subdomain = host.split('.')[0];
  return subdomain;
};