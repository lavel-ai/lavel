# Case Table Implementation Plan

## Overview
This document outlines the step-by-step implementation plan for the case management table component. The implementation will support two distinct case types (litigation and advisory) with separate table views, robust filtering capabilities, and server-side pagination for optimal performance.

## Progress

### Completed ✅
1. Phase 1: Directory Structure Setup
   - Created base directory structure for table components
   - Set up root components (CaseTableContainer, LitigationTable, AdvisoryTable)
   - Implemented shared types and interfaces
   - Added proper imports from design system
   - Set up table component structure with tabs

2. Phase 2: Core Table Implementation
   - Implemented basic table structure with TanStack Table
   - Created separate tables for litigation and advisory cases
   - Added column definitions for both table types
   - Implemented row selection with checkboxes
   - Added basic loading and error states
   - Implemented virtual scrolling for performance
   - Added column visibility controls
   - Implemented column resizing
   - Added proper type safety throughout

### In Progress 🚧
1. Phase 3: Data Management
   - Server-side integration setup
   - API endpoints implementation
   - State management setup

### Next Steps 🔜
1. Begin Phase 3: Data Management
   - Setup API endpoints for paginated data fetching
   - Implement server-side state management
   - Add proper loading states and error boundaries

### Upcoming Phases 📅
- Phase 4: Filtering System
- Phase 5: Form Integration
- Phase 6: Performance Optimization
- Phase 7: Accessibility
- Phase 8: Testing
- Phase 9: Documentation

## Technical Decisions Made
1. Using TanStack Table for complex table functionality
2. Leveraging design system components (@repo/design-system)
3. Direct schema type usage from database package
4. Separate table components for different case types
5. Checkbox-based row selection using design system components
6. Virtual scrolling implementation for large datasets
7. Custom ResizeHandle component for column resizing
8. Column visibility management through ColumnManager component

## Current Focus
We are now ready to:
1. Begin implementing the data management layer
2. Set up server-side pagination
3. Implement proper data fetching and caching

## Notes
- Maintain consistent styling with design system
- Ensure proper type safety throughout the implementation
- Consider performance implications for large datasets
- Follow established form rules for consistency

## Phase 1: Directory Structure Setup
### 1.1 Table Component Structure
```
components/
├── table/
│   ├── root/
│   │   ├── CaseTableContainer.tsx  # Container managing tabs and table states
│   │   ├── LitigationTable.tsx     # Litigation-specific table
│   │   ├── AdvisoryTable.tsx       # Advisory-specific table
│   │   └── types.ts               # Shared types and interfaces
│   ├── columns/
│   │   ├── litigation/           # Litigation-specific columns
│   │   │   ├── index.ts
│   │   │   ├── cells/
│   │   │   └── headers/
│   │   ├── advisory/            # Advisory-specific columns
│   │   │   ├── index.ts
│   │   │   ├── cells/
│   │   │   └── headers/
│   │   └── shared/             # Shared column components
│   ├── toolbar/
│   │   ├── Toolbar.tsx         # Main toolbar component
│   │   ├── SearchBar.tsx       # Search implementation
│   │   ├── FilterBar.tsx       # Filter implementation
│   │   └── ViewToggle.tsx      # Toggle between case types
│   ├── filters/
│   │   ├── FilterPopover.tsx    # Filter UI container
│   │   ├── TeamFilter.tsx       # Team-based filtering
│   │   ├── LocationFilter.tsx   # State/City/Courthouse filtering
│   │   ├── DateFilter.tsx       # Date range filtering
│   │   ├── ClientFilter.tsx     # Client/Corporation filtering
│   │   └── FilterForm.tsx       # Combined filter form
│   └── card/
│       └── CaseFormCard.tsx     # Card component for case form
```

### 1.2 Supporting Structure
```
├── hooks/
│   ├── table/
│   │   ├── use-case-table.ts     # Table management hook
│   │   ├── use-table-filters.ts  # Filter management
│   │   ├── use-pagination.ts     # Server-side pagination
│   │   └── use-table-search.ts   # Search functionality
├── store/
│   └── table/
│       ├── table-store.ts        # Shared table state
│       ├── filter-store.ts       # Filter state management
│       └── pagination-store.ts   # Pagination state
├── api/
│   └── table/
│       ├── fetch-cases.ts        # API integration for cases
│       ├── fetch-filters.ts      # API for filter options
│       └── types.ts             # API types
```

## Phase 2: Core Table Implementation
### 2.1 Basic Table Setup
1. Implement `CaseTableContainer.tsx` with tab navigation
2. Create base table components for both case types
3. Setup virtual scrolling
4. Implement basic row selection

### 2.2 Column Configuration
1. Define shared column types and interfaces
2. Implement type-specific columns:
   - Litigation: Include litigation-specific fields
   - Advisory: Include advisory-specific fields
3. Setup column visibility controls
4. Add column resizing capabilities

## Phase 3: Data Management
### 3.1 Database Queries (@repo/database)
1. Create query functions in `@repo/database/src/tenant-app/queries/cases-queries.ts`:
   ```typescript
   export async function getCases(
     tenantDb: DrizzleClient,
     options: {
       pageIndex: number;
       pageSize: number;
       filters?: CaseFilterState;
       sorting?: SortingState;
     }
   ) {
     // Drizzle query implementation
   }

   export async function getCaseCount(
     tenantDb: DrizzleClient,
     filters?: CaseFilterState
   ) {
     // Count query for pagination
   }

   export async function getCaseFilterOptions(
     tenantDb: DrizzleClient
   ) {
     // Fetch filter options (teams, attorneys, etc.)
   }
   ```

### 3.2 Server Actions
1. Create actions in `app/actions/cases/case-actions.ts`:
   ```typescript
   'use server'
   
   export async function fetchCasesAction(options: FetchCasesOptions) {
     // 1. Auth check
     const { userId } = await auth();
     if (!userId) throw new Error('Unauthorized');

     // 2. Get tenant DB client
     const tenantDb = await getTenantDbClientUtil();

     // 3. Call query functions
     const [cases, totalCount] = await Promise.all([
       getCases(tenantDb, options),
       getCaseCount(tenantDb, options.filters)
     ]);

     // 4. Return data
     return { cases, totalCount };
   }
   ```

### 3.3 Component Integration
1. Update CaseTableContainer:
   - Make it a Server Component
   - Fetch initial data using Server Action
   - Pass data to child Client Components

2. Update Table Components:
   - Keep as Client Components for interactivity
   - Receive data as props
   - Use Server Actions for data updates
   - Implement optimistic updates

3. State Management:
   - Use Zustand for client-side state
   - Implement stores for:
     - Pagination state
     - Filter state
     - Sorting state
     - Selection state

### 3.4 Error Handling
1. Implement error boundaries
2. Add loading states
3. Handle edge cases

## Phase 4: Filtering System
### 4.1 Core Filters
1. Implement filter components for:
   - Team/Lead Attorney assignment
   - Location (State/City/Courthouse)
   - Date ranges
   - Client/Corporation
2. Setup filter persistence
3. Add URL-based filter state

### 4.2 Search and View Options
1. Create search bar with server-side search
2. Implement view toggles (litigation/advisory)
3. Add quick filters for common scenarios
4. Setup filter combinations

## Phase 5: Form Integration
### 5.1 Card Component
1. Create card container for form
2. Implement form state management
3. Setup form validation
4. Add loading states

### 5.2 Table Integration
1. Handle form submission updates
2. Implement optimistic updates
3. Setup error handling
4. Add success notifications

## Phase 6: Performance Optimization
1. Implement component memoization
2. Setup proper re-render boundaries
3. Optimize data fetching
4. Add performance monitoring

## Phase 7: Accessibility
1. Add ARIA labels
2. Implement keyboard navigation
3. Setup screen reader support
4. Add focus management

## Phase 8: Testing
1. Setup unit tests for hooks
2. Add component tests
3. Implement integration tests
4. Setup E2E tests

## Phase 9: Documentation
1. Add component documentation
2. Create usage examples
3. Document best practices
4. Setup Storybook stories

## Updated Directory Structure

```
features/cases/
├── actions/
│   └── case-actions.ts      # Server Actions
├── components/
│   └── table/              # [Previous structure remains]
├── hooks/
│   └── table/
│       ├── use-case-table.ts
│       └── use-table-state.ts
└── store/
    └── table/
        └── table-store.ts   # Zustand store
```

## Implementation Order (Updated)
1. Create database queries in @repo/database
2. Implement Server Actions
3. Update components to use Server Actions
4. Implement client-side state management
5. Add error handling and loading states

## Technical Decisions (Updated)
1. Server Components for data fetching
2. Server Actions for data mutations
3. Zustand for client-side state
4. Drizzle for type-safe queries
5. Error boundaries for error handling

## Current Focus
1. Create database query functions
2. Implement Server Actions
3. Update components to use new data flow

## Notes
- Follow Server Action rules strictly
- Implement proper error handling
- Use TypeScript throughout
- Keep components focused and maintainable
- Consider caching strategies
- Follow tenant isolation principles

## Implementation Order and Dependencies
1. Phase 1 → Phase 2: Setup structure and basic tables
2. Phase 2 → Phase 3: Implement server-side data management
3. Phase 3 → Phase 4: Add filtering capabilities
4. Phase 4 → Phase 5: Integrate form functionality
5. Phases 6-9: Incremental improvements

## Success Criteria
- Efficient server-side pagination handling large datasets
- Seamless switching between case types
- Fast filter response times
- Responsive form integration
- 90%+ test coverage
- Documented component API

## Next Steps
1. Create directory structure
2. Setup base components
3. Implement tab navigation
4. Create basic table structure

## Notes
- Ensure efficient server-side pagination
- Implement proper data caching
- Consider filter combinations performance
- Maintain consistent UX between tables
- Follow established form rules 