// packages/schema/src/registry.ts
import { z } from 'zod';

export type FieldConfig = {
  trim?: boolean;
  titleCase?: boolean;
  lowercase?: boolean;
  uppercase?: boolean;
  sanitizeHtml?: boolean;
  maxLength?: number;
  [key: string]: any;
};

export type SchemaInfo = {
  name: string;
  version: string;
  description?: string;
  schema: z.ZodType<any>;
  config?: Record<string, FieldConfig>;
  updateSchema?: z.ZodType<any>;
  defaultValues?: Record<string, any>;
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
  
  registerEntitySchema<T>(options: {
    name: string;
    version?: string;
    description?: string;
    schema: z.ZodSchema<T>;
    config?: Record<string, FieldConfig>;
    updateSchema?: z.ZodSchema<Partial<T>>;
    defaultValues?: Record<string, any>;
  }): void {
    const { 
      name, 
      version = '1.0.0', 
      description, 
      schema, 
      config = {},
      updateSchema,
      defaultValues
    } = options;
    
    // Infer configuration from schema if not explicitly provided
    const inferredConfig: Record<string, FieldConfig> = { ...config };
    
    // Use zod schema to infer default configs
    if (schema instanceof z.ZodObject) {
      const shape = (schema as any)._def.shape();
      
      Object.entries(shape).forEach(([field, def]) => {
        // Skip fields that already have config
        if (inferredConfig[field]) return;
        
        // Create default config
        inferredConfig[field] = {
          trim: typeof shape[field] === 'string', // Default trim for string fields
        };
        
        // Add specific configs based on field type
        if (def instanceof z.ZodString) {
          inferredConfig[field].maxLength = (def as any)._def.maxLength?.value;
        }
      });
    }
    
    // Register the schema with inferred config
    this.register({
      name,
      version,
      description,
      schema,
      config: inferredConfig,
      updateSchema,
      defaultValues
    });
  }
}

export const schemaRegistry = new SchemaRegistry();