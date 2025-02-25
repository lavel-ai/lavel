'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@repo/design-system/components/ui/card';
import { Button } from '@repo/design-system/components/ui/button';
import { ClientsTable } from './clients-table';
import { ClientCard } from './client-card';
import { ClientForm } from './form/client-form';
import { Plus } from 'lucide-react';
import { useIsMobile } from '@repo/design-system/hooks/use-mobile';

export interface ClientsContainerProps {
  clients: any[];
  totalClients: number;
}

export function ClientsContainer({ clients, totalClients }: ClientsContainerProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string | undefined>();
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const router = useRouter();
  const isMobile = useIsMobile();

  const handleCreateClient = () => {
    setFormMode('create');
    setSelectedClientId(undefined);
    setFormOpen(true);
  };

  const handleEditClient = (clientId: string) => {
    setFormMode('edit');
    setSelectedClientId(clientId);
    setFormOpen(true);
  };

  const handleFormClose = () => {
    setFormOpen(false);
    // Refresh data when form closes
    router.refresh();
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Clients</CardTitle>
            <CardDescription>
              Manage your client relationships
            </CardDescription>
          </div>
          <Button onClick={handleCreateClient}>
            <Plus className="mr-2 h-4 w-4" />
            Add Client
          </Button>
        </CardHeader>
        <CardContent>
          {isMobile ? (
            <div className="space-y-4">
              {clients.map((client) => (
                <ClientCard 
                  key={client.id} 
                  name={client.legalName}
                  industry={client.category}
                  contactPerson={client.contactPerson || 'Not specified'}
                  email={client.email || 'Not specified'}
                  status={client.status}
                  onEdit={() => handleEditClient(client.id)} 
                />
              ))}
              {clients.length === 0 && (
                <p className="text-center text-muted-foreground py-4">
                  No clients found. Create your first client by clicking the "Add Client" button.
                </p>
              )}
            </div>
          ) : (
            <ClientsTable 
              clients={clients} 
              onEdit={handleEditClient} 
            />
          )}
        </CardContent>
      </Card>

      <ClientForm 
        open={formOpen}
        onOpenChange={handleFormClose}
        mode={formMode}
        clientId={selectedClientId}
        // We would need to fetch the client data if editing
        // initialData={selectedClientData}
      />
    </div>
  );
} 