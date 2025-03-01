// apps/app/app/(authenticated)/departments/page.tsx
import { Suspense } from 'react';
import { Building } from 'lucide-react';
import { CreateDepartmentDialog } from '../features/department/components/create-department-dialog';
import { DepartmentsList } from '../features/department/components/departments-list';
import { DepartmentsListSkeleton } from '../features/department/components/departments-list-skeleton';
import { getDepartments } from '../features/department/actions/get-departments';

export default async function DepartmentsPage() {
  // Fetch initial departments data from server action
  const response = await getDepartments();
  
  const initialDepartments = response.status === 'success' 
    ? response.data 
    : [];
    
  return (
    <section className="space-y-3 mt-6">
      <div className="flex items-center justify-between border-b pb-2">
        <div className="flex items-center gap-1.5">
          <Building className="h-4 w-4 text-primary" />
          <h2 className="font-bold text-base">Departments</h2>
        </div>
        <CreateDepartmentDialog />
      </div>
      
      <Suspense fallback={<DepartmentsListSkeleton />}>
        {/* Pass initial data to Client Component */}
        <DepartmentsList initialDepartments={initialDepartments} />
      </Suspense>
    </section>
  );
}
