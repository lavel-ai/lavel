'use client';

import { useState } from 'react';
import { useDepartments } from '../hooks/use-departments';
import { DepartmentCard } from './department-card';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@repo/design-system/components/ui/alert';
import type { Department } from '../actions/get-departments';

interface DepartmentsListProps {
  initialDepartments?: Department[];
}

export function DepartmentsList({ initialDepartments }: DepartmentsListProps) {
  const { departments, isLoading, isError, error } = useDepartments(initialDepartments);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string | null>(null);
  
  // Handlers
  const handleEditDepartment = (id: string) => {
    setSelectedDepartmentId(id);
    // Show edit dialog/drawer (to be implemented)
  };
  
  const handleDeleteDepartment = (id: string) => {
    // Show confirmation dialog and delete department (to be implemented)
  };
  
  // Error state
  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {error instanceof Error ? error.message : 'Failed to load departments'}
        </AlertDescription>
      </Alert>
    );
  }
  
  // Empty state
  if (!isLoading && departments.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No hay departamentos disponibles</p>
      </div>
    );
  }
  
  // Loaded state
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {departments.map((department) => (
        <DepartmentCard
          key={department.id}
          department={department}
          onEdit={handleEditDepartment}
          onDelete={handleDeleteDepartment}
        />
      ))}
    </div>
  );
}
