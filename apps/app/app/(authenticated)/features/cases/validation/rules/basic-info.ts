import type { ValidationResult } from '../../schemas/case-form-schema';
import type { BasicInfoSchema } from '../../schemas/tab-schemas';

export const basicInfoValidation = {
  validateDates: (data: BasicInfoSchema): ValidationResult => {
    if (data.estimatedEndDate && data.startDate > data.estimatedEndDate) {
      return {
        valid: false,
        error: 'Estimated end date must be after start date',
        field: 'estimatedEndDate'
      };
    }
    return { valid: true };
  },

  validateTitle: (data: BasicInfoSchema): ValidationResult => {
    if (data.title.length < 3) {
      return {
        valid: false,
        error: 'Title must be at least 3 characters long',
        field: 'title'
      };
    }
    return { valid: true };
  }
};
