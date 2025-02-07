import { db } from "../db";
import { projects } from "../schema";
import { eq } from "drizzle-orm";


export const getProjectConnection = async (orgId: string) => {
  return db.query.projects.findFirst({
    where: eq(projects.organizationId, orgId),
    columns: { connectionUrl: true }
  });
}; 