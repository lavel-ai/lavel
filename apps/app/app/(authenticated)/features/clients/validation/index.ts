import { type ClientFormData, type AddressFormData, type ContactFormData, PaymentTerms } from "./schemas";
import { type ValidationError, type ValidationResult, validatePrimarySelection, validateRequiredFields, createValidationError } from "./utils";

// ============================================================================
// Types
// ============================================================================

export type FieldValidationResult = {
  valid: boolean;
  error: string;
  field?: string;
};

export type TabValidationState = {
  isValid: boolean;
  isDirty: boolean;
  errors: ValidationError[];
};

export type FormValidationState = {
  isValid: boolean;
  isDirty: boolean;
  activeTab: string;
  tabs: Record<string, TabValidationState>;
};

// ============================================================================
// Address Validation
// ============================================================================

export const addressValidation = {
  validateSingle: (address: AddressFormData, index: number): FieldValidationResult[] => {
    const results: FieldValidationResult[] = [];

    if (address.isPrimary) {
      // Validate required fields for primary address
      const requiredFields = ["street", "city", "state", "zipCode", "country"];
      requiredFields.forEach(field => {
        if (!address[field as keyof AddressFormData]) {
          results.push({
            valid: false,
            error: `${field} is required for primary address`,
            field: `addresses.${index}.${field}`
          });
        }
      });
    }

    // Validate coordinates if provided
    if (address.latitude || address.longitude) {
      const hasValidCoords = address.latitude && address.longitude;
      if (!hasValidCoords) {
        results.push({
          valid: false,
          error: "Both latitude and longitude must be provided",
          field: `addresses.${index}`
        });
      }
    }

    return results;
  },

  validateAll: (addresses: AddressFormData[]): FieldValidationResult[] => {
    let results: FieldValidationResult[] = [];

    // Check primary address requirement
    const primaryValidation = validatePrimarySelection(addresses, "addresses");
    if (!primaryValidation.success && primaryValidation.errors) {
      results.push({
        valid: false,
        error: primaryValidation.errors[0].message,
        field: "addresses"
      });
    }

    // Validate each address
    addresses.forEach((address, index) => {
      results = [...results, ...addressValidation.validateSingle(address, index)];
    });

    return results;
  }
};

// ============================================================================
// Contact Validation
// ============================================================================

export const contactValidation = {
  validateSingle: (contact: ContactFormData, index: number): FieldValidationResult[] => {
    const results: FieldValidationResult[] = [];

    if (contact.isPrimary) {
      // Validate required fields for primary contact
      const requiredFields = ["contactName", "email", "primaryPhone"];
      requiredFields.forEach(field => {
        if (!contact[field as keyof ContactFormData]) {
          results.push({
            valid: false,
            error: `${field} is required for primary contact`,
            field: `contactInfo.${index}.${field}`
          });
        }
      });
    }

    // Validate email format if provided
    if (contact.email && !contact.email.includes("@")) {
      results.push({
        valid: false,
        error: "Invalid email format",
        field: `contactInfo.${index}.email`
      });
    }

    return results;
  },

  validateAll: (contacts: ContactFormData[]): FieldValidationResult[] => {
    let results: FieldValidationResult[] = [];

    // Check primary contact requirement
    const primaryValidation = validatePrimarySelection(contacts, "contacts");
    if (!primaryValidation.success && primaryValidation.errors) {
      results.push({
        valid: false,
        error: primaryValidation.errors[0].message,
        field: "contactInfo"
      });
    }

    // Validate each contact
    contacts.forEach((contact, index) => {
      results = [...results, ...contactValidation.validateSingle(contact, index)];
    });

    return results;
  }
};

// ============================================================================
// Billing Validation
// ============================================================================

export const billingValidation = {
  validatePaymentTerms: (terms: string): FieldValidationResult => {
    const isValid = PaymentTerms.safeParse(terms).success;
    return {
      valid: isValid,
      error: isValid ? "" : "Invalid payment terms",
      field: "billing.paymentTerms"
    };
  },

  validateTaxId: (taxId: string, clientType: ClientFormData["clientType"]): FieldValidationResult => {
    const personRFCRegex = /^[A-Z]{4}[0-9]{6}[A-Z0-9]{3}$/;
    const companyRFCRegex = /^[A-Z]{3}[0-9]{6}[A-Z0-9]{3}$/;

    const isValid = clientType === "fisica"
      ? personRFCRegex.test(taxId)
      : companyRFCRegex.test(taxId);

    return {
      valid: isValid,
      error: isValid ? "" : `Invalid RFC format for ${clientType}`,
      field: "billing.taxId"
    };
  },

  validateAll: (data: ClientFormData): FieldValidationResult[] => {
    const results: FieldValidationResult[] = [];

    // Validate payment terms
    if (data.billing?.paymentTerms) {
      results.push(billingValidation.validatePaymentTerms(data.billing.paymentTerms));
    }

    // Validate tax ID
    if (data.billing?.taxId) {
      results.push(billingValidation.validateTaxId(data.billing.taxId, data.clientType));
    }

    // Validate billing email if provided
    if (data.billing?.billingEmail && !data.billing.billingEmail.includes("@")) {
      results.push({
        valid: false,
        error: "Invalid billing email format",
        field: "billing.billingEmail"
      });
    }

    return results;
  }
};

// ============================================================================
// Form Validation
// ============================================================================

export const formValidation = {
  validateTab: (data: ClientFormData, tabName: string): TabValidationState => {
    const errors: ValidationError[] = [];
    let isDirty = false;

    switch (tabName) {
      case "type":
        if (!data.clientType) {
          errors.push(createValidationError("clientType", "Client type is required"));
        }
        isDirty = !!data.clientType;
        break;

      case "general":
        if (data.clientType === "fisica") {
          const personValidation = validateRequiredFields(
            data.personDetails || {},
            ["firstName", "lastName"],
            "personDetails"
          );
          if (!personValidation.success && personValidation.errors) {
            errors.push(...personValidation.errors);
          }
        } else {
          const companyValidation = validateRequiredFields(
            data.companyDetails || {},
            ["name"],
            "companyDetails"
          );
          if (!companyValidation.success && companyValidation.errors) {
            errors.push(...companyValidation.errors);
          }
        }
        isDirty = data.clientType === "fisica" 
          ? !!(data.personDetails?.firstName || data.personDetails?.lastName)
          : !!data.companyDetails?.name;
        break;

      case "contact":
        const contactResults = contactValidation.validateAll(data.contactInfo || []);
        errors.push(...contactResults.map(r => ({
          path: r.field?.split(".") || [],
          message: r.error
        })));
        isDirty = (data.contactInfo || []).length > 0;
        break;

      case "address":
        const addressResults = addressValidation.validateAll(data.addresses || []);
        errors.push(...addressResults.map(r => ({
          path: r.field?.split(".") || [],
          message: r.error
        })));
        isDirty = (data.addresses || []).length > 0;
        break;

      case "billing":
        const billingResults = billingValidation.validateAll(data);
        errors.push(...billingResults.map(r => ({
          path: r.field?.split(".") || [],
          message: r.error
        })));
        isDirty = !!data.billing;
        break;
    }

    return {
      isValid: errors.length === 0,
      isDirty,
      errors
    };
  },

  validateForm: (data: ClientFormData): FormValidationState => {
    const tabs = ["type", "basic", "contact", "address", "billing"];
    const tabStates: Record<string, TabValidationState> = {};
    let isValid = true;
    let isDirty = false;

    tabs.forEach(tab => {
      const tabState = formValidation.validateTab(data, tab);
      tabStates[tab] = tabState;
      isValid = isValid && tabState.isValid;
      isDirty = isDirty || tabState.isDirty;
    });

    return {
      isValid,
      isDirty,
      activeTab: tabs[0],
      tabs: tabStates
    };
  }
};