import { z } from "zod";
import {
  clientInsertSchema,
  addressSchema,
  contactSchema,
  corporationInsertSchema,
} from "@repo/database/src/tenant-app/schema";
import { normalizeClient, clientTransformers } from "@repo/database/src/tenant-app/utils/normalize/client";
import { normalizeAddress, addressTransformers } from "@repo/database/src/tenant-app/utils/normalize/address";
import { normalizeContact, contactTransformers } from "@repo/database/src/tenant-app/utils/normalize/contact";

// ============================================================================
// Base Types and Enums
// ============================================================================

export const ClientType = z.enum(["fisica", "moral"]);
export type ClientType = z.infer<typeof ClientType>;

export const Currency = z.enum(["MXN", "USD", "EUR", "CAD"]);
export type Currency = z.infer<typeof Currency>;

export const PaymentTerms = z.enum(["Net 15", "Net 30", "Net 45", "Net 60", "Hourly", "Immediate"]);
export type PaymentTerms = z.infer<typeof PaymentTerms>;

// ============================================================================
// Address Schema
// ============================================================================

export const addressFormSchema = addressSchema.extend({
  street: z.string().min(1, "La calle es requerida").transform(normalizeAddress.street),
  city: z.string().min(1, "La ciudad es requerida").transform(normalizeAddress.city),
  state: z.string().min(1, "El estado es requerido").transform(normalizeAddress.state),
  zipCode: z.string().min(1, "El código postal es requerido").transform(normalizeAddress.zipCode),
  country: z.string().min(1, "El país es requerido").transform(normalizeAddress.country),
  addressType: addressTransformers.addressType,
  placeId: z.string().optional(),
  formattedAddress: z.string().optional(),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  isPrimary: z.boolean().default(false),
  isBilling: z.boolean().default(false),
}).refine(
  (data) => (data.isPrimary ? data.street && data.city && data.state && data.zipCode && data.country : true),
  { message: "La dirección principal debe tener todos los campos requeridos" }
);

export type AddressFormData = z.infer<typeof addressFormSchema>;

// ============================================================================
// Contact Schema
// ============================================================================

export const contactFormSchema = contactSchema.extend({
  contactName: z.string().min(1, "El nombre del contacto es requerido").transform(normalizeContact.contactName),
  email: contactTransformers.email,
  primaryPhone: contactTransformers.primaryPhone,
  secondaryPhone: contactTransformers.secondaryPhone,
  extension: contactTransformers.extension,
  department: contactTransformers.department,
  role: contactTransformers.role,
  addressId: z.string().uuid().optional(),
  isPrimary: z.boolean().default(false),
}).refine(
  (data) => (data.isPrimary ? data.contactName: true),
  { message: "El contacto principal debe tener nombre" }
);

export type ContactFormData = z.infer<typeof contactFormSchema>;

// ============================================================================
// Billing Schema
// ============================================================================

export const billingFormSchema = z.object({
  name: z.string().min(1, "El nombre del cliente es requerido").transform(normalizeClient.legalName),
  rfc: z.string().transform(normalizeClient.taxId),
  billingTerms: PaymentTerms.optional(),
  billingCurrency: Currency.default("MXN"),
  email: contactTransformers.email,

});

export type BillingFormData = z.infer<typeof billingFormSchema>;

// ============================================================================
// Corporation Schema
// ============================================================================

export const corporationFormSchema = corporationInsertSchema.extend({
  name: z.string().min(1, "El nombre de la empresa es requerido").transform(normalizeClient.legalName),
  constitutionDate: z.string().min(1, "La fecha de constitución es requerida"),
  notaryNumber: z.number().nullable(),
  notaryState: z.string().optional().transform(normalizeAddress.state),
  instrumentNumber: z.string().optional(),
  notes: z.string().optional(),
}).refine(
  (data) => !data.rfc || /^[A-Z&Ñ]{3,4}[0-9]{6}[A-Z0-9]{3}$/.test(data.rfc),
  { message: "El formato del RFC es inválido", path: ["rfc"] }
);

export type CorporationFormData = z.infer<typeof corporationFormSchema>;


// ============================================================================
// Team Schema
// ============================================================================




// ============================================================================
// Main Client Form Schema
// ============================================================================

export const clientFormSchema = clientInsertSchema.extend({
  // Type Tab
  clientType: ClientType,

  // Genarl Info Tab
  legalName: z.string().min(1, "El nombre es requerido").transform(normalizeClient.legalName),
  taxId: z.string().max(13, "El RFC debe tener 13 caracteres o menos").optional().transform(normalizeClient.taxId),
  category: z.enum(["litigio", "consultoria", "corporativo", "otros"]).default("otros"),
  isConfidential: z.boolean().default(false),
  status: z.enum(["prospect", "active", "inactive", "archived"]).default("prospect"),
  preferredLanguage: clientTransformers.preferredLanguage.default("es-MX"),
  notes: z.string().optional().transform((value) => value?.trim()),

  // Portal Access
  portalAccess: z.boolean().default(false),
  portalAccessEmail: clientTransformers.portalAccessEmail.optional(),

  // Billing Tab
  billing: billingFormSchema,

  // Related Entities
  addresses: z.array(addressFormSchema).min(1, "Se requiere al menos una dirección").refine(
    (addresses) => addresses.some((addr) => addr.isPrimary),
    "Una dirección debe ser marcada como principal"
  ),
  contactInfo: z.array(contactFormSchema).min(1, "Se requiere al menos un contacto").refine(
    (contacts) => contacts.some((contact) => contact.isPrimary),
    "Un contacto debe ser marcado como principal"
  ),
  corporations: z.array(corporationFormSchema).optional(),

  // Team Assignment
  primaryTeamId: z.string().uuid().optional(),
}).refine(
  (data) => !data.portalAccess || (data.portalAccess && data.portalAccessEmail),
  { message: "El correo de acceso al portal es requerido si el acceso al portal está habilitado", path: ["portalAccessEmail"] }
);

export type ClientFormData = z.infer<typeof clientFormSchema>;

// ============================================================================
// Default Values
// ============================================================================

export const defaultFormValues: Partial<ClientFormData> = {
  clientType: "fisica",
  legalName: "",
  taxId: "",
  category: "otros",
  isConfidential: false,
  status: "prospect",
  preferredLanguage: "es-MX",
  portalAccess: false,
  billing: { name: "", rfc: "", email: "", billingTerms: "Net 30", billingCurrency: "MXN" },
  addresses: [],
  contactInfo: [],
  corporations: [],
};