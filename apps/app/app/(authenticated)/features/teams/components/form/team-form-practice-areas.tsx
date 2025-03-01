'use client';

import { useEffect, useState } from 'react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@repo/design-system/components/ui/form';
import { PracticeAreasCombobox } from '../../../practice-area/components/practice-areas-combobox';
import { useFormContext } from 'react-hook-form';
import { getTeamPracticeAreas } from '../../actions/team-practice-areas-actions';

interface TeamFormPracticeAreasProps {
  teamId?: string;
}

export function TeamFormPracticeAreas({ teamId }: TeamFormPracticeAreasProps) {
  const form = useFormContext();
  const [isLoading, setIsLoading] = useState(teamId ? true : false);

  useEffect(() => {
    // If we're editing an existing team, get its practice areas
    if (teamId) {
      const fetchPracticeAreas = async () => {
        try {
          setIsLoading(true);
          const response = await getTeamPracticeAreas(teamId);
          if (response.status === 'success' && response.data) {
            // Extract the law branch IDs and set them in the form
            const practiceAreaIds = response.data.map(area => area.lawBranchId);
            form.setValue('practiceAreaIds', practiceAreaIds);
          }
        } catch (error) {
          console.error('Failed to fetch team practice areas:', error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchPracticeAreas();
    }
  }, [teamId, form]);

  return (
    <FormField
      control={form.control}
      name="practiceAreaIds"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Áreas de Práctica del Equipo</FormLabel>
          <FormControl>
            <PracticeAreasCombobox
              value={field.value || []} 
              onChange={field.onChange}
              disabled={isLoading}
              placeholder="Selecciona las áreas de práctica del equipo"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
} 