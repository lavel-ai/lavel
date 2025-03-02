'use server';

import { Suspense } from 'react';
import { getPracticeAreas } from '../features/practice-area/actions/get-practice-area';
import { PracticeAreaDashboard } from '../features/practice-area/components/practice-area-dashboard';
import { PracticeAreasSkeleton } from '../features/practice-area/components/skeletons';
import { NewPracticeAreaButton } from '../features/practice-area/components/new-practice-area-button';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/design-system/components/ui/card';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@repo/design-system/components/ui/breadcrumb';
import { Home } from 'lucide-react';

export default async function PracticeAreaPage() {
  // Fetch initial data using Server Action
  const response = await getPracticeAreas();
  
  const initialData = response.status === 'success' 
    ? response.data 
    : [];
  
  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/"><Home className="h-4 w-4" /></BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/practice-area">Áreas de Práctica</BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <h1 className="text-2xl font-bold">Áreas de Práctica</h1>
          <p className="text-gray-500">Gestione las áreas de práctica de su bufete</p>
        </div>
        <NewPracticeAreaButton />
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Áreas de Práctica</CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<PracticeAreasSkeleton />}>
            {/* Pass initial data to Client Component */}
            <PracticeAreaDashboard initialData={initialData} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}