// packages/schema/src/evolution/schema-versions.ts
import { z } from 'zod';
import { schemaRegistry } from '../registry';

export interface SchemaVersion<T> {
  version: string;
  validFrom: Date;
  validTo?: Date;
  schema: z.ZodSchema<T>;
  migrations?: Array<{
    fromVersion: string;
    transform: (data: any) => any;
  }>;
}

export class SchemaVersionManager {
  private versions: Map<string, Map<string, SchemaVersion<any>>> = new Map();

  registerVersion<T>(entityType: string, version: SchemaVersion<T>): void {
    if (!this.versions.has(entityType)) {
      this.versions.set(entityType, new Map());
    }
    
    this.versions.get(entityType)!.set(version.version, version);
  }

  getVersion<T>(entityType: string, version: string): SchemaVersion<T> | undefined {
    return this.versions.get(entityType)?.get(version) as SchemaVersion<T> | undefined;
  }

  getCurrentVersion<T>(entityType: string): SchemaVersion<T> | undefined {
    const entityVersions = this.versions.get(entityType);
    if (!entityVersions) return undefined;

    // Find the most recent version that's currently valid
    const now = new Date();
    
    return Array.from(entityVersions.values())
      .filter(v => 
        v.validFrom <= now && (!v.validTo || v.validTo > now)
      )
      .sort((a, b) => 
        new Date(b.validFrom).getTime() - new Date(a.validFrom).getTime()
      )[0] as SchemaVersion<T> | undefined;
  }

  async migrateData(
    data: any, 
    entityType: string, 
    fromVersion: string, 
    toVersion: string
  ): Promise<any> {
    const entityVersions = this.versions.get(entityType);
    if (!entityVersions) {
      throw new Error(`Unknown entity type: ${entityType}`);
    }

    // If same version, no migration needed
    if (fromVersion === toVersion) return data;

    // Get target version
    const targetVersion = entityVersions.get(toVersion);
    if (!targetVersion) {
      throw new Error(`Unknown target version: ${toVersion}`);
    }

    // Find migration path
    const migration = targetVersion.migrations?.find(m => m.fromVersion === fromVersion);
    if (!migration) {
      throw new Error(`No migration path from ${fromVersion} to ${toVersion}`);
    }

    // Apply migration
    return migration.transform(data);
  }
}

export const schemaVersionManager = new SchemaVersionManager();

// Register team schema versions
schemaVersionManager.registerVersion('team', {
  version: '1.0.0',
  validFrom: new Date('2025-01-01'),
  schema: teamSchema,
});

// Example of a new version with migration
const teamSchemaV2 = teamSchema.extend({
  tags: z.array(z.string()).optional(),
});

schemaVersionManager.registerVersion('team', {
  version: '1.1.0',
  validFrom: new Date('2025-03-01'),
  schema: teamSchemaV2,
  migrations: [
    {
      fromVersion: '1.0.0',
      transform: (data) => ({
        ...data,
        tags: [], // Initialize with empty tags array
      }),
    },
  ],
});

// Helper to get current schema version
export function getCurrentSchema<T>(entityType: string): z.ZodSchema<T> {
  const version = schemaVersionManager.getCurrentVersion<T>(entityType);
  if (!version) {
    throw new Error(`No current version found for entity type: ${entityType}`);
  }
  return version.schema;
}