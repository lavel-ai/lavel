/**
 * Shared Validation Module
 * 
 * This module exports UI validation schemas derived from database schemas.
 * It serves as a central repository for form validation across the application.
 * 
 * Import specific schemas:
 * ```
 * import { addressSchema } from '@/shared/validation/schemas/address';
 * ```
 * 
 * Or import everything:
 * ```
 * import * as sharedSchemas from '@/shared/validation';
 * ```
 */

// Re-export all schemas
export * from './schemas/address';
export * from './schemas/client';
export * from './schemas/contact';
export * from './schemas/corporation';

// Re-export common schema utilities
export * from './utils/schema-helpers'; 