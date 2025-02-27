# Schema Validation Rules for data-flow.mdc

The following section should be added to the data-flow.mdc document:

**VI. Schema Architecture and Validation Rules**

1. **Three-Layer Schema Architecture:**
   - **Layer 1: Database Schemas** - Defined in `packages/database/src/tenant-app/schema/`, these are the base schemas that match the database structure.
   - **Layer 2: Shared UI Schemas** - Located in `apps/app/shared/validation/schemas/`, these extend database schemas with common UI validations.
   - **Layer 3: Feature-Specific Schemas** - Located in feature directories, these extend shared schemas with feature-specific validations.

2. **Schema Definition Guidelines:**
   - Create factory functions for configurable schemas (e.g., `createAddressSchema({ requiredFields: true })`)
   - Use Zod's `.extend()` to build on existing schemas rather than redefining them
   - Define appropriate refinements for business rules (e.g., "primary contact must have email")
   - Export both the schema and its TypeScript type (e.g., `export type AddressFormData = z.infer<typeof addressSchema>`)

3. **Schema Normalization:**
   - Use the normalization utilities from `@repo/database/src/tenant-app/utils/normalize/` for data standardization
   - Apply transformations consistently across all layers (database to UI)
   - Define field-specific transformers (e.g., `normalizeClient.legalName`) rather than entity-wide ones

4. **Schema Composition:**
   - Compose complex schemas from simpler ones (e.g., client schema with address and contact arrays)
   - Use array schemas with refinements for relationship validations (e.g., "at least one primary address")
   - When schemas are used across features, place them in the shared layer

5. **Server Action Integration:**
   - Import schemas directly from their source in Server Actions
   - Validate all form data with schemas before processing (e.g., `clientFormSchema.safeParse(formData)`)
   - Transform data using schema transformers before database operations
   - Return validation errors in a consistent format

6. **Form Component Integration:**
   - Use schema types for form state (e.g., `const [formData, setFormData] = useState<ClientFormData>({...})`)
   - Derive form field validations from schemas when using form libraries
   - Use default values from the schema module for form initialization

7. **Schema Evolution:**
   - When adding new fields to a database schema, update all layers accordingly
   - For breaking changes, create migration paths that handle both old and new formats
   - Document schema changes in feature-specific ADRs
   - Consider backward compatibility when updating shared schemas

8. **Testing and Type Safety:**
   - Create unit tests for schema validations, especially for complex business rules
   - Ensure full type inference from database schema to UI components
   - Use TypeScript to catch schema-related errors at compile time
   - Test schema transformations with edge cases and invalid inputs

9. **Troubleshooting Common Schema Issues:**
   - When encountering `partial()` method errors on Zod effects, unwrap the schema first using `.unwrap()`
   - For circular dependencies, extract common types to separate files
   - Use Zod's `.describe()` method to add metadata for UI form generation
   - Leverage Zod's error formatting utilities for consistent error messages 