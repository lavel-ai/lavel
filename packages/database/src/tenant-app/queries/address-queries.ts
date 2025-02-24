import { Address } from "../schema/addresses-schema";
import { addresses } from "../schema";
import { TenantDatabase } from "../tenant-connection-db";
import { eq, and } from "drizzle-orm";

export async function createAddress(tenantDb: TenantDatabase, address: Address) {
  const result = await tenantDb.insert(addresses).values(address).returning();
  return result[0];
}

export async function getAddressById(tenantDb: TenantDatabase, addressId: string) {
  const result = await tenantDb.select().from(addresses).where(eq(addresses.id, addressId));
  return result[0];
}

export async function updateAddress(tenantDb: TenantDatabase, addressId: string, address: Address) {
  const result = await tenantDb.update(addresses).set(address).where(eq(addresses.id, addressId)).returning();
  return result[0];
}

export async function deleteAddress(tenantDb: TenantDatabase, addressId: string) {
  const result = await tenantDb.delete(addresses).where(eq(addresses.id, addressId));
  return result
}

export async function findExistingAddress(
  tenantDb: TenantDatabase, 
  address: Address) {
  const result = await tenantDb.select().from(addresses).where(
    and(
      eq(addresses.street, address.street),
      eq(addresses.city, address.city),
      eq(addresses.state, address.state),
      eq(addresses.zipCode, address.zipCode)
    )
  );
  return result;
}