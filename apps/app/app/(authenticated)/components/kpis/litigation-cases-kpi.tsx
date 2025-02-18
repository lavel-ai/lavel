import { Gavel } from 'lucide-react'; // Example icon
import { BaseKPI } from '../shared/base-kpi';
import { getLitigationCasesKPI } from '@/app/actions/cases/cases-actions';

const LitigationCasesKPI = async () => {
  const { data, status, message } = await getLitigationCasesKPI();
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