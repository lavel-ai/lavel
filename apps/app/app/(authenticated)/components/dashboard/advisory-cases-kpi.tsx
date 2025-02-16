// 'use client';

// import { useAdvisoryCasesCount } from '@/app/hook/src';
// import { Scale } from 'lucide-react';
// import { BaseKPI } from '../shared/base-kpi';

import { BookOpen } from 'lucide-react'; // Example icon
import { BaseKPI } from '../shared/base-kpi';
import { getAdvisoryCasesKPI } from '@/app/actions/cases/cases-actions';
import { getComponentSettings } from '@/app/actions/components/component-settings-actions';

interface AdvisoryCasesKPIProps {
    instanceId: string;
}

const AdvisoryCasesKPI = async ({instanceId}: AdvisoryCasesKPIProps) => {
    // Get component settings
    const settings = await getComponentSettings('advisory-cases-kpi', instanceId);
    const filter = settings?.settings?.filter || { type: 'all' }; // Default to "all"

    const { data, status, message } = await getAdvisoryCasesKPI(filter);
    const totalCases = data?.count ?? 0;
    const error = status === 'error' ? message : undefined;

    return (
        <BaseKPI
            title="Advisory Cases"
            icon={BookOpen}
            value={totalCases}
            isLoading={status !== 'error' && !data}
            error={error}
        />
    );
};

export default AdvisoryCasesKPI;
