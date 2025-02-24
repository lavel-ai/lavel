"use server";

import { getTenantDbClientUtil } from "@/app/utils/get-tenant-db-connection";
import { users } from "@repo/database/src/tenant-app/schema";
import { profiles } from "@repo/database/src/tenant-app/schema/profiles-schema";
import { teamProfiles } from "@repo/database/src/tenant-app/schema/team-profiles-schema";
import { eq, and, isNotNull } from "drizzle-orm";
import { getInternalUserId } from "@/app/actions/users/users-actions";

export type TeamMemberBasicInfo = {
  id: string;
  email: string;
  imageUrl?: string | null;
  name: string;
  lastName: string;
  role?: string;
  status: boolean | null;
};

/**
 * Retrieves a list of available team members that can be added to a team
 * @returns Array of team members with basic information
 */
export async function getAvailableTeamMembers(): Promise<TeamMemberBasicInfo[]> {
  try {
    const tenantDb = await getTenantDbClientUtil();
    
    // Get current user's internal ID
    const currentUserId = await getInternalUserId();
    if (!currentUserId) {
      throw new Error("User not authenticated");
    }

    // Fetch users and their profiles from tenant database
    const userList = await tenantDb
      .select({
        id: users.id,
        email: users.email,
        imageUrl: users.imageUrl,
        status: users.status,
        name: profiles.name,
        lastName: profiles.lastName,
      })
      .from(users)
      .innerJoin(profiles, eq(users.id, profiles.userId))
      .where(
        and(
          eq(users.status, true),
          isNotNull(profiles.name),
          isNotNull(profiles.lastName)
        )
      );

    return userList;
  } catch (error) {
    console.error("Error fetching available team members:", error);
    throw new Error("Failed to fetch available team members");
  }
}

/**
 * Retrieves team members for a specific team
 * @param teamId - The ID of the team
 * @returns Array of team members with their roles and information
 */
export async function getTeamMembers(teamId: string): Promise<TeamMemberBasicInfo[]> {
  try {
    const tenantDb = await getTenantDbClientUtil();
    
    // Join team_profiles with profiles and users to get complete information
    const teamMembersList = await tenantDb
      .select({
        id: users.id,
        email: users.email,
        imageUrl: users.imageUrl,
        status: users.status,
        name: profiles.name,
        lastName: profiles.lastName,
        role: teamProfiles.role,
      })
      .from(teamProfiles)
      .innerJoin(profiles, eq(teamProfiles.profileId, profiles.id))
      .innerJoin(users, eq(profiles.userId, users.id))
      .where(
        eq(teamProfiles.teamId, teamId)
      );

    return teamMembersList;
  } catch (error) {
    console.error("Error fetching team members:", error);
    throw new Error("Failed to fetch team members");
  }
}

/**
 * Creates a profile for a user if it doesn't exist
 * @param userId - The ID of the user
 * @param name - The name to use for the profile
 * @param lastName - The last name to use for the profile
 * @returns The profile ID
 */
export async function ensureUserProfile(
  userId: string,
  name: string,
  lastName: string
): Promise<string> {
  const tenantDb = await getTenantDbClientUtil();

  // Check if profile exists
  const existingProfile = await tenantDb
    .select({ id: profiles.id })
    .from(profiles)
    .where(eq(profiles.userId, userId))
    .limit(1);

  if (existingProfile.length > 0) {
    return existingProfile[0].id;
  }

  // Create new profile
  const [newProfile] = await tenantDb
    .insert(profiles)
    .values({
      userId,
      name,
      lastName,
      createdBy: userId,
      updatedBy: userId,
    })
    .returning({ id: profiles.id });

  return newProfile.id;
} 