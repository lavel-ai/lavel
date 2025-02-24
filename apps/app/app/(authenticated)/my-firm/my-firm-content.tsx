'use client';

import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/design-system/components/ui/tabs';
import { useToast } from '@repo/design-system/hooks/use-toast';
import { useIsMobile } from '@repo/design-system/hooks/use-mobile';
import { TeamCard } from '../features/teams/components/team-card';
import { LawyerCard } from '../features/lawyers/components/lawyer-card';
import { CreateTeamDialog } from '../features/teams/components/create-team-dialog';
import { getTeams, type TeamWithMembers } from '../features/teams/actions/team-actions';
import { getLawyers, type LawyerProfile, type LawyerFilters } from '../features/lawyers/actions/lawyer-actions';
import { ErrorBoundary, DefaultErrorFallback } from '../features/my-firm/components/error-boundary';
import { SkeletonCard } from '../features/my-firm/components/skeleton-card';
import { useMyFirmStore } from '../features/my-firm/store/my-firm-store';
import { SearchBar } from '../features/my-firm/components/search-bar';

type MyFirmContentProps = {
  initialTeams: TeamWithMembers[];
  initialLawyers: LawyerProfile[];
};

export function MyFirmContent({ initialTeams, initialLawyers }: MyFirmContentProps) {
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

  // Handle search change
  const handleSearchChange = useCallback((value: string) => {
    setFilters({ search: value });
  }, [setFilters]);

  // Set up React Query for teams
  const {
    data: teams,
    isLoading: isLoadingTeams,
    error: teamsError
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
            variant: 'destructive'
          });
          return initialTeams;
        }
        return result.data || initialTeams;
      } finally {
        setIsLoading(false);
      }
    },
    initialData: initialTeams
  });

  // Set up React Query for lawyers
  const {
    data: lawyers,
    isLoading: isLoadingLawyers,
    error: lawyersError
  } = useQuery({
    queryKey: ['lawyers', filters, pagination, sort],
    queryFn: async () => {
      setIsLoading(true);
      try {
        const result = await getLawyers({
          search: filters.search,
          practiceArea: filters.practiceArea ? [filters.practiceArea] : undefined,
          teamId: filters.teamId ? [filters.teamId] : undefined,
          isLeadLawyer: filters.role === 'leader'
        } as LawyerFilters);
        
        if (result.status === 'error') {
          toast({
            title: 'Error',
            description: result.message,
            variant: 'destructive'
          });
          return initialLawyers;
        }
        return result.data || initialLawyers;
      } finally {
        setIsLoading(false);
      }
    },
    initialData: initialLawyers
  });

  const handleTeamEdit = async (teamId: string) => {
    // Implement team edit logic
    console.log('Edit team:', teamId);
  };

  const handleTeamDelete = async (teamId: string) => {
    // Implement team delete logic
    console.log('Delete team:', teamId);
  };

  const handleLawyerEdit = async (lawyerId: string) => {
    // Implement lawyer edit logic
    console.log('Edit lawyer:', lawyerId);
  };

  const handleLawyerDelete = async (lawyerId: string) => {
    // Implement lawyer delete logic
    console.log('Delete lawyer:', lawyerId);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="lawyers">Lawyers</TabsTrigger>
          <TabsTrigger value="clients">Clients</TabsTrigger>
        </TabsList>

        <TabsContent value="lawyers" className="space-y-6">
          {/* Teams Section */}
          <ErrorBoundary fallback={<DefaultErrorFallback />}>
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Teams</h2>
                <button
                  onClick={() => setIsCreateTeamOpen(true)}
                  className="btn btn-primary"
                >
                  Create Team
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {isLoadingTeams ? (
                  <SkeletonCard type="team" count={6} />
                ) : teams.map((team) => (
                  <TeamCard
                    key={team.id}
                    team={team}
                    onEdit={handleTeamEdit}
                    onDelete={handleTeamDelete}
                  />
                ))}
              </div>
            </div>
          </ErrorBoundary>

          {/* Lawyers Section */}
          <ErrorBoundary fallback={<DefaultErrorFallback />}>
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Lawyers</h2>
                <SearchBar
                  value={filters.search}
                  onChange={handleSearchChange}
                  placeholder="Search lawyers..."
                  className="w-64"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {isLoadingLawyers ? (
                  <SkeletonCard type="lawyer" count={6} />
                ) : lawyers.map((lawyer) => (
                  <LawyerCard
                    key={lawyer.id}
                    lawyer={lawyer}
                    onEdit={handleLawyerEdit}
                    onDelete={handleLawyerDelete}
                  />
                ))}
              </div>
            </div>
          </ErrorBoundary>
        </TabsContent>

        <TabsContent value="clients">
          <div className="text-center py-8">
            <h2 className="text-2xl font-bold mb-2">Client Management Coming Soon</h2>
            <p className="text-gray-600">
              We're working on bringing you powerful client management features.
              Stay tuned!
            </p>
          </div>
        </TabsContent>
      </Tabs>

      <CreateTeamDialog
        isOpen={isCreateTeamOpen}
        onOpenChange={setIsCreateTeamOpen}
        availableLawyers={lawyers}
      />
    </div>
  );
}
