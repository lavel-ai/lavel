/**
 * Schema Mappers
 * 
 * Utility functions to map between UI schema values and database schema values.
 * This handles the different enums used in the UI vs DB layers.
 */

import { type Client } from '@repo/database/src/tenant-app/schema/clients-schema';
import { CompletedClientFormData } from '../validation/schema-factory';

/**
 * Maps client category from UI to DB
 */
export const mapCategoryToDb = (uiCategory: string | undefined): 'litigio' | 'consultoria' | 'corporativo' | 'otros' => {
  if (uiCategory && ['litigio', 'consultoria', 'corporativo', 'otros'].includes(uiCategory)) {
    return uiCategory as 'litigio' | 'consultoria' | 'corporativo' | 'otros';
  }
  return 'otros'; // Default
};

/**
 * Transforms the client form data to match the database schema structure
 * Handles all necessary mappings between UI and DB values
 */
export function transformClientFormToDb(
  formData: CompletedClientFormData | Partial<CompletedClientFormData>, 
  userId: string
): Omit<Client, 'id' | 'createdAt' | 'updatedAt'> {
  return {
    clientType: formData.clientType || 'fisica',
    legalName: formData.legalName || '',
    taxId: formData.taxId || '',
    industry: formData.industry || '',
    category: mapCategoryToDb(formData.category),
    isConfidential: formData.isConfidential || false,
    preferredLanguage: formData.preferredLanguage || 'es-MX',
    notes: formData.notes || null,
    status: formData.status || 'prospecto', // Use Spanish status directly
    leadLawyerId: formData.leadLawyerId || null,
    portalAccess: false, // Temporarily disabled
    portalAccessEmail: null, // Temporarily disabled
    billingName: formData.billing?.name || null,
    billingEmail: formData.billing?.email || null,
    billingRfc: formData.billing?.rfc || null,
    billingTerms: formData.billing?.billingTerms || null,
    billingCurrency: formData.billing?.billingCurrency || 'MXN',
    createdBy: userId,
    updatedBy: userId,
    deletedAt: null,
    deletedBy: null,
  };
}