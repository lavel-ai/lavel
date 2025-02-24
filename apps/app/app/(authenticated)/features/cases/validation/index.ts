import { caseTypeValidation } from './rules/case-type';
import { basicInfoValidation } from './rules/basic-info';
import type { CaseFormData, ValidationResult } from '../schemas/case-form-schema';

export const validation = {
  caseType: caseTypeValidation,
  basicInfo: basicInfoValidation,

  validateForm: (data: CaseFormData): ValidationResult[] => {
    const results: ValidationResult[] = [];

    // Case Type Validation
    const caseTypeResult = caseTypeValidation.validateCaseType(data);
    if (!caseTypeResult.valid) results.push(caseTypeResult);

    // Basic Info Validation
    const dateResult = basicInfoValidation.validateDates(data);
    if (!dateResult.valid) results.push(dateResult);

    const titleResult = basicInfoValidation.validateTitle(data);
    if (!titleResult.valid) results.push(titleResult);

    // Add other validations as needed

    return results;
  }
};
