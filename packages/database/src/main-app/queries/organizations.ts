import { eq } from "drizzle-orm";
import { db } from "../db";
import { organizationMembers } from "../schema/organizations-members-schema";

export const findUserOrganization = async (userId: string) => {
  return db.query.organizationMembers.findFirst({
    where: eq(organizationMembers.userId, userId),
    with: {
      organization: true
    }
  });
}; 