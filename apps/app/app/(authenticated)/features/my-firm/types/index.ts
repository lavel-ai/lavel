import { ReactNode } from 'react';
import { TeamWithMembers } from '../../../features/teams/actions/team-actions';
import { LawyerProfile } from '../../../features/lawyers/actions/lawyer-actions';

export interface TeamCardProps {
  team: TeamWithMembers;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export interface LawyerCardProps {
  lawyer: LawyerProfile;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  filters?: Record<string, string>;
  onFilterChange?: (filters: Record<string, string>) => void;
}

export interface FilterProps {
  type: 'team' | 'lawyer';
  practiceAreas: string[];
  departments: string[];
  roles: string[];
  onFilterChange: (filters: Record<string, string | undefined>) => void;
}

export interface PaginationResponse<T> {
  data: T[];
  metadata: {
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
  };
}

export interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback: React.ReactNode;
}

export interface LoadingSkeletonProps {
  count?: number;
  type: 'team' | 'lawyer';
}

export interface CreateTeamDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  availableLawyers: LawyerProfile[];
}

export interface SkeletonCardProps {
  type: 'lawyer' | 'team';
  count?: number;
} 