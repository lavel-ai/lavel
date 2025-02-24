'use client';

import { useState, useEffect, useTransition } from 'react';
import { Combobox } from '@repo/design-system/components/ui/combobox';
// Use the renamed server actions
import { getClients, getClientByIdAction } from '@/app/actions/clients/clients-actions';
import { Client } from '@repo/database/src/tenant-app/schema/clients-schema';

interface ClientComboboxProps {
  onSelect: (clientId: string) => void;
  initialClientId?: string;
}

const ClientCombobox: React.FC<ClientComboboxProps> = ({ onSelect, initialClientId }) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingInitialClient, setIsFetchingInitialClient] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (initialClientId) {
      setIsFetchingInitialClient(true);
      startTransition(async () => {
        // Use the renamed server action
        const initialClientData = await getClientByIdAction(initialClientId);
        if (initialClientData) {
          setClients([initialClientData]);
          setFilteredClients([initialClientData]);
          setSearchTerm(initialClientData.name);
        }
        setIsFetchingInitialClient(false);
      });
    }
  }, [initialClientId]);

  useEffect(() => {
    const fetchClientsData = async () => {
      setIsLoading(true);
      // Use the renamed server action
      const fetchedClients = await getClients();
      if (fetchedClients) {
        setClients(fetchedClients);
        setFilteredClients(fetchedClients);
      }
      setIsLoading(false);
    };

    if (!initialClientId) {
      fetchClientsData();
    }
  }, [initialClientId]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = clients.filter((client) =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredClients(filtered);
    } else {
      setFilteredClients(clients);
    }
  }, [searchTerm, clients]);

  const handleSelect = (clientId: string) => {
    const selectedClient = clients.find((client) => client.id === clientId);
    if (selectedClient) {
      setSearchTerm(selectedClient.name);
    }
    onSelect(clientId);
  };

  return (
    <Combobox
      isLoading={isLoading || isFetchingInitialClient || isPending}
      items={filteredClients}
      onSelect={handleSelect}
      searchTerm={searchTerm}
      setSearchTerm={setSearchTerm}
      displayKey="name"
      valueKey="id"
      placeholder="Search for a client..."
      noResultsMessage="No clients found."
      label="Select Client"
    />
  );
};

export default ClientCombobox; 