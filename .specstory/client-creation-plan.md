# Client Creation Plan

This document outlines the step-by-step process for creating a client in the application, including handling billing addresses and multiple contacts with their addresses.  It reflects the updated database schema using separate tables for addresses and contacts, and join tables for the relationships.

## 1. User Interface (Client-Side)

*   **Component:** `apps/app/app/(authenticated)/components/clients/client-form.tsx`
*   **Form Library:** `react-hook-form`
*   **Form Fields:**
    *   `clientType`: (enum: 'person' or 'company') - Determines which fields are displayed (`PersonForm` or `CompanyForm`).
    *   `name`: (string) - Client's name (company name or person's first name).
    *   `parentLastName`, `maternalLastName`: (string, optional) - For persons only.
    *   `billingAddress`: (object) -  The client's billing address.  *Not nested*.
        *   `street`: (string)
        *   `city`: (string)
        *   `state`: (string)
        *   `zipCode`: (string)
        *   `country`: (string) - Uses `CountryCombobox`.
    *   `taxId`: (string)
    *   `billingEmail`: (string)
    *   `paymentTerms`: (string)
    *   `preferredCurrency`: (string)
    *   `contactInfo`: (array) - Array of contact objects. Uses `useFieldArray`.  *Each contact can have its own address*.
        *   `contactName`: (string)
        *   `primaryPhone`: (string)
        *   `secondaryPhone`: (string, optional)
        *   `email`: (string)
        *   `preferredContactMethod`: (string)
        *   `address`: (object) -  The *contact's* address. *Not nested*.
            *   `street`: (string)
            *   `city`: (string)
            *   `state`: (string)
            *   `zipCode`: (string)
            *   `country`: (string) - Uses `CountryCombobox`.
    *   `corporationId`: (string, optional) - Uses `CorporationCombobox`.
    *   `referredBy`: (string, optional)

*   **Form Submission:**
    *   The `onSubmit` handler in `client-form.tsx` is triggered.
    *   `react-hook-form`'s `handleSubmit` function:
        *   Validates the form data against the `combinedClientSchema` (which extends `clientInsertSchema` and includes address and contact schemas).
        *   If validation passes, it calls the `createClient` server action with the validated form data.

## 2. Server Action (`createClient`)

*   **File:** `apps/app/app/actions/clients/clients-actions.ts`
*   **Purpose:** Handles server-side client creation logic, including database interactions.
*   **Steps:**
    1.  **Authentication:**
        *   Checks for user authentication via `auth()`.
        *   Returns an error if unauthenticated.
    2.  **Database Connection:**
        *   Gets a tenant-specific database client with `getTenantDbClientUtil()`.
    3.  **Data Validation (Server-Side):**
        *   Re-validates the received data using `clientInsertSchema.safeParse(formData)`.  *Crucial for security*.
        *   Returns an error if validation fails.
    4.  **Billing Address Creation (if provided):**
        *   If `billingAddress` exists in the form data:
            *   Inserts the `billingAddress` into the `addresses` table using `tenantDb.insert(addresses)`.
            *   Gets the newly created `billingAddressId`.
            *   Sets `createdBy` and `updatedBy`.
    5.  **Client Creation:**
        *   Inserts the main client data (excluding `billingAddress` and `contactInfo`, but *including* `billingAddressId` if it exists) into the `clients` table using `tenantDb.insert(clients)`.
        *   Gets the newly created `clientId`.
        *   Sets `createdBy` and `updatedBy`.
    6.  **Contact and Address Creation (Loop, if provided):**
        *   If `contactInfo` exists and is not empty:
            *   Iterates through each `contact` object in the `contactInfo` array.
            *   **Contact Address Creation (if provided):**
                *   If `contact.address` exists:
                    *   Inserts the `contact.address` into the `addresses` table using `tenantDb.insert(addresses)`.
                    *   Gets the newly created `contactAddressId`.
                    *   Sets `createdBy` and `updatedBy`.
            *   **Contact Creation:**
                *   Inserts the contact data (excluding the nested `address`, but *including* `contactAddressId` if it exists) into the `contacts` table using `tenantDb.insert(contacts)`.
                *   Gets the newly created `contactId`.
                *   Sets `createdBy` and `updatedBy`.
            *   **Client-Contact Link (Join Table):**
                *   Inserts a record into the `client_contacts` join table using `tenantDb.insert(clientContacts)`.
                *   Uses the `clientId` and the newly created `contactId`.
                *   Sets `createdBy` and `updatedBy`.
            *   **Client-Contact Address Link (Join Table, if address exists):**
                *   If a `contactAddressId` was created for this contact:
                    *   Inserts a record into the `client_addresses` join table using `tenantDb.insert(clientAddresses)`.
                    *   Uses the `clientId` and the `contactAddressId`.
                    *   Sets `createdBy` and `updatedBy`.
    7.  **Client-Billing Address Link (Join Table, if address exists):**
        *   If a `billingAddressId` was created:
            *   Inserts a record into the `client_addresses` join table using `tenantDb.insert(clientAddresses)`.
            *   Uses the `clientId` and the `billingAddressId`.
            *   Sets `isBilling: true` to distinguish the billing address.
            *   Sets `createdBy` and `updatedBy`.
    8.  **Return Value:**
        *   Returns a `status` ('success' or 'error') and a `message`.
        *   On success, includes the newly created client's data.
    9.  **Revalidation:**
        *   Calls `revalidatePath('/clients')` to update the Next.js cache.

## 3. Database Schema

*   **Tables:**
    *   `clients`: Stores core client information (e.g., `name`, `clientType`, `billingAddressId`).
    *   `addresses`: Stores address information (for both clients and contacts).  Has a unique `id`.
    *   `contacts`: Stores contact information (e.g., `contactName`, `email`, `addressId`).
    *   `client_addresses`: Join table for the many-to-many relationship between clients and addresses.  Includes `clientId`, `addressId`, `isBilling` (boolean), `createdBy`, `updatedBy`.
    *   `client_contacts`: Join table for the many-to-many relationship between clients and contacts. Includes `clientId`, `contactId`, `createdBy`, `updatedBy`.

*   **Relationships:**
    *   Clients and Addresses: Many-to-many (via `client_addresses`). A client can have multiple addresses (billing, contact addresses), and an address can be associated with multiple clients (though less common in this specific use case).
    *   Clients and Contacts: Many-to-many (via `client_contacts`). A client can have multiple contacts, and a contact can be associated with multiple clients.

## 4. Code Files

*   **UI:**
    *   `apps/app/app/(authenticated)/components/clients/client-form.tsx`
    *   `apps/app/app/(authenticated)/components/clients/billing-info-form.tsx`
    *   `apps/app/app/(authenticated)/components/clients/contact-info-form.tsx`
    *   `apps/app/app/(authenticated)/components/clients/company-form.tsx`
    *   `apps/app/app/(authenticated)/components/clients/person-form.tsx`
    *   `apps/app/app/(authenticated)/components/comboboxes/countries-combobox.tsx`
    *   `apps/app/app/(authenticated)/components/comboboxes/corporation-combobox.tsx`
     *   `apps/app/app/(authenticated)/clients/page.tsx`

*   **Server Action:**
    *   `apps/app/app/actions/clients/clients-actions.ts`

*   **Database Schema:**
    *   `packages/database/src/tenant-app/schema/clients-schema.ts`
    *   `packages/database/src/tenant-app/schema/addresses-schema.ts`
    *   `packages/database/src/tenant-app/schema/contacts-schema.ts`
    *   `packages/database/src/tenant-app/schema/client-addresses-schema.ts`
    *   `packages/database/src/tenant-app/schema/client-contacts-schema.ts`
* **Tests:**
    *   `apps/app/app/actions/clients/clients-actions.test.ts`

## 5. Testing

*   **Server Action (`createClient`):**
    *   Handles valid and invalid form data (using the Zod schema).
    *   Creates records in all relevant tables: `clients`, `addresses`, `contacts`, `client_addresses`, `client_contacts`.
    *   Handles cases with and without billing addresses.
    *   Handles cases with and without contacts.
    *   Handles cases where contacts have and don't have addresses.
    *   Handles authentication failures (user not logged in).
    *   Handles database errors gracefully.
*   **UI Components:**
    *   Form validation works correctly (all required fields, data types).
    *   Conditional fields based on `clientType` (person vs. company) are displayed correctly.
    *   Nested forms (billing address, contact info) are correctly handled by `react-hook-form`.
    *   `useFieldArray` works correctly for multiple contacts.
    *   Comboboxes (Country, Corporation) function and set values correctly.

This updated plan accurately reflects the changes in the database schema and provides a clear, step-by-step guide for client creation, including comprehensive testing considerations. 