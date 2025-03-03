'use client'

import { Department } from '@repo/database/src/tenant-app/schema/departments-schema';
import { formatDate } from '@/app/utils/format-date';
import { EntityViewTracker } from '@repo/analytics/posthog/components/entity-view-tracker';

interface DepartmentDetailsProps {
  department: Department;
}

export function DepartmentDetails({ department }: DepartmentDetailsProps) {
  return (
    <div>
      {/* Track entity view with analytics */}
      <EntityViewTracker
        entityType="department"
        entityId={department.id}
        properties={{
          has_description: !!department.description
        }}
      />
      
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Department Details</h3>
        </div>
        
        <div className="px-6 py-5">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-gray-500">Name</dt>
              <dd className="mt-1 text-sm text-gray-900">{department.name}</dd>
            </div>
            
            <div>
              <dt className="text-sm font-medium text-gray-500">Created At</dt>
              <dd className="mt-1 text-sm text-gray-900">{formatDate(department.createdAt)}</dd>
            </div>
            
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500">Description</dt>
              <dd className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">
                {department.description || 'No description provided'}
              </dd>
            </div>
          </dl>
        </div>
      </div>
      
      <div className="mt-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Teams in this Department</h3>
        
        {/* Teams would go here - for simplicity, just showing a placeholder */}
        <div className="bg-white shadow-sm rounded-lg px-6 py-5 text-center text-gray-500">
          No teams currently assigned to this department.
        </div>
      </div>
    </div>
  );
}
