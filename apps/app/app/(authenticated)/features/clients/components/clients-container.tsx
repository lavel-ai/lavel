'use client';

import { useState, useEffect } from 'react';
import { useIsMobile } from '@repo/design-system/hooks/use-mobile';
import { ClientsTable } from './clients-table';
import { ClientCard } from './client-card';
import { Button } from '@repo/design-system/components/ui/button';
import { Loader2, Plus } from 'lucide-react';
import { useToast } from '@repo/design-system/hooks/use-toast';

// This is a temporary type until we finalize the client actions
type Client = {
  id: string;
  legalName: string;
  category: string;
  status: string;
  contactPerson?: string;
  email?: string;
  industry?: string;
};

interface ClientsContainerProps {
  initialClients: Client[];
}

export function ClientsContainer({ initialClients }: ClientsContainerProps) {
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const isMobile = useIsMobile();
  const { toast } = useToast();

  const handleEditClient = (clientId: string) => {
    console.log('Edit client:', clientId);
    // Future implementation: Open edit form
  };

  const handleDeleteClient = (clientId: string) => {
    console.log('Delete client:', clientId);
    // Future implementation: Delete client
  };

  // Convert data for display in the table or card
  const clientsForDisplay = clients.map(client => ({
    id: client.id,
    name: client.legalName,
    industry: client.category,
    contactPerson: client.contactPerson || 'Not specified',
    email: client.email || 'Not specified',
    status: client.status
  }));

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Clients</h2>
        <Button 
          onClick={() => setIsCreateFormOpen(true)}
          size="sm"
          className="gap-1"
        >
          <Plus className="h-4 w-4" />
          Add Client
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : clients.length === 0 ? (
        <div className="text-center p-8 border rounded-md bg-muted/10">
          <p className="text-muted-foreground">No clients found. Add your first client to get started.</p>
        </div>
      ) : isMobile ? (
        <div className="grid grid-cols-1 gap-4">
          {clientsForDisplay.map((client) => (
            <ClientCard
              key={client.id}
              name={client.name}
              industry={client.industry}
              contactPerson={client.contactPerson}
              email={client.email}
              status={client.status}
              onEdit={() => handleEditClient(client.id)}
            />
          ))}
        </div>
      ) : (
        <ClientsTable 
          clients={clientsForDisplay} 
          onEdit={handleEditClient} 
        />
      )}

      {/* Client form dialog can be added here */}
    </div>
  );
} 