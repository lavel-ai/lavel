import type { ValidationResult } from '../../schemas/case-form-schema';
import type { CaseTypeSchema } from '../../schemas/tab-schemas';

export const caseTypeValidation = {
  validateCaseType: (data: CaseTypeSchema): ValidationResult => {
    if (!data.type) {
      return {
        valid: false,
        error: 'Case type is required',
        field: 'type'
      };
    }

    return { valid: true };
  }
};
