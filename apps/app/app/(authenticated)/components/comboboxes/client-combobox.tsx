'use client';

import { useState, useEffect, useTransition } from 'react';
import { Combobox } from '@repo/design-system/components/ui/combobox'; // Assuming you have a Combobox component
import { getClientByIdAction, getClients } from '@/app/actions/clients/clients-actions'; // Server action to fetch clients
import { Client } from '@repo/database/src/tenant-app/schema/clients-schema';
import { getClientById } from '@/app/actions/clients/clients-actions';

interface ClientComboboxProps {
  onSelect: (clientId: string) => void;
  initialClientId?: string; // Optional initial client ID
}

const ClientCombobox: React.FC<ClientComboboxProps> = ({ onSelect, initialClientId }) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingInitialClient, setIsFetchingInitialClient] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Fetch initial client data if initialClientId is provided
    useEffect(() => {
        if (initialClientId) {
            setIsFetchingInitialClient(true);
            startTransition(async () => {
                const initialClientData = await getClientByIdAction(initialClientId);  // You'll need to create this server action
                if (initialClientData) {
                    setClients([initialClientData]); // Set initial client as the only option
                    setFilteredClients([initialClientData]);
                    setSearchTerm(initialClientData.name); // Set initial client name in the input
                }
                setIsFetchingInitialClient(false);
            });
        }
    }, [initialClientId]);

  useEffect(() => {
    const fetchClientsData = async () => {
      setIsLoading(true);
      const fetchedClients = await getClients(); // Fetch all clients initially
      if (fetchedClients) {
        setClients(fetchedClients);
        setFilteredClients(fetchedClients);
      }
      setIsLoading(false);
    };

    // Only fetch all clients if no initial client is selected
        if (!initialClientId) {
            fetchClientsData();
        }
  }, [initialClientId]);

  useEffect(() => {
    // Filter clients based on search term
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
      setSearchTerm(selectedClient.name); // Update the input with the selected client's name
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
      displayKey="name" // Display the client's name
      valueKey="id" // Use the client's ID as the value
      placeholder="Search for a client..."
      noResultsMessage="No clients found."
      label="Select Client" // Add label for accessibility
    />
  );
};

export default ClientCombobox; 