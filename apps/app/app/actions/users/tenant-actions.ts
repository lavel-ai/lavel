// packages/database/src/tenant-app/actions/tenant-actions.ts
"use server";

import { getTenantConnectionUrl } from '@repo/database/src/tenant-app/queries/tenant-lookup';  // Original server-only function

export async function getTenantConnectionUrlAction(subdomain: string): Promise<string | null> {
    return getTenantConnectionUrl(subdomain);
}