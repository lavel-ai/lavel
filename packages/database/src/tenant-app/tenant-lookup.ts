import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { projects, organizations } from '../main-app/schema';
import { keys } from '../../keys';
import { db } from '../main-app/db';

// Simple in-memory cache for connection URLs
const tenantConnectionCache = new Map<string, string>();

/**
 * Looks up the database connection URL for a tenant by their subdomain.
 * Uses the main application database to find the organization and its associated project.
 * Implements caching to reduce database lookups.
 */
export async function getTenantConnectionUrl(subdomain: string): Promise<string | null> {
    // Check cache first
    if (tenantConnectionCache.has(subdomain)) {
        return tenantConnectionCache.get(subdomain) || null;
    }

    try {
        // Find organization by subdomain
        const organization = await db.query.organizations.findFirst({
            where: (organizations, { eq }) => eq(organizations.slug, subdomain),
            columns: { id: true }
        });

        if (!organization) {
            return null; // Organization not found
        }

        // Find associated project with connection URL
        const project = await db.query.projects.findFirst({
            where: (projects, { eq }) => eq(projects.organizationId, organization.id),
            columns: { connectionUrl: true }
        });

        const connectionUrl = project?.connectionUrl || null;

        // Cache the result if found
        if (connectionUrl) {
            tenantConnectionCache.set(subdomain, connectionUrl);
        }

        return connectionUrl;
    } catch (error) {
        console.error("Error looking up tenant connection URL:", error);
        return null;
    }
}

/**
 * Clears the connection URL cache for a specific tenant
 */
export function clearTenantConnectionCache(subdomain: string): void {
    tenantConnectionCache.delete(subdomain);
}

/**
 * Clears the entire connection URL cache
 */
export function clearAllTenantConnectionCaches(): void {
    tenantConnectionCache.clear();
} 