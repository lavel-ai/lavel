// packages/database/src/tenant-app/utils/text-normalization.ts

import { z } from 'zod';

export const normalizeText = {
  uppercase: (text: string | undefined) => text?.toUpperCase().trim() ?? '',
  lowercase: (text: string | undefined) => text?.toLowerCase().trim() ?? '',
  titleCase: (text: string | undefined) => 
    text?.trim()
      .toLowerCase()
      .replace(/\b\w/g, c => c.toUpperCase()) ?? '',
  name: (text: string | undefined) => 
    text?.trim()
      .toLowerCase()
      .replace(/\b\w/g, c => c.toUpperCase()) ?? '',
  phone: (phone: string | undefined) => 
    phone?.replace(/[^\d+()-]/g, '').trim() ?? '', // Keep only digits, +, (, ), and -
};

// Common validation refinements
export const validations = {
  phone: (phone: string) => /^\+?[\d\s-()]{8,}$/.test(phone),
  email: (email: string) => /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email),
};

// Common schema transformers
export const schemaTransformers = {
  name: z.string().transform(normalizeText.name),
  email: z.string().email().transform(normalizeText.lowercase),
  phone: z.string()
    .min(8, "Phone number must be at least 8 characters")
    .transform(normalizeText.phone)
    .refine(validations.phone, "Invalid phone number format"),
  address: {
    street: z.string().min(1, "Street is required").transform(normalizeText.titleCase),
    city: z.string().min(1, "City is required").transform(normalizeText.titleCase),
    state: z.string().min(1, "State is required").transform(normalizeText.uppercase),
    zipCode: z.string().min(1, "Zip code is required").transform(text => text.trim()),
    country: z.string().min(1, "Country is required").transform(normalizeText.titleCase),
  }
}; 