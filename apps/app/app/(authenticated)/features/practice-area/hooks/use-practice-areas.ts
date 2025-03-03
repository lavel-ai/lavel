'use client';

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@repo/design-system/hooks/use-toast';
import { useAnalytics } from '@repo/analytics/posthog/client';
import { 
  createPracticeArea,
  updatePracticeArea,
  deletePracticeArea,
  PracticeAreaOption,
  ApiResponse
} from '../actions/practice-area-actions';
import { 
  getPracticeAreas,
  getPracticeAreaById 
} from '../actions/get-practice-area';

export interface UsePracticeAreasOptions {
  initialData?: PracticeAreaOption[];
}

/**
 * Custom hook for managing practice areas with React Query
 * Follows the architecture pattern defined in data-flow.mdx
 */
export function usePracticeAreas({ initialData }: UsePracticeAreasOptions = {}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const analytics = useAnalytics();
  const [selectedPracticeAreaIds, setSelectedPracticeAreaIds] = useState<number[]>([]);
  
  // Get all practice areas
  const { 
    data: practiceAreas = [], 
    isLoading, 
    error,
    refetch,
    isFetching
  } = useQuery({
    queryKey: ['practice-areas'],
    queryFn: async () => {
      const startTime = performance.now();
      
      try {
        const response = await getPracticeAreas();
        
        const endTime = performance.now();
        analytics?.capture('data_fetch_completed', {
          entity_type: 'practice_area',
          entity_count: response.data?.length || 0,
          duration_ms: Math.round(endTime - startTime),
          status: response.status,
        });
        
        if (response.status === 'error') {
          throw new Error(response.message || 'Error fetching practice areas');
        }
        
        return response.data || [];
      } catch (error: any) {
        const endTime = performance.now();
        analytics?.capture('data_fetch_error', {
          entity_type: 'practice_area',
          duration_ms: Math.round(endTime - startTime),
          error_message: error.message || 'Unknown error',
        });
        
        throw error;
      }
    },
    initialData: initialData || undefined,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Create a new practice area with optimistic updates
  const createMutation = useMutation({
    mutationFn: async (newPracticeArea: any) => {
      analytics?.capture('entity_mutation_started', {
        mutation_type: 'create',
        entity_type: 'practice_area',
        entity_name: newPracticeArea.name,
      });
      
      return createPracticeArea(newPracticeArea);
    },
    onMutate: async (newPracticeArea) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['practice-areas'] });
      
      // Snapshot the previous value
      const previousPracticeAreas = queryClient.getQueryData<PracticeAreaOption[]>(['practice-areas']) || [];
      
      // Create optimistic practice area with temporary ID
      const optimisticPracticeArea: PracticeAreaOption = {
        id: Date.now(), // Temporary ID
        name: newPracticeArea.name,
        description: newPracticeArea.description,
        active: newPracticeArea.active ?? true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      // Optimistically update to the new value
      queryClient.setQueryData(
        ['practice-areas'], 
        [...previousPracticeAreas, optimisticPracticeArea]
      );
      
      // Return a context object with the previous practice areas
      return { previousPracticeAreas };
    },
    onSuccess: async (response) => {
      if (response.status === 'success') {
        queryClient.invalidateQueries({ queryKey: ['practice-areas'] });
        
        toast({
          title: 'Éxito',
          description: 'Área de práctica creada correctamente',
        });

        // Add to selected if response has data
        if (response.data) {
          setSelectedPracticeAreaIds(prev => [...prev, response.data!.id]);
        }
        
        analytics?.capture('entity_mutation_completed', {
          mutation_type: 'create',
          entity_type: 'practice_area',
          entity_id: response.data?.id,
          entity_name: response.data?.name,
          status: 'success',
        });
      } else {
        toast({
          title: 'Error',
          description: response.message || 'Error al crear el área de práctica',
          variant: 'destructive',
        });
        
        analytics?.capture('entity_mutation_completed', {
          mutation_type: 'create',
          entity_type: 'practice_area',
          status: 'error',
          error_message: response.message || 'Unknown error',
        });
      }
    },
    onError: (error: any, variables, context) => {
      // Rollback to the previous state if there was an error
      if (context?.previousPracticeAreas) {
        queryClient.setQueryData(['practice-areas'], context.previousPracticeAreas);
      }
      
      console.error('Error creating practice area:', error);
      toast({
        title: 'Error',
        description: error.message || 'Error al crear el área de práctica',
        variant: 'destructive',
      });
      
      analytics?.capture('entity_mutation_completed', {
        mutation_type: 'create',
        entity_type: 'practice_area',
        entity_name: variables.name,
        status: 'error',
        error_message: error.message || 'Unknown error',
      });
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['practice-areas'] });
    },
  });

  // Update a practice area with optimistic updates
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      analytics?.capture('entity_mutation_started', {
        mutation_type: 'update',
        entity_type: 'practice_area',
        entity_id: id,
        entity_name: data.name,
      });
      
      return updatePracticeArea(id, data);
    },
    onMutate: async ({ id, data }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['practice-areas'] });
      await queryClient.cancelQueries({ queryKey: ['practice-area', id] });
      
      // Snapshot the previous values
      const previousPracticeAreas = queryClient.getQueryData<PracticeAreaOption[]>(['practice-areas']) || [];
      const previousPracticeArea = queryClient.getQueryData<PracticeAreaOption>(['practice-area', id]);
      
      // Optimistically update to the new value
      const updatedPracticeAreas = previousPracticeAreas.map(area => 
        area.id === id 
          ? { ...area, ...data, updatedAt: new Date().toISOString() } 
          : area
      );
      
      queryClient.setQueryData(['practice-areas'], updatedPracticeAreas);
      if (previousPracticeArea) {
        queryClient.setQueryData(
          ['practice-area', id], 
          { ...previousPracticeArea, ...data, updatedAt: new Date().toISOString() }
        );
      }
      
      // Return a context with the previous value
      return { previousPracticeAreas, previousPracticeArea };
    },
    onSuccess: async (response) => {
      if (response.status === 'success') {
        // Update cache
        queryClient.invalidateQueries({ queryKey: ['practice-areas'] });
        queryClient.invalidateQueries({ queryKey: ['practice-area', response.data?.id] });
        
        toast({
          title: 'Éxito',
          description: 'Área de práctica actualizada correctamente',
        });
        
        analytics?.capture('entity_mutation_completed', {
          mutation_type: 'update',
          entity_type: 'practice_area',
          entity_id: response.data?.id,
          entity_name: response.data?.name,
          status: 'success',
        });
      } else {
        toast({
          title: 'Error',
          description: response.message || 'Error al actualizar el área de práctica',
          variant: 'destructive',
        });
        
        analytics?.capture('entity_mutation_completed', {
          mutation_type: 'update',
          entity_type: 'practice_area',
          status: 'error',
          error_message: response.message || 'Unknown error',
        });
      }
    },
    onError: (error: any, variables, context) => {
      // Roll back to the previous value
      if (context?.previousPracticeAreas) {
        queryClient.setQueryData(['practice-areas'], context.previousPracticeAreas);
      }
      if (context?.previousPracticeArea) {
        queryClient.setQueryData(['practice-area', variables.id], context.previousPracticeArea);
      }
      
      console.error('Error updating practice area:', error);
      toast({
        title: 'Error',
        description: error.message || 'Error al actualizar el área de práctica',
        variant: 'destructive',
      });
      
      analytics?.capture('entity_mutation_completed', {
        mutation_type: 'update',
        entity_type: 'practice_area',
        entity_id: variables.id,
        entity_name: variables.data.name,
        status: 'error',
        error_message: error.message || 'Unknown error',
      });
    },
    onSettled: (response) => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['practice-areas'] });
      if (response?.data?.id) {
        queryClient.invalidateQueries({ queryKey: ['practice-area', response.data.id] });
      }
    },
  });

  // Delete a practice area with optimistic updates
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const practiceAreaToDelete = practiceAreas.find(area => area.id === id);
      
      analytics?.capture('entity_mutation_started', {
        mutation_type: 'delete',
        entity_type: 'practice_area',
        entity_id: id,
        entity_name: practiceAreaToDelete?.name,
      });
      
      return deletePracticeArea(id);
    },
    onMutate: async (id) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['practice-areas'] });
      
      // Snapshot the previous value
      const previousPracticeAreas = queryClient.getQueryData<PracticeAreaOption[]>(['practice-areas']) || [];
      
      // Optimistically remove the practice area from the list
      queryClient.setQueryData(
        ['practice-areas'], 
        previousPracticeAreas.filter(area => area.id !== id)
      );
      
      // Return a context with the previous value
      return { previousPracticeAreas };
    },
    onSuccess: async (response, id) => {
      const practiceAreaToDelete = practiceAreas.find(area => area.id === id);
      
      if (response.status === 'success') {
        // Update cache
        queryClient.invalidateQueries({ queryKey: ['practice-areas'] });
        
        toast({
          title: 'Éxito',
          description: 'Área de práctica eliminada correctamente',
        });
        
        // Remove from selected if included
        setSelectedPracticeAreaIds(prev => prev.filter(selectedId => selectedId !== id));
        
        analytics?.capture('entity_mutation_completed', {
          mutation_type: 'delete',
          entity_type: 'practice_area',
          entity_id: id,
          entity_name: practiceAreaToDelete?.name,
          status: 'success',
        });
      } else {
        toast({
          title: 'Error',
          description: response.message || 'Error al eliminar el área de práctica',
          variant: 'destructive',
        });
        
        analytics?.capture('entity_mutation_completed', {
          mutation_type: 'delete',
          entity_type: 'practice_area',
          entity_id: id,
          status: 'error',
          error_message: response.message || 'Unknown error',
        });
      }
    },
    onError: (error: any, id, context) => {
      const practiceAreaToDelete = practiceAreas.find(area => area.id === id);
      
      // Roll back to the previous value
      if (context?.previousPracticeAreas) {
        queryClient.setQueryData(['practice-areas'], context.previousPracticeAreas);
      }
      
      console.error('Error deleting practice area:', error);
      toast({
        title: 'Error',
        description: error.message || 'Error al eliminar el área de práctica',
        variant: 'destructive',
      });
      
      analytics?.capture('entity_mutation_completed', {
        mutation_type: 'delete',
        entity_type: 'practice_area',
        entity_id: id,
        entity_name: practiceAreaToDelete?.name,
        status: 'error',
        error_message: error.message || 'Unknown error',
      });
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['practice-areas'] });
    },
  });

  // Get a single practice area by ID with React Query
  const usePracticeArea = (id: number) => {
    return useQuery({
      queryKey: ['practice-area', id],
      queryFn: async () => {
        const startTime = performance.now();
        
        try {
          const response = await getPracticeAreaById(id);
          
          const endTime = performance.now();
          analytics?.capture('data_fetch_completed', {
            entity_type: 'practice_area',
            entity_id: id,
            duration_ms: Math.round(endTime - startTime),
            status: response.status,
          });
          
          if (response.status === 'error') {
            throw new Error(response.message || 'Error fetching practice area');
          }
          
          return response.data;
        } catch (error: any) {
          const endTime = performance.now();
          analytics?.capture('data_fetch_error', {
            entity_type: 'practice_area',
            entity_id: id,
            duration_ms: Math.round(endTime - startTime),
            error_message: error.message || 'Unknown error',
          });
          
          throw error;
        }
      },
      enabled: !!id // Only run the query if we have an ID
    });
  };

  // Function to handle selection of practice areas
  const handleSelect = useCallback((practiceAreaIds: number[]) => {
    setSelectedPracticeAreaIds(practiceAreaIds);
    
    analytics?.capture('entity_selection_changed', {
      entity_type: 'practice_area',
      selection_count: practiceAreaIds.length,
      selection_ids: practiceAreaIds,
    });
  }, [analytics]);

  // Get selected practice areas
  const selectedPracticeAreas = practiceAreas.filter(
    (area) => selectedPracticeAreaIds.includes(area.id)
  );

  // Create a new practice area and select it
  const createAndSelect = useCallback(async (data: any) => {
    const response = await createMutation.mutateAsync(data);
    return response;
  }, [createMutation]);

  return {
    // Data
    practiceAreas,
    selectedPracticeAreaIds,
    selectedPracticeAreas,
    
    // State
    isLoading,
    error,
    isFetching,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    
    // Actions
    handleSelect,
    create: createMutation.mutate,
    createAsync: createMutation.mutateAsync,
    createAndSelect,
    update: updateMutation.mutate,
    updateAsync: updateMutation.mutateAsync,
    delete: deleteMutation.mutate,
    deleteAsync: deleteMutation.mutateAsync,
    usePracticeArea, // Hook for getting a single practice area
    refetch,
    
    // Reset selection
    resetSelection: () => setSelectedPracticeAreaIds([]),
  };
}