'use client';

import { useWeeklyTimeEntries } from '@/app/hook/src/time-entries';
import { Clock } from 'lucide-react';
import { BaseKPI } from '../shared/base-kpi';

export function WeeklyTimeKPI() {
  const { data, isLoading, error } = useWeeklyTimeEntries();
  const totalHours = data?.totalHours ?? 0;

  return (
    <BaseKPI
      title="Weekly Hours"
      icon={Clock}
      isLoading={isLoading}
      error={error}
      value={`${totalHours.toFixed(1)}h`}
      description="Hours logged this week"
    />
  );
}
