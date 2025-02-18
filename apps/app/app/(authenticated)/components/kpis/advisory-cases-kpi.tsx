import { Scale } from 'lucide-react'; // Example icon
import { BaseKPI } from '../shared/base-kpi';
import { getAdvisoryCasesKPI } from '@/app/actions/cases/cases-actions';

const AdvisoryCasesKPI = async () => {
  const { data, status, message } = await getAdvisoryCasesKPI();
  const totalCases = data?.count ?? 0;
  const error = status === 'error' ? message : undefined;

  return (
    <BaseKPI
      title="Advisory Cases"
      icon={Scale}
      value={totalCases}
      isLoading={status !== 'error' && !data}
      error={error}
    />
  );
};

export default AdvisoryCasesKPI; 