# Client Feature Architecture Decision Record

## Schema Centralization Strategy

### Context
Our client management feature currently has schema definitions spread across multiple locations:
- Database schemas in `packages/database/src/tenant-app/schema/`
- UI validation schemas in `apps/app/app/(authenticated)/features/clients/validation/schemas/index.ts`
- Action-specific schemas in `apps/app/app/(authenticated)/features/clients/actions/client-form-actions.ts`

This leads to duplication, maintenance overhead, and potential inconsistencies when schemas need to be updated.

### Decision
We will implement a "single source of truth" approach for schema definitions:

1. **Base Schemas**: All base schemas will remain in the database package (`packages/database/src/tenant-app/schema/`)
2. **UI/Form Schemas**: 
   - We will create a central schema factory in `apps/app/app/(authenticated)/features/clients/validation/schema-factory.ts`
   - This factory will extend the database schemas with UI-specific validations, error messages, and transformations
   - It will leverage the existing normalization utilities from `@repo/database/src/tenant-app/utils/normalize/`

3. **Schema Composition**: 
   - The factory will export composable schemas (addressForm, contactForm, etc.)
   - Forms can import specific schemas they need
   - Server actions will import the same schemas, ensuring consistency

### Benefits
- **Single Source of Truth**: Schema definitions are derived from a single source
- **Enhanced Type Safety**: Full type inference from database to UI
- **Better Error Messages**: UI-specific error messages while maintaining database constraints
- **Easier Maintenance**: Changes to database schema automatically propagate to UI
- **Composability**: Schemas can be combined and extended for specific use cases

### Implementation Plan
1. Create a central schema factory for deriving UI schemas from database schemas
2. Update the validation folder to use the new factory
3. Migrate server actions to use the same schemas
4. Eliminate duplicated schema definitions

### Considerations
- We need to ensure that UI transformations don't conflict with database constraints
- Some UI fields may not directly map to database fields (e.g., nested objects)
- We should maintain clear separation between validation logic and UI display logic


# Evolution: Application-wide Schema Repository

### Context
After implementing the feature-level schema factory, we recognized that several entities (clients, contacts, addresses) are used across multiple features. This creates potential for duplication and inconsistency if each feature maintains its own schema definitions.

### Decision
We will evolve our schema architecture to include a shared, application-wide schema repository:

1. **Three-Layer Schema Architecture**:
   - **Layer 1: Database Schemas** - Base schemas in `packages/database/src/tenant-app/schema/`
   - **Layer 2: Shared UI Schemas** - Common UI schemas in `apps/app/shared/validation/schemas/`
   - **Layer 3: Feature-Specific Schemas** - Feature-specific extensions in feature directories

2. **Repository Structure**:
   ```
   apps/app/shared/validation/
   ├── schemas/
   │   ├── address.ts#
   │   ├── client.ts
   │   ├── contact.ts
   │   └── ...
   ├── utils/
   │   └── schema-helpers.ts
   └── index.ts
   ```

3. **Composition Pattern**:
   - Shared schemas will provide factory functions for common use cases
   - Features can import and extend shared schemas with specific validations
   - Features should not duplicate schema logic that belongs at the shared level

### Benefits
- **Maximum Reusability**: Core entities like contacts can be reused across features
- **Consistent User Experience**: Validation messages and behaviors are consistent
- **Reduced Maintenance**: Updates to common schemas happen in one place
- **Clear Responsibility Boundaries**: Feature-specific logic remains in features

### Implementation Plan
1. Create the shared validation directory structure
2. Move common schema definitions (address, contact, etc.) to the shared layer
3. Update feature schema factories to compose from shared schemas
4. Update imports in components and actions to use the appropriate schema level

### Considerations
- Migration should be gradual to avoid breaking existing functionality
- Feature teams should collaborate on shared schema definitions
- We need to balance flexibility and standardization in the shared schemas
- Documentation should clearly explain when to use shared vs. feature-specific schemas

## Schema Management Rules

The following rules should be added to the data-flow.mdc document to ensure consistent schema management across the application:

### **VI. Schema Architecture and Validation Rules**

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

