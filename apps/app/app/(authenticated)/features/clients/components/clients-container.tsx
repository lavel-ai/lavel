'use client';

import { useState, useEffect, useCallback } from 'react';
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
import { Plus, Loader2, Search } from 'lucide-react';
import { useIsMobile } from '@repo/design-system/hooks/use-mobile';
import { useToast } from '@repo/design-system/hooks/use-toast';
import { CompletedClientFormData } from '../validation/schema-factory';
import { useClientData } from '../hooks/use-client-data';
import { Input } from '@repo/design-system/components/ui/input';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@repo/design-system/components/ui/pagination";
import { useDebounce } from '@repo/design-system/hooks/use-debounce';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/design-system/components/ui/select";

// Our API client interface
export interface Client {
  id: string;
  legalName: string;
  category?: string;
  contactPerson?: string;
  email?: string;
  status?: string;
  // Add other client properties as needed
}

// Interface matching ClientsTable component expectations
interface TableClient {
  id: string;
  name: string;
  industry: string;
  contactPerson: string;
  email: string;
  status: string;
}

export interface ClientsContainerProps {
  clients: Client[];
  totalClients: number;
  onCreateClient?: () => void;
  onEditClient?: (clientId: string) => void;
  onSearch?: (value: string) => void;
  onPaginate?: (page: number, perPage: number) => void;
  currentPage?: number;
  perPage?: number;
}

export function ClientsContainer({ 
  clients, 
  totalClients,
  onCreateClient, 
  onEditClient,
  onSearch,
  onPaginate,
  currentPage = 1,
  perPage = 10
}: ClientsContainerProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string | undefined>();
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [selectedClientData, setSelectedClientData] = useState<CompletedClientFormData | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(currentPage);
  const [itemsPerPage, setItemsPerPage] = useState(perPage);
  
  const debouncedSearch = useDebounce(searchTerm, 500);
  const router = useRouter();
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const { isLoading, fetchClientById, transformClientToFormData } = useClientData();

  // Effect to handle search term changes - memoized with useCallback
  useEffect(() => {
    if (onSearch && debouncedSearch !== undefined) {
      onSearch(debouncedSearch);
    }
  }, [debouncedSearch, onSearch]);

  // Effect to sync component state with props
  useEffect(() => {
    setPage(currentPage);
    setItemsPerPage(perPage);
  }, [currentPage, perPage]);

  // When we select a client for editing, fetch its full data
  useEffect(() => {
    if (selectedClientId && formMode === 'edit') {
      // Try to find the client in our current list first
      const basicClientData = clients.find(c => c.id === selectedClientId);
      
      if (basicClientData) {
        // Transform the data to match the form structure
        const formattedData = transformClientToFormData(basicClientData);
        setSelectedClientData(formattedData);
      } else {
        // If we don't have basic data, fetch it
        fetchClientById(selectedClientId).then(clientData => {
          if (clientData) {
            setSelectedClientData(clientData);
          }
        });
      }
    }
  }, [selectedClientId, formMode, clients, fetchClientById, transformClientToFormData]);

  // Memoized callback functions
  const handleCreateClient = useCallback(() => {
    if (onCreateClient) {
      onCreateClient();
    } else {
      setFormMode('create');
      setSelectedClientId(undefined);
      setSelectedClientData(undefined);
      setFormOpen(true);
    }
  }, [onCreateClient]);

  const handleEditClient = useCallback((clientId: string) => {
    if (onEditClient) {
      onEditClient(clientId);
    } else {
      setFormMode('edit');
      setSelectedClientId(clientId);
      setFormOpen(true);
    }
  }, [onEditClient]);

  const handleFormClose = useCallback(() => {
    setFormOpen(false);
    setSelectedClientData(undefined);
    // Refresh data when form closes
    router.refresh();
  }, [router]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    if (onPaginate && (newPage !== page || itemsPerPage !== perPage)) {
      onPaginate(newPage, itemsPerPage);
    }
    setPage(newPage);
  }, [onPaginate, page, itemsPerPage, perPage]);

  const handlePerPageChange = useCallback((value: string) => {
    const newPerPage = parseInt(value, 10);
    if (onPaginate && newPerPage !== itemsPerPage) {
      onPaginate(1, newPerPage);
    }
    setItemsPerPage(newPerPage);
    setPage(1); // Reset to first page when changing items per page
  }, [onPaginate, itemsPerPage, perPage]);

  // Calculate pagination values
  const totalPages = Math.ceil(totalClients / itemsPerPage);
  
  // Map client data to match the TableClient interface
  const processedClients: TableClient[] = clients.map(client => ({
    id: client.id,
    name: client.legalName,
    industry: client.category || 'Not specified',
    contactPerson: client.contactPerson || 'Not specified',
    email: client.email || 'Not specified',
    status: client.status || 'Not specified'
  }));

  // Set minimum height for the container to prevent layout shifts
  const minContainerHeight = isMobile ? "calc(100vh - 200px)" : "600px";
  
  return (
    <div className="space-y-4">
      <Card className="min-h-0">
        <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <CardTitle>Clients</CardTitle>
            <CardDescription>
              Manage your client relationships
            </CardDescription>
          </div>
          <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search clients..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="pl-8"
              />
            </div>
            <Button onClick={handleCreateClient}>
              <Plus className="mr-2 h-4 w-4" />
              Add Client
            </Button>
          </div>
        </CardHeader>
        <CardContent style={{ minHeight: minContainerHeight }}>
          {clients.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              No clients found. Create your first client by clicking the "Add Client" button.
            </p>
          ) : isMobile ? (
            <div className="space-y-4">
              {clients.map((client) => (
                <ClientCard 
                  key={client.id} 
                  name={client.legalName}
                  industry={client.category || 'Not specified'}
                  contactPerson={client.contactPerson || 'Not specified'}
                  email={client.email || 'Not specified'}
                  status={client.status || 'Not specified'}
                  onEdit={() => handleEditClient(client.id)} 
                />
              ))}
            </div>
          ) : (
            <ClientsTable 
              clients={processedClients}
              onEdit={handleEditClient} 
            />
          )}
          
          {totalClients > 0 && (
            <div className="mt-4 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Items per page:</span>
                <Select
                  value={itemsPerPage.toString()}
                  onValueChange={handlePerPageChange}
                >
                  <SelectTrigger className="w-16">
                    <SelectValue placeholder="10" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm text-muted-foreground">
                  Showing {clients.length} of {totalClients} clients
                </span>
              </div>
              
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => handlePageChange(Math.max(1, page - 1))} 
                      className={page === 1 ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNumber;
                    
                    // If we have 5 or fewer pages, show all page numbers
                    if (totalPages <= 5) {
                      pageNumber = i + 1;
                    } 
                    // Otherwise, handle page numbers based on current page
                    else {
                      if (page <= 3) {
                        // Near the start
                        if (i < 4) {
                          pageNumber = i + 1;
                        } else {
                          return (
                            <PaginationItem key={i}>
                              <PaginationEllipsis />
                            </PaginationItem>
                          );
                        }
                      } else if (page >= totalPages - 2) {
                        // Near the end
                        if (i === 0) {
                          pageNumber = 1;
                        } else if (i === 1) {
                          return (
                            <PaginationItem key={i}>
                              <PaginationEllipsis />
                            </PaginationItem>
                          );
                        } else {
                          pageNumber = totalPages - (4 - i);
                        }
                      } else {
                        // Somewhere in the middle
                        if (i === 0) {
                          pageNumber = 1;
                        } else if (i === 1) {
                          return (
                            <PaginationItem key={i}>
                              <PaginationEllipsis />
                            </PaginationItem>
                          );
                        } else if (i === 4) {
                          return (
                            <PaginationItem key={i}>
                              <PaginationEllipsis />
                            </PaginationItem>
                          );
                        } else {
                          pageNumber = page + (i - 2);
                        }
                      }
                    }
                    
                    return (
                      <PaginationItem key={i}>
                        <PaginationLink 
                          isActive={pageNumber === page}
                          onClick={() => handlePageChange(pageNumber)}
                        >
                          {pageNumber}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
                      className={page === totalPages ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>

      {formOpen && (
        <ClientForm 
          open={formOpen}
          onOpenChange={handleFormClose}
          mode={formMode}
          clientId={selectedClientId}
          initialData={selectedClientData}
        />
      )}
      
      {/* Loading overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-background/80 flex items-center justify-center z-50">
          <div className="bg-card p-6 rounded-lg shadow-lg flex items-center">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <p>Loading client data...</p>
          </div>
        </div>
      )}
    </div>
  );
} 