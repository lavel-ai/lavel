import { eq } from 'drizzle-orm';
import { corporations } from '../schema';
import { Corporation } from '../schema/corporations-schema';
import { TenantDatabase } from '../tenant-connection-db';

export async function getAllCorporationsByName(
    tenantDb: TenantDatabase
): Promise<Corporation[]> 
{
  return await tenantDb.select({
    id: corporations.id,
    name: corporations.name, 
  })
  .from(corporations);
}

export async function getCorporationById(
  tenantDb: TenantDatabase, 
  corporationId: string
): Promise<{ id: string; name: string }> 

{
  const result = await tenantDb
    .select({
      id: corporations.id,
      name: corporations.name, 
    })
    .from(corporations)
    .where(eq(corporations.id, corporationId));
  return result[0];
}

