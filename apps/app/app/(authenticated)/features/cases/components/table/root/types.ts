import { type Case } from '@repo/database/src/tenant-app/schema/case-schema';

export type CaseType = 'litigation' | 'advisory';

export interface CaseTableProps {
  data: Case[];
  isLoading?: boolean;
  error?: Error;
}

export interface CaseFilterState {
  team?: string[];
  leadAttorney?: string[];
  state?: string[];
  city?: string[];
  courthouse?: string[];
  dateRange?: {
    from: Date;
    to: Date;
  };
  client?: string[];
  corporation?: string[];
}

export interface CasePaginationState {
  pageSize: number;
  pageIndex: number;
  totalCount: number;
}

export interface CaseTableState extends CaseFilterState {
  pagination: CasePaginationState;
  sorting: {
    id: string;
    desc: boolean;
  }[];
}

export interface CaseTableAction {
  type: 
    | 'SET_FILTERS' 
    | 'RESET_FILTERS' 
    | 'SET_PAGINATION' 
    | 'SET_SORTING';
  payload: Partial<CaseTableState>;
}

// Column definition types
export interface BaseCaseColumn {
  id: string;
  header: string;
  accessorKey: keyof Case;
  enableSorting?: boolean;
  enableFiltering?: boolean;
}

export interface CaseColumnMeta {
  isNumeric?: boolean;
  isDate?: boolean;
  isStatus?: boolean;
  filterType?: 'select' | 'multi-select' | 'date-range' | 'text';
} 