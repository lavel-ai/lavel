// apps/app/app/utils/tenant-identifier.ts
'use server'; //Important

/**
 * Tenant identification utilities for multi-tenant application.
 * This module provides functionality to determine the current tenant based on the request's hostname,
 * supporting both production (subdomain-based) and development environments.
 */
'use server';
import { env } from '@/env';
import { headers } from 'next/headers';

/**
 * Extracts and returns the tenant identifier from the current request's host header.
 * In a multi-tenant environment, this function determines the current tenant context
 * based on the subdomain of the request.
 *
 * @returns {Promise<string>} A promise that resolves to:
 *   - An empty string ('') if the request is made to the main domain
 *   - The subdomain string if the request is made to a tenant subdomain
 *
 * @throws {Error} Throws an error if the host header is missing from the request
 *
 * @example
 * // On main domain (e.g., example.com)
 * const identifier = await getTenantIdentifier(); // Returns ''
 *
 * // On tenant subdomain (e.g., tenant1.example.com)
 * const identifier = await getTenantIdentifier(); // Returns 'tenant1'
 */
export const getTenantIdentifier = async (): Promise<string> => {
  const headersList = await headers();
  const host = headersList.get('host');

  if (!host) {
    throw new Error('Host header not found');
  }

  // Handle both production (yourdomain.com) and development (localhost:3000)
  const appUrlWithoutProtocol = env.NEXT_PUBLIC_APP_URL?.replace(
    /^https?:\/\//,
    ''
  );
  const isMainDomain =
    host === appUrlWithoutProtocol || host === 'localhost:3000';

  if (isMainDomain) {
    // Handle the case where no subdomain is present, you are on the main domain.
    return '';
  }

  // Extract subdomain
  const subdomain = host.split('.')[0];
  return subdomain;
};
