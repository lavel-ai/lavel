// apps/app/app/(authenticated)/components/dashboard/litigation-cases-kpi.tsx
import { Gavel } from 'lucide-react';
import { BaseKPI } from '../shared/base-kpi';
import { getLitigationCasesKPI } from '@/app/actions/cases/cases-actions';
import { getComponentSettings } from '@/app/actions/components/component-settings-actions';

interface LitigationCasesKPIProps {
  instanceId: string;
}

const LitigationCasesKPI = async ({ instanceId }: LitigationCasesKPIProps) => {
  // Get component settings
  const settings = await getComponentSettings('litigation-cases-kpi', instanceId);
  const filter = settings?.settings?.filter || { type: 'all' }; // Default to all

  const { data, status, message } = await getLitigationCasesKPI(filter);
  const totalCases = data?.count ?? 0;
  const error = status === 'error' ? message : undefined;

  return (
    <BaseKPI
      title="Litigation Cases"
      icon={Gavel}
      value={totalCases}
      isLoading={status !== 'error' && !data}
      error={error}
    />
  );
};

export default LitigationCasesKPI;