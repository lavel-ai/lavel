import { initializeFormArchitecture } from '@repo/schema/src/init';

// Call initialization immediately when this module is imported
console.log('Starting schema initialization...');
initializeFormArchitecture();
console.log('Schema initialization complete');

// Export a dummy function to prevent tree-shaking
export function ensureSchemaInitialization() {
  // This function exists just to ensure this module is imported
  return true;
}