'use client';

import { useLitigationCasesCount } from '@/app/hook/src/cases';
import { Gavel } from 'lucide-react';
import { BaseKPI } from '../shared/base-kpi';

export function LitigationCasesKPI() {
  const { data: count, isLoading, error } = useLitigationCasesCount();

  return (
    <BaseKPI
      title="Litigation Cases"
      icon={Gavel}
      isLoading={isLoading}
      error={error}
      value={count?.toString() ?? '0'}
      description="Active litigation cases"
    />
  );
}
