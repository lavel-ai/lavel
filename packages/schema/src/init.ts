// packages/schema/src/init.ts
import './entities/practice-area';
// Import other entity schemas

import { schemaRegistry } from './registry';

export function initializeFormArchitecture() {
  // Debug schema registry
  const schemas = schemaRegistry.list();
  console.log('Schema registry contains:', schemas.length, 'schemas');
  
  // Log each registered schema
  schemas.forEach(schema => {
    console.log(`- Registered schema: ${schema.name}@${schema.version}`);
  });
  
  // Explicitly check for practice area schema
  const practiceAreaSchema = schemaRegistry.get('practiceArea');
  console.log('Practice area schema found:', !!practiceAreaSchema);
  
  console.log('Form architecture initialized');
}