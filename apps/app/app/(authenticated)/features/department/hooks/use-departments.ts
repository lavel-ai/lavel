'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@repo/design-system/hooks/use-toast';
import { getDepartments, type Department } from '../actions/get-departments';
import { createDepartment } from '../actions/department-actions';

export function useDepartments(initialData?: Department[]) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Query for fetching departments
  const query = useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const response = await getDepartments();
      if (response.status === 'error') {
        throw new Error(response.message);
      }
      return response.data;
    },
    initialData,
  });
  
  // Mutation for creating departments
  const createMutation = useMutation({
    mutationFn: createDepartment,
    onSuccess: (result) => {
      if (result.status === 'success') {
        toast({
          title: '¡Departamento creado!',
          description: result.message,
          variant: 'default',
        });
        
        // Invalidate departments query to refetch the data
        queryClient.invalidateQueries({ queryKey: ['departments'] });
      } else {
        toast({
          title: 'Error',
          description: result.message,
          variant: 'destructive',
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Ocurrió un error inesperado',
        variant: 'destructive',
      });
    },
  });
  
  return {
    // Query results
    departments: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    
    // Mutations
    createDepartment: createMutation.mutate,
    isCreating: createMutation.isPending,
  };
}
