'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/design-system/components/ui/tabs';
import { Card } from '@repo/design-system/components/ui/card';
import { useState } from 'react';
import { LitigationTable } from './litigation-table';
import { AdvisoryTable } from './advisory-table';

type CaseType = 'litigation' | 'advisory';

export interface CaseTableContainerProps {
  initialCaseType?: CaseType;
}

export function CaseTableContainer({ initialCaseType = 'litigation' }: CaseTableContainerProps) {
  const [activeTab, setActiveTab] = useState<CaseType>(initialCaseType);

  return (
    <Card className="p-4">
      <Tabs
        defaultValue={initialCaseType}
        onValueChange={(value: string) => setActiveTab(value as CaseType)}
      >
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="litigation">Litigation Cases</TabsTrigger>
            <TabsTrigger value="advisory">Advisory Cases</TabsTrigger>
          </TabsList>
          {/* Toolbar will go here */}
        </div>

        <TabsContent value="litigation" className="mt-4">
          <LitigationTable data={[]} isLoading={false} />
        </TabsContent>

        <TabsContent value="advisory" className="mt-4">
          <AdvisoryTable data={[]} isLoading={false} />
        </TabsContent>
      </Tabs>
    </Card>
  );
} 