'use client';

import { useAdvisoryCasesCount } from '@/app/hook/src';
import { Scale } from 'lucide-react';
import { BaseKPI } from '../shared/base-kpi';

export function AdvisoryCasesKPI() {
  const { data: count, isLoading, error } = useAdvisoryCasesCount();

  return (
    <BaseKPI
      title="Advisory Cases"
      icon={Scale}
      isLoading={isLoading}
      error={error}
      value={count?.toString() ?? '0'}
      description="Active advisory cases"
    />
  );
}
