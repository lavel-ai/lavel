'use client'

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getDepartments, deleteDepartment } from '../actions/department-actions';
import { Department } from '@repo/database/src/tenant-app/schema/departments-schema';
import { Button } from '@repo/design-system/components/ui/button';
import { useAnalytics } from '@repo/analytics/posthog/client';

export function DepartmentsList() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const analytics = useAnalytics();
  
  // Load departments
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const result = await getDepartments();
        if (result.success) {
          setDepartments(result.data);
        } else {
          setError(result.error || 'Failed to load departments');
        }
      } catch (err) {
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDepartments();
    
    // Track page view
    analytics.capture('page_viewed', {
      page_name: 'departments_list',
      page_type: 'list'
    });
  }, [analytics]);
  
  // Handle delete
  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }
    
    try {
      const result = await deleteDepartment(id);
      if (result.success) {
        // Remove from local state
        setDepartments(departments.filter(dept => dept.id !== id));
        
        // Track success
        analytics.capture('entity_action_succeeded', {
          entity_type: 'department',
          entity_id: id,
          action_type: 'delete'
        });
      } else {
        setError(result.error || 'Failed to delete department');
        
        // Track failure
        analytics.capture('entity_action_failed', {
          entity_type: 'department',
          entity_id: id,
          action_type: 'delete',
          error_message: result.error
        });
      }
    } catch (err) {
      setError('An unexpected error occurred');
    }
  };
  
  if (loading) {
    return <div className="py-8 text-center">Loading departments...</div>;
  }
  
  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded">
        <p>{error}</p>
        <Button variant="secondary" className="mt-4" onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    );
  }
  
  if (departments.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-lg text-gray-600 mb-4">No departments found</p>
        <Link href="/departments/new">
          <Button variant="default">Create Your First Department</Button>
        </Link>
      </div>
    );
  }
  
  return (
    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Description
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {departments.map(department => (
            <tr key={department.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{department.name}</div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-500 line-clamp-2">
                  {department.description || 'No description'}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end space-x-2">
                  <Link href={`/departments/${department.id}/edit`}>
                    <Button variant="secondary" size="sm">
                      Edit
                    </Button>
                  </Link>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => handleDelete(department.id, department.name)}
                  >
                    Delete
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
