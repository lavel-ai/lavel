// packages/schema/src/utils/client.ts
import { schemaRegistry } from '../registry';

/**
 * Performs client-side normalization of data using registered schema
 */
export function clientSideNormalize(entityType: string, data: any, version = 'latest'): any {
  const schemaInfo = schemaRegistry.get(entityType, version);
  
  if (!schemaInfo) {
    console.warn(`Schema not found for entity: ${entityType}`);
    return data;
  }
  
  try {
    // Apply schema transformations
    const result = schemaInfo.schema.parse(data);
    return result;
  } catch (error) {
    console.warn(`Normalization error for ${entityType}:`, error);
    // Return original data if normalization fails
    return data;
  }
}