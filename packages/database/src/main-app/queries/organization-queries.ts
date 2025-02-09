// packages/database/src/main-app/queries/organization-queries.ts

import { db } from '../db';
import { eq, and } from 'drizzle-orm';
import { organizations, organizationMembers, projects, users } from '../schema';

export async function fetchUserOrganization(clerkUserId: string): Promise<{ slug: string; connectionUrl: string | null; } | null> {
    try {
        // 1. Find the user by Clerk ID
        const user = await db.query.users.findFirst({
            where: eq(users.clerkId, clerkUserId),
            columns: { id: true }, // We only need the user's ID
        });

        if (!user) {
            console.log(`User with Clerk ID ${clerkUserId} not found.`);
            return null;
        }

        // 2. Find the organization membership using the user's ID
        const membership = await db.query.organizationMembers.findFirst({
            where: eq(organizationMembers.userId, user.id),
            with: {
                organization: {
                    columns: {
                        slug: true, // Get the subdomain slug
                    },
                    with: {
                      projects: {
                        limit: 1, //just need one
                        columns:{
                          connectionUrl: true
                        }
                      }
                    }
                },

            },
        });

        if (!membership || !membership.organization) {
            console.log(`User ${user.id} is not a member of any organization.`);
            return null;
        }

        if(!membership.organization.projects[0]?.connectionUrl){
            console.log(`Organization ${membership.organization.slug} has no projects (or no connectionUrl).`);
            return {
              slug: membership.organization.slug!,
              connectionUrl: null, // Or handle differently, like redirect to an error page.
          };
        }

        return {
            slug: membership.organization.slug!,
            connectionUrl: membership.organization.projects[0].connectionUrl
        };

    } catch (error) {
        console.error('Error fetching organization for user:', error);
        return null;
    }
}

// Keep this, it might be useful later
export async function isUserOrganizationMember(userId: string, organizationId: string): Promise<boolean> {
    // ... (same as before)
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