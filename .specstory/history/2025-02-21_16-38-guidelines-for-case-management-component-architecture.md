## SpecStory

## Guidelines for Case Management Component Architecture (2/21/2025, 4:38:15 PM)

_**User**_

@README.md just like we came upo with this readme, i want to come up with one now for components where we will diplay the data to the user. 

Lets take as an example the @case-schema.ts @litigation-details-schema.ts 

Right now we will only focus on creating the guidelines so that we later on focus on creating such components. 

the idea is to design the arcthitecture we need to take in order to have  a structured scalable app and not creating multiple instances of the same code all over the place. 

take into account the provided readme file and also the structure of our app @app 

Lastly here is the use case for this case table: 

our app is an ai app for lawyers as we discuss in our general readme @README.md 

the main feature in here we will display a table where the users will be able to see their cases.user will be able to: 

- filter cases by different filters e.g. state, team ssigned to, lead lawyer, "only" my trials depending on the user if he is a lead lawyer or maybe part of a team. all cases, by trial or advisory etc... 
- users will be able to do inline edits to the cases showcased in the table, something like notion, no need to clikc a btn to edit then a save btn, it has to be extremely intuitive. 
- once the user selects a case then it would redirect to the specifics of that case. in that page we would show another set of components

this is the main idea so far. 


---

_**Assistant**_

I'll help create a comprehensive README for the components architecture, focusing on the case management UI. Let me analyze the requirements and create a structured approach.

First, let me search for any existing component patterns in the codebase.

---

_****_

<details>
            <summary>Searched codebase "component patterns or component architecture in app directory" • **25** results</summary>
        
| File | Lines |
|------|-------|
| `apps/app/app/(authenticated)/features/clients/README.md` | L1-60 |
| `apps/app/app/(authenticated)/features/clients/README.md` | L151-242 |
| `apps/app/app/(authenticated)/components/header.tsx` | L1-17 |
| `apps/app/app/(authenticated)/components/shared/base-kpi.tsx` | L1-17 |
| `apps/app/app/actions/components/component-settings-actions.ts` | Lundefined-undefined |
| `apps/app/app/(authenticated)/components/search.tsx` | L1-26 |
| `apps/app/app/(authenticated)/components/sidebar.tsx` | L1-29 |
| `apps/app/app/(unauthenticated)/layout.tsx` | L1-9 |
| `apps/app/app/(authenticated)/components/shared/animated-card.tsx` | L1-8 |
| `apps/app/app/(authenticated)/features/clients/components/company-form.tsx` | L88-90 |
| `apps/app/app/(authenticated)/features/clients/components/address-form.tsx` | L34-40 |
| `apps/app/app/(authenticated)/features/clients/README.md` | L60-151 |
| `apps/app/app/layout.tsx` | L1-9 |
| `apps/app/app/(authenticated)/components/kpis/dashboard-grid.tsx` | Lundefined-undefined |
| `apps/app/app/(authenticated)/components/header.tsx` | L17-43 |
| `apps/app/app/(authenticated)/components/kpis/advisory-cases-kpi.tsx` | L1-19 |
| `apps/app/app/(authenticated)/features/clients/components/billing-info-form.tsx` | L157-160 |
| `apps/app/app/(authenticated)/components/comboboxes/countries-combobox.tsx` | L1-16 |
| `apps/app/app/(authenticated)/layout.tsx` | L1-21 |
| `apps/app/app/(authenticated)/components/kpis/litigation-cases-kpi.tsx` | L1-19 |
| `apps/app/app/(authenticated)/page.tsx` | L26-58 |
| `apps/app/app/(authenticated)/features/shared/components/upload-area/index.ts` | L1-1 |
| `apps/app/app/(authenticated)/components/comboboxes/client-combobox.tsx` | L88-90 |
| `apps/app/app/(authenticated)/page.tsx` | L1-26 |
| `apps/app/app/(authenticated)/features/shared/components/upload-area/upload-area.tsx` | L9-22 |

</details>

---

_****_



Based on the search results and the requirements, I'll create a comprehensive README for the case management components architecture. Let me create this in a structured way that aligns with our existing patterns while addressing the specific needs of the case management UI.

Here's the README I'll propose:

```markdown
# Case Management UI Architecture

This document outlines our approach to building scalable and maintainable UI components for case management, with a focus on data display, inline editing, and navigation.

## Directory Structure

```
features/cases/
├── components/               # UI Components
│   ├── table/               # Table-related components
│   │   ├── columns.tsx      # Column definitions
│   │   ├── filters.tsx      # Filter components
│   │   ├── toolbar.tsx      # Table toolbar (search, filters, etc.)
│   │   └── inline-edit/     # Inline editing components
│   ├── details/             # Case detail components
│   │   ├── header.tsx       # Case detail header
│   │   ├── tabs.tsx         # Navigation tabs
│   │   └── sections/        # Different sections of case details
│   └── shared/              # Shared components
├── hooks/                   # Custom hooks
│   ├── use-case-table.ts    # Table management hook
│   ├── use-case-filters.ts  # Filter management hook
│   └── use-inline-edit.ts   # Inline editing hook
├── store/                   # State management
│   └── case-store.ts        # Global case state
├── api/                     # API integration
│   └── case-api.ts          # API calls and mutations
└── utils/                   # Utility functions
    └── filters.ts           # Filter utilities
```

## 1. Table Component Architecture

### Core Principles
- Use TanStack Table for complex table functionality
- Implement virtual scrolling for large datasets
- Support column customization and persistence
- Enable inline editing with optimistic updates

```typescript
// components/table/columns.tsx
export const columns: ColumnDef<Case>[] = [
  {
    id: 'title',
    header: 'Case Title',
    cell: ({ row }) => <InlineEditCell row={row} field="title" />,
    filterFn: 'text',
  },
  // ... other columns
];

// hooks/use-case-table.ts
export function useCaseTable() {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    // ... other features
  });

  return {
    table,
    // ... other utilities
  };
}
```

## 2. Filtering System

### Key Features
- Support multiple filter types (select, multi-select, date range)
- Save filter preferences
- URL-based filter state
- Debounced search

```typescript
// hooks/use-case-filters.ts
export function useCaseFilters() {
  const [filters, setFilters] = useState<CaseFilters>({
    status: [],
    assignedTeam: [],
    leadAttorney: [],
    dateRange: null,
  });

  // Filter logic and state management
  return {
    filters,
    updateFilters,
    resetFilters,
    // ... other utilities
  };
}
```

## 3. Inline Editing

### Implementation Guidelines
- Use controlled components for edit state
- Implement optimistic updates
- Handle validation inline
- Support keyboard navigation
- Auto-save on blur or enter

```typescript
// hooks/use-inline-edit.ts
export function useInlineEdit<T extends keyof Case>(
  initialValue: Case[T],
  field: T,
  caseId: string
) {
  // Edit state management
  // Validation logic
  // API integration
  return {
    value,
    isEditing,
    startEdit,
    handleChange,
    handleBlur,
    // ... other utilities
  };
}
```

## 4. State Management

### Core Principles
- Use Zustand for global state
- Implement optimistic updates
- Handle error states
- Support undo/redo

```typescript
// store/case-store.ts
export const useCaseStore = create<CaseStore>((set) => ({
  cases: [],
  filters: initialFilters,
  updateCase: async (id, data) => {
    // Optimistic update logic
  },
  // ... other actions
}));
```

## 5. Performance Optimization

### Strategies
1. **Virtual Scrolling**
   - Implement for large datasets
   - Handle dynamic row heights
   - Maintain scroll position

2. **Memoization**
   - Memoize expensive computations
   - Use React.memo for pure components
   - Implement proper dependency arrays

3. **Data Fetching**
   - Implement cursor-based pagination
   - Cache results
   - Prefetch next page

## 6. Error Handling

### Implementation
1. **Inline Errors**
   - Show validation errors inline
   - Handle API errors gracefully
   - Support retry mechanisms

2. **Global Errors**
   - Use error boundaries
   - Implement toast notifications
   - Log errors appropriately

## 7. Accessibility

### Requirements
- Implement ARIA labels
- Support keyboard navigation
- Maintain focus management
- Provide screen reader context

## 8. Testing Strategy

### Test Types
1. **Unit Tests**
   ```typescript
   test("inline edit handles validation", () => {
     const { result } = renderHook(() => useInlineEdit());
     // Test edit behavior
   });
   ```

2. **Integration Tests**
   ```typescript
   test("filters update table data", () => {
     render(<CaseTable />);
     // Test filter interaction
   });
   ```

3. **E2E Tests**
   ```typescript
   test("complete case management flow", () => {
     // Test full user journey
   });
   ```

## 9. Component Examples

### Table Implementation
```typescript
export function CaseTable() {
  const { table } = useCaseTable();
  const { filters } = useCaseFilters();

  return (
    <DataTable
      table={table}
      columns={columns}
      filters={filters}
      onRowClick={handleRowClick}
    />
  );
}
```

### Inline Edit Cell
```typescript
export function InlineEditCell({ row, field }: InlineEditCellProps) {
  const { value, isEditing, startEdit, handleChange } = useInlineEdit(
    row.original[field],
    field,
    row.original.id
  );

  return isEditing ? (
    <EditableInput
      value={value}
      onChange={handleChange}
      // ... other props
    />
  ) : (
    <div onDoubleClick={startEdit}>{value}</div>
  );
}
```

## When to Use This Pattern

Use this pattern when you need:
- Complex data table interactions
- Inline editing capabilities
- Advanced filtering and sorting
- Performance with large datasets
- Accessibility compliance

## When Not to Use

For simple data displays, use a basic table component:
```typescript
function SimpleTable({ data }: SimpleTableProps) {
  return <Table data={data} columns={simpleColumns} />;
}
```

This architecture provides a scalable foundation for building complex case management interfaces while maintaining code organization and performance.
```

This README provides a comprehensive guide for building the case management UI components. It follows the existing patterns in the codebase while adding specific patterns for handling the complex requirements of case management.

The architecture is designed to be:
1. Scalable - Supporting large datasets and complex interactions
2. Maintainable - Clear separation of concerns and reusable patterns
3. Performant - Implementing virtual scrolling and optimizations
4. User-friendly - Supporting intuitive inline editing and filtering
5. Accessible - Following best practices for keyboard navigation and screen readers

Would you like me to elaborate on any specific part of this architecture or proceed with implementing specific components?

---

_**User**_

where did u saved this readme ?

---

_**Assistant**_

I haven't saved the README yet - I only proposed its content. Let me help you save it in the appropriate location.

Looking at our app structure and following the patterns we see in other features (like the clients feature), we should create this README in a new cases feature directory.

Let me create the directory and save the README:

---

_****_

<details>
            <summary>Listed directory apps/app/app/(authenticated)/features • **4** results</summary>
        
| Name |
|-------|
| 📁 `shared` |
| 📁 `cases` |
| 📁 `clients` |
| 📁 `corporations` |

</details>

---

_****_



I see we already have a `cases` directory in the features folder. Let me save the README there:

---

_****_

```diff
- 
+ # Case Management UI Architecture
+ 
+ This document outlines our approach to building scalable and maintainable UI components for case management, with a focus on data display, inline editing, and navigation.
+ 
+ ## Directory Structure
+ 
+ ```
+ features/cases/
+ ├── components/               # UI Components
+ │   ├── table/               # Table-related components
+ │   │   ├── columns.tsx      # Column definitions
+ │   │   ├── filters.tsx      # Filter components
+ │   │   ├── toolbar.tsx      # Table toolbar (search, filters, etc.)
+ │   │   └── inline-edit/     # Inline editing components
+ │   ├── details/             # Case detail components
+ │   │   ├── header.tsx       # Case detail header
+ │   │   ├── tabs.tsx         # Navigation tabs
+ │   │   └── sections/        # Different sections of case details
+ │   └── shared/              # Shared components
+ ├── hooks/                   # Custom hooks
+ │   ├── use-case-table.ts    # Table management hook
+ │   ├── use-case-filters.ts  # Filter management hook
+ │   └── use-inline-edit.ts   # Inline editing hook
+ ├── store/                   # State management
+ │   └── case-store.ts        # Global case state
+ ├── api/                     # API integration
+ │   └── case-api.ts          # API calls and mutations
+ └── utils/                   # Utility functions
+     └── filters.ts           # Filter utilities
+ ```
+ 
+ ## 1. Table Component Architecture
+ 
+ ### Core Principles
+ - Use TanStack Table for complex table functionality
+ - Implement virtual scrolling for large datasets
+ - Support column customization and persistence
+ - Enable inline editing with optimistic updates
+ 
+ ```typescript
+ // components/table/columns.tsx
+ export const columns: ColumnDef<Case>[] = [
+   {
+     id: 'title',
+     header: 'Case Title',
+     cell: ({ row }) => <InlineEditCell row={row} field="title" />,
+     filterFn: 'text',
+   },
+   // ... other columns
+ ];
+ 
+ // hooks/use-case-table.ts
+ export function useCaseTable() {
+   const table = useReactTable({
+     data,
+     columns,
+     getCoreRowModel: getCoreRowModel(),
+     getFilteredRowModel: getFilteredRowModel(),
+     getPaginationRowModel: getPaginationRowModel(),
+     // ... other features
+   });
+ 
+   return {
+     table,
+     // ... other utilities
+   };
+ }
+ ```
+ 
+ ## 2. Filtering System
+ 
+ ### Key Features
+ - Support multiple filter types (select, multi-select, date range)
+ - Save filter preferences
+ - URL-based filter state
+ - Debounced search
+ 
+ ```typescript
+ // hooks/use-case-filters.ts
+ export function useCaseFilters() {
+   const [filters, setFilters] = useState<CaseFilters>({
+     status: [],
+     assignedTeam: [],
+     leadAttorney: [],
+     dateRange: null,
+   });
+ 
+   // Filter logic and state management
+   return {
+     filters,
+     updateFilters,
+     resetFilters,
+     // ... other utilities
+   };
+ }
+ ```
+ 
+ ## 3. Inline Editing
+ 
+ ### Implementation Guidelines
+ - Use controlled components for edit state
+ - Implement optimistic updates
+ - Handle validation inline
+ - Support keyboard navigation
+ - Auto-save on blur or enter
+ 
+ ```typescript
+ // hooks/use-inline-edit.ts
+ export function useInlineEdit<T extends keyof Case>(
+   initialValue: Case[T],
+   field: T,
+   caseId: string
+ ) {
+   // Edit state management
+   // Validation logic
+   // API integration
+   return {
+     value,
+     isEditing,
+     startEdit,
+     handleChange,
+     handleBlur,
+     // ... other utilities
+   };
+ }
+ ```
+ 
+ ## 4. State Management
+ 
+ ### Core Principles
+ - Use Zustand for global state
+ - Implement optimistic updates
+ - Handle error states
+ - Support undo/redo
+ 
+ ```typescript
+ // store/case-store.ts
+ export const useCaseStore = create<CaseStore>((set) => ({
+   cases: [],
+   filters: initialFilters,
+   updateCase: async (id, data) => {
+     // Optimistic update logic
+   },
+   // ... other actions
+ }));
+ ```
+ 
+ ## 5. Performance Optimization
+ 
+ ### Strategies
+ 1. **Virtual Scrolling**
+    - Implement for large datasets
+    - Handle dynamic row heights
+    - Maintain scroll position
+ 
+ 2. **Memoization**
+    - Memoize expensive computations
+    - Use React.memo for pure components
+    - Implement proper dependency arrays
+ 
+ 3. **Data Fetching**
+    - Implement cursor-based pagination
+    - Cache results
+    - Prefetch next page
+ 
+ ## 6. Error Handling
+ 
+ ### Implementation
+ 1. **Inline Errors**
+    - Show validation errors inline
+    - Handle API errors gracefully
+    - Support retry mechanisms
+ 
+ 2. **Global Errors**
+    - Use error boundaries
+    - Implement toast notifications
+    - Log errors appropriately
+ 
+ ## 7. Accessibility
+ 
+ ### Requirements
+ - Implement ARIA labels
+ - Support keyboard navigation
+ - Maintain focus management
+ - Provide screen reader context
+ 
+ ## 8. Testing Strategy
+ 
+ ### Test Types
+ 1. **Unit Tests**
+    ```typescript
+    test("inline edit handles validation", () => {
+      const { result } = renderHook(() => useInlineEdit());
+      // Test edit behavior
+    });
+    ```
+ 
+ 2. **Integration Tests**
+    ```typescript
+    test("filters update table data", () => {
+      render(<CaseTable />);
+      // Test filter interaction
+    });
+    ```
+ 
+ 3. **E2E Tests**
+    ```typescript
+    test("complete case management flow", () => {
+      // Test full user journey
+    });
+    ```
+ 
+ ## 9. Component Examples
+ 
+ ### Table Implementation
+ ```typescript
+ export function CaseTable() {
+   const { table } = useCaseTable();
+   const { filters } = useCaseFilters();
+ 
+   return (
+     <DataTable
+       table={table}
+       columns={columns}
+       filters={filters}
+       onRowClick={handleRowClick}
+     />
+   );
+ }
+ ```
+ 
+ ### Inline Edit Cell
+ ```typescript
+ export function InlineEditCell({ row, field }: InlineEditCellProps) {
+   const { value, isEditing, startEdit, handleChange } = useInlineEdit(
+     row.original[field],
+     field,
+     row.original.id
+   );
+ 
+   return isEditing ? (
+     <EditableInput
+       value={value}
+       onChange={handleChange}
+       // ... other props
+     />
+   ) : (
+     <div onDoubleClick={startEdit}>{value}</div>
+   );
+ }
+ ```
+ 
+ ## When to Use This Pattern
+ 
+ Use this pattern when you need:
+ - Complex data table interactions
+ - Inline editing capabilities
+ - Advanced filtering and sorting
+ - Performance with large datasets
+ - Accessibility compliance
+ 
+ ## When Not to Use
+ 
+ For simple data displays, use a basic table component:
+ ```typescript
+ function SimpleTable({ data }: SimpleTableProps) {
+   return <Table data={data} columns={simpleColumns} />;
+ }
+ ```
+ 
+ This architecture provides a scalable foundation for building complex case management interfaces while maintaining code organization and performance. 
```

---

_****_



I've saved the README.md file in the `apps/app/app/(authenticated)/features/cases/` directory. This location follows our existing pattern, as seen with the clients feature that also has its own README.md.

Now that we have our architecture documented, we can start implementing the components following this structure. Would you like to:

1. Create the directory structure as outlined in the README?
2. Start implementing specific components (like the table or filters)?
3. Review and refine the architecture further?

Let me know which direction you'd like to take next!

---



---

