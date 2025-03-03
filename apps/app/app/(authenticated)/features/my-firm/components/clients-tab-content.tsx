'use client';

import { useQuery } from '@tanstack/react-query';
import { useToast } from '@repo/design-system/hooks/use-toast';
import { ClientsContainer } from '../../clients/components/clients-container';
import { useMyFirmStore } from '../store/my-firm-store';
import { DefaultErrorFallback, ErrorBoundary } from '../../../components/error-boundary';
import { getClients } from '../../clients/actions/get-client-actions';

interface ClientsResult {
  clients: any[];
  totalClients: number;
}

interface ClientsTabContentProps {
  initialClients: any[];
  initialTotalClients?: number;
}

export function ClientsTabContent({ 
  initialClients, 
  initialTotalClients = 0 
}: ClientsTabContentProps) {
  const { toast } = useToast();
  const { filters, pagination, sort, setIsLoading } = useMyFirmStore();

  // Set up React Query for clients
  const {
    data: clientsData,
    isLoading: isLoadingClients,
    error: clientsError,
  } = useQuery<ClientsResult>({
    queryKey: ['clients', filters, pagination, sort],
    queryFn: async () => {
      setIsLoading(true);
      try {
        const result = await getClients({
          search: filters.search,
          // Use optional properties that might exist in the filter
          ...(filters as any).status && { status: [(filters as any).status] },
          ...(filters as any).category && { category: [(filters as any).category] },
          page: pagination.page,
          limit: pagination.limit,
          sort: sort.field,
          order: sort.direction,
        });

        if (result.status === 'error') {
          toast({
            title: 'Error',
            description: result.message,
            variant: 'destructive',
          });
          return { 
            clients: initialClients, 
            totalClients: initialTotalClients 
          };
        }
        
        // Ensure we return the same data structure whether it's an array or object with totalClients
        if (Array.isArray(result.data)) {
          return {
            clients: result.data,
            totalClients: result.data.length
          };
        }
        
        return result.data || { 
          clients: initialClients, 
          totalClients: initialTotalClients 
        };
      } finally {
        setIsLoading(false);
      }
    },
    initialData: { 
      clients: initialClients, 
      totalClients: initialTotalClients 
    },
  });

  return (
    <ErrorBoundary fallback={<DefaultErrorFallback />}>
      <div className="mt-5 space-y-6">
        <ClientsContainer
          clients={clientsData.clients}
          totalClients={clientsData.totalClients}
        />
      </div>
    </ErrorBoundary>
  );
} 