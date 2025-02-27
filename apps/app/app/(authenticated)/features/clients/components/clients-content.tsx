'use client';

import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Users, Building2 } from 'lucide-react';
import { useIsMobile } from '@repo/design-system/hooks/use-mobile';
import { useToast } from '@repo/design-system/hooks/use-toast';
import { ClientsContainer } from './clients-container';
import { ClientForm } from './form/client-form';
import { DefaultErrorFallback, ErrorBoundary } from '../../my-firm/components/error-boundary';

interface ClientsContentProps {
  initialClients: any[];
}

export function ClientsContent({ initialClients }: ClientsContentProps) {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [filters, setFilters] = useState({ search: '', status: '', category: '' });
  const [formOpen, setFormOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string | undefined>();
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');

  // Set up React Query for clients - this would be connected to the actual client actions
  const {
    data: clients,
    isLoading: isLoadingClients,
    error: clientsError,
    refetch: refetchClients,
  } = useQuery({
    queryKey: ['clients', filters],
    queryFn: async () => {
      try {
        // In a production app, this would call a server action to fetch clients
        // For now, we'll just return the initial clients
        // const result = await getClients({ filters });
        
        // Simulate filtering
        const filteredClients = initialClients.filter(client => {
          // Apply search filter
          if (filters.search && !client.legalName?.toLowerCase().includes(filters.search.toLowerCase())) {
            return false;
          }
          
          // Apply status filter
          if (filters.status && client.status !== filters.status) {
            return false;
          }
          
          // Apply category filter
          if (filters.category && client.category !== filters.category) {
            return false;
          }
          
          return true;
        });
        
        return {
          data: filteredClients,
          total: filteredClients.length
        };
      } catch (error) {
        console.error('Error fetching clients:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch clients. Please try again.',
          variant: 'destructive',
        });
        return { data: initialClients, total: initialClients.length };
      }
    },
    initialData: { data: initialClients, total: initialClients.length },
  });

  const handleCreateClient = useCallback(() => {
    setFormMode('create');
    setSelectedClientId(undefined);
    setFormOpen(true);
  }, []);

  const handleEditClient = useCallback((clientId: string) => {
    setFormMode('edit');
    setSelectedClientId(clientId);
    setFormOpen(true);
  }, []);

  const handleFormClose = useCallback(() => {
    setFormOpen(false);
    // Refresh client data
    refetchClients();
  }, [refetchClients]);

  return (
    <div className="space-y-6">
      {/* Create Client Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Create Client Card */}
        <div 
          className="border-2 border-dashed border-muted rounded-lg flex flex-col items-center justify-center p-4 h-[160px] cursor-pointer hover:border-primary/50 hover:bg-muted/5 transition-all"
          onClick={handleCreateClient}
        >
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mb-2">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <h3 className="text-base font-medium mb-1">Add New Client</h3>
          <p className="text-muted-foreground text-center text-xs">Create a new client record for your firm</p>
        </div>
        
        {/* Client Groups Card */}
        <div 
          className="border-2 border-dashed border-muted rounded-lg flex flex-col items-center justify-center p-4 h-[160px] cursor-pointer hover:border-primary/50 hover:bg-muted/5 transition-all"
        >
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mb-2">
            <Building2 className="h-5 w-5 text-primary" />
          </div>
          <h3 className="text-base font-medium mb-1">Manage Client Groups</h3>
          <p className="text-muted-foreground text-center text-xs">Organize your clients into groups for better management</p>
        </div>
      </div>

      {/* Clients List */}
      <ErrorBoundary fallback={<DefaultErrorFallback />}>
        <section>
          <ClientsContainer 
            clients={clients.data} 
            totalClients={clients.total} 
            onCreateClient={handleCreateClient}
            onEditClient={handleEditClient}
          />
        </section>
      </ErrorBoundary>

      {/* Client Form */}
      {formOpen && (
        <ClientForm 
          open={formOpen}
          onOpenChange={handleFormClose}
          mode={formMode}
          clientId={selectedClientId}
        />
      )}
    </div>
  );
} 