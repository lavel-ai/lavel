// packages/schema/src/registry.ts
import { z } from 'zod';

export type SchemaInfo = {
  name: string;
  version: string;
  description?: string;
  schema: z.ZodType<any>;
  config?: Record<string, any>;
};

export class SchemaRegistry {
  private schemas = new Map<string, SchemaInfo>();
  
  register(info: SchemaInfo): void {
    const key = `${info.name}@${info.version}`;
    this.schemas.set(key, info);
  }
  
  get(name: string, version = 'latest'): SchemaInfo | undefined {
    if (version === 'latest') {
      // Find latest version
      const allVersions = Array.from(this.schemas.keys())
        .filter(key => key.startsWith(`${name}@`))
        .sort();
        
      return allVersions.length ? this.schemas.get(allVersions[allVersions.length - 1]) : undefined;
    }
    
    return this.schemas.get(`${name}@${version}`);
  }
  
  list(): SchemaInfo[] {
    return Array.from(this.schemas.values());
  }
}

export const schemaRegistry = new SchemaRegistry();