'use client';

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@repo/design-system/components/ui/tabs';
import { useIsMobile } from '@repo/design-system/hooks/use-mobile';
import { useToast } from '@repo/design-system/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { useCallback, useState, useMemo } from 'react';
import { Users, Briefcase, Building, Search } from 'lucide-react';
import {
  type LawyerFilters,
  type LawyerProfile,
  getLawyers,
} from '../features/lawyers/actions/lawyer-actions';
import { LawyerCard } from '../features/lawyers/components/lawyer-card';
import {
  DefaultErrorFallback,
  ErrorBoundary,
} from '../features/my-firm/components/error-boundary';
import { SearchBar } from '../features/my-firm/components/search-bar';
import { SkeletonCard } from '../features/my-firm/components/skeleton-card';
import { useMyFirmStore } from '../features/my-firm/store/my-firm-store';
import {
  type TeamWithMembers,
  getTeams,
} from '../features/teams/actions/team-actions';
import { CreateTeamDialog } from '../features/teams/components/create-team-dialog';
import { TeamCard } from '../features/teams/components/team-card';
import { ClientsContainer, Client } from '../features/clients/components/clients-container';
import { getClients } from '../features/clients/actions/get-client-actions';

type MyFirmContentProps = {
  initialTeams: TeamWithMembers[];
  initialLawyers: LawyerProfile[];
  initialClients: Client[]; // Now using the proper Client type
};

export function MyFirmContent({
  initialTeams,
  initialLawyers,
  initialClients,
}: MyFirmContentProps) {
  const [activeTab, setActiveTab] = useState('lawyers');
  const [isCreateTeamOpen, setIsCreateTeamOpen] = useState(false);
  const isMobile = useIsMobile();
  const { toast } = useToast();

  // Get store actions
  const {
    filters,
    pagination,
    sort,
    setFilters,
    setPagination,
    setSort,
    setIsLoading,
  } = useMyFirmStore();

  // Handle search change - memoized with useCallback
  const handleSearchChange = useCallback(
    (value: string) => {
      if (filters.search !== value) {
        setFilters({ ...filters, search: value });
      }
    },
    [setFilters, filters]
  );

  // Handle filter change - memoized with useCallback
  const handleFilterChange = useCallback(
    (newFilters: Record<string, string>) => {
      const hasChanges = Object.entries(newFilters).some(
        ([key, value]) => filters[key as keyof typeof filters] !== value
      );
      
      if (hasChanges) {
        setFilters({ ...filters, ...newFilters });
      }
    },
    [setFilters, filters]
  );

  // Handle pagination change - memoized with useCallback
  const handlePaginationChange = useCallback(
    (page: number, limit: number) => {
      const shouldUpdate = 
        pagination.page !== page || 
        pagination.limit !== limit;
        
      if (shouldUpdate) {
        setPagination({ 
          ...pagination, 
          page, 
          limit
        });
      }
    },
    [pagination, setPagination]
  );

  // Set up React Query for teams
  const {
    data: teams,
    isLoading: isLoadingTeams,
    error: teamsError,
  } = useQuery({
    queryKey: ['teams', filters, pagination, sort],
    queryFn: async () => {
      setIsLoading(true);
      try {
        const result = await getTeams();
        if (result.status === 'error') {
          toast({
            title: 'Error',
            description: result.message,
            variant: 'destructive',
          });
          return initialTeams;
        }
        return result.data || initialTeams;
      } finally {
        setIsLoading(false);
      }
    },
    initialData: initialTeams,
  });

  // Set up React Query for lawyers
  const {
    data: lawyers,
    isLoading: isLoadingLawyers,
    error: lawyersError,
  } = useQuery({
    queryKey: ['lawyers', filters, pagination, sort],
    queryFn: async () => {
      setIsLoading(true);
      try {
        const result = await getLawyers({
          search: filters.search,
          practiceArea: filters.practiceArea
            ? [filters.practiceArea]
            : undefined,
          teamId: filters.teamId ? [filters.teamId] : undefined,
          isLeadLawyer: filters.role === 'leader',
        } as LawyerFilters);

        if (result.status === 'error') {
          toast({
            title: 'Error',
            description: result.message,
            variant: 'destructive',
          });
          return initialLawyers;
        }
        return result.data || initialLawyers;
      } finally {
        setIsLoading(false);
      }
    },
    initialData: initialLawyers,
  });

  // Set up React Query for clients
  const {
    data: clients,
    isLoading: isLoadingClients,
    error: clientsError,
  } = useQuery({
    queryKey: ['clients', filters, pagination, sort],
    queryFn: async () => {
      setIsLoading(true);
      try {
        const result = await getClients({
          search: filters.search,
          // Add any additional filters here
        });
        
        if (result.status === 'error') {
          toast({
            title: 'Error',
            description: result.message,
            variant: 'destructive',
          });
          return initialClients;
        }
        return result.data || initialClients;
      } finally {
        setIsLoading(false);
      }
    },
    initialData: initialClients,
  });

  // Memoize the total clients count to avoid unnecessary re-renders
  const totalClients = useMemo(() => clients.length, [clients]);

  const handleTeamEdit = useCallback(async (teamId: string) => {
    // Implement team edit logic
    console.log('Edit team:', teamId);
  }, []);

  const handleTeamDelete = useCallback(async (teamId: string) => {
    // Implement team delete logic
    console.log('Delete team:', teamId);
  }, []);

  const handleLawyerEdit = useCallback(async (lawyerId: string) => {
    // Implement lawyer edit logic
    console.log('Edit lawyer:', lawyerId);
  }, []);

  const handleLawyerDelete = useCallback(async (lawyerId: string) => {
    // Implement lawyer delete logic
    console.log('Delete lawyer:', lawyerId);
  }, []);

  return (
    <div className="w-full max-w-full">
      {/* Header with search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-3">
        <h1 className="text-2xl font-bold">My Firm</h1>
        <SearchBar
          value={filters.search || ''}
          onChange={handleSearchChange}
          placeholder="Search teams and lawyers..."
          className="w-full md:w-72"
          filters={{
            practiceArea: filters.practiceArea || '',
            role: filters.role || '',
          }}
          onFilterChange={handleFilterChange}
        />
      </div>

      {/* Main navigation tabs - full width with better styling */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="border-b border-border">
          <TabsList className="w-full h-12 bg-background justify-start rounded-none">
            <TabsTrigger 
              value="lawyers" 
              className="flex-1 text-sm font-medium h-full rounded-none data-[state=active]:bg-background data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none data-[state=active]:text-primary"
            >
              <div className="flex items-center justify-center gap-1.5">
                <Building className="h-4 w-4" />
                <span>My Despacho</span>
              </div>
            </TabsTrigger>
            <TabsTrigger 
              value="clients" 
              className="flex-1 text-sm font-medium h-full rounded-none data-[state=active]:bg-background data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none data-[state=active]:text-primary"
            >
              <div className="flex items-center justify-center gap-1.5">
                <Users className="h-4 w-4" />
                <span>Mis Clientes</span>
              </div>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="lawyers" className="mt-5 space-y-6">
          {/* Create Team and Add Lawyer Cards - Side by side at the top */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Create Team Card */}
            <div 
              className="border-2 border-dashed border-muted rounded-lg flex flex-col items-center justify-center p-4 h-[160px] cursor-pointer hover:border-primary/50 hover:bg-muted/5 transition-all"
              onClick={() => setIsCreateTeamOpen(true)}
            >
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-base font-medium mb-1">Create New Team</h3>
              <p className="text-muted-foreground text-center text-xs">Add a new team to organize your lawyers</p>
            </div>
            
            {/* Add Lawyer Card */}
            <div 
              className="border-2 border-dashed border-muted rounded-lg flex flex-col items-center justify-center p-4 h-[160px] cursor-pointer hover:border-primary/50 hover:bg-muted/5 transition-all"
            >
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                <Briefcase className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-base font-medium mb-1">Add New Lawyer</h3>
              <p className="text-muted-foreground text-center text-xs">Invite a lawyer to join your firm</p>
            </div>
          </div>

          {/* Teams Section */}
          <ErrorBoundary fallback={<DefaultErrorFallback />}>
            <section className="space-y-3">
              <div className="flex items-center justify-between border-b pb-2">
                <div className="flex items-center gap-1.5">
                  <Users className="h-4 w-4 text-primary" />
                  <h2 className="font-bold text-base">Teams</h2>
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {/* Team Cards */}
                {isLoadingTeams ? (
                  <SkeletonCard type="team" count={5} />
                ) : (
                  teams.map((team) => (
                    <TeamCard
                      key={team.id}
                      team={team}
                      onEdit={handleTeamEdit}
                      onDelete={handleTeamDelete}
                    />
                  ))
                )}
              </div>
            </section>
          </ErrorBoundary>

          {/* Lawyers Section */}
          <ErrorBoundary fallback={<DefaultErrorFallback />}>
            <section className="space-y-3">
              <div className="flex items-center justify-between border-b pb-2">
                <div className="flex items-center gap-1.5">
                  <Briefcase className="h-4 w-4 text-primary" />
                  <h2 className="font-bold text-base">Lawyers</h2>
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {/* Lawyer Cards */}
                {isLoadingLawyers ? (
                  <SkeletonCard type="lawyer" count={5} />
                ) : (
                  lawyers.map((lawyer) => (
                    <LawyerCard
                      key={lawyer.id}
                      lawyer={lawyer}
                      onEdit={handleLawyerEdit}
                      onDelete={handleLawyerDelete}
                    />
                  ))
                )}
              </div>
            </section>
          </ErrorBoundary>
        </TabsContent>

        <TabsContent value="clients" className="mt-5">
          <ErrorBoundary fallback={<DefaultErrorFallback />}>
            <ClientsContainer 
              clients={clients} 
              totalClients={totalClients} 
              onSearch={handleSearchChange}
              onPaginate={handlePaginationChange}
              currentPage={pagination.page}
              perPage={pagination.limit}
            />
          </ErrorBoundary>
        </TabsContent>
      </Tabs>

      <CreateTeamDialog
        open={isCreateTeamOpen}
        onOpenChange={setIsCreateTeamOpen}
        availableLawyers={lawyers || []}
      />
    </div>
  );
}
