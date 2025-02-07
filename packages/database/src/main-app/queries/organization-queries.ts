'server-only';

import { db } from '../db';
import { organizationMembers, organizations } from '../schema';
import { eq } from 'drizzle-orm';

interface DefaultOrganization {
    id: string;
    subdomainSlug: string;
}

/**
 * Fetches the default organization for a user.
 * Currently returns the first organization the user is a member of.
 * In a real application, this could be enhanced to use user preferences or roles.
 */
export async function fetchDefaultOrganizationForUser(userId: string): Promise<DefaultOrganization | null> {
    try {
        // Find the first organization the user is a member of
        const memberOrg = await db.query.organizationMembers.findFirst({
            where: (organizationMembers, { eq }) => eq(organizationMembers.userId, userId),
            with: {
                organization: {
                    columns: {
                        id: true,
                        slug: true,
                    }
                }
            }
        });

        if (!memberOrg?.organization?.slug) {
            return null;
        }

        return {
            id: memberOrg.organization.id,
            subdomainSlug: memberOrg.organization.slug,
        };
    } catch (error) {
        console.error('Error fetching default organization:', error);
        return null;
    }
}

/**
 * Checks if a user is a member of a specific organization
 */
export async function isUserOrganizationMember(userId: string, organizationId: string): Promise<boolean> {
    try {
        const membership = await db.query.organizationMembers.findFirst({
            where: (organizationMembers, { and, eq }) => and(
                eq(organizationMembers.userId, userId),
                eq(organizationMembers.organizationId, organizationId)
            ),
            columns: { id: true }
        });

        return !!membership;
    } catch (error) {
        console.error('Error checking organization membership:', error);
        return false;
    }
}