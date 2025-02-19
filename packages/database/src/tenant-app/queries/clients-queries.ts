import { eq } from 'drizzle-orm';
import { clients } from '../schema';
import { TenantDatabase } from '../tenant-connection-db';
import { Client } from '../schema/clients-schema';

export async function getAllClientsByName(tenantDb: TenantDatabase): Promise<{ id: string; name: string } []> {
  return await tenantDb.select({
    id: clients.id,
    name: clients.name, // Select the name
  }).from(clients);
}

export async function getClientById(tenantDb: TenantDatabase, clientId: string): Promise<{ id: string; name: string }> {
  const result = await tenantDb.select({
      id: clients.id,
      name: clients.name, // Select the name
    }).from(clients).where(eq(clients.id, clientId));
  return result[0];
} 