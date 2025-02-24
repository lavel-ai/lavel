import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export type FilterType = 'team' | 'lawyer';
export type SortDirection = 'asc' | 'desc';

interface Filters {
  search: string;
  type: FilterType;
  practiceArea?: string;
  department?: string;
  role?: string;
  teamId?: string;
}

interface Pagination {
  page: number;
  limit: number;
  hasMore: boolean;
}

interface Sort {
  field: string;
  direction: SortDirection;
}

interface MyFirmState {
  // State
  filters: Filters;
  pagination: Pagination;
  sort: Sort;
  isLoading: boolean;

  // Actions
  setFilters: (filters: Partial<Filters>) => void;
  setPagination: (pagination: Partial<Pagination>) => void;
  setSort: (sort: Partial<Sort>) => void;
  setIsLoading: (isLoading: boolean) => void;
  resetFilters: () => void;
  resetPagination: () => void;
}

const initialFilters: Filters = {
  search: '',
  type: 'lawyer',
  practiceArea: undefined,
  department: undefined,
  role: undefined,
  teamId: undefined,
};

const initialPagination: Pagination = {
  page: 1,
  limit: 10,
  hasMore: true,
};

const initialSort: Sort = {
  field: 'name',
  direction: 'asc',
};

export const useMyFirmStore = create<MyFirmState>()(
  devtools(
    (set) => ({
      // Initial state
      filters: initialFilters,
      pagination: initialPagination,
      sort: initialSort,
      isLoading: false,

      // Actions
      setFilters: (newFilters) =>
        set(
          {
            filters: { ...initialFilters, ...newFilters },
            pagination: { ...initialPagination }
          },
          false,
          'setFilters'
        ),

      setPagination: (newPagination) =>
        set(
          (state) => ({
            pagination: { ...state.pagination, ...newPagination },
          }),
          false,
          'setPagination'
        ),

      setSort: (newSort) =>
        set(
          (state) => ({
            sort: { ...state.sort, ...newSort },
            pagination: { ...initialPagination },
          }),
          false,
          'setSort'
        ),

      setIsLoading: (isLoading) =>
        set(
          { isLoading },
          false,
          'setIsLoading'
        ),

      resetFilters: () =>
        set(
          {
            filters: initialFilters,
            pagination: initialPagination,
          },
          false,
          'resetFilters'
        ),

      resetPagination: () =>
        set(
          {
            pagination: initialPagination,
          },
          false,
          'resetPagination'
        ),
    }),
    {
      name: 'my-firm-store',
    }
  )
); 