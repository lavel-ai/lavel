'use client';

import { useEffect, useState } from 'react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@repo/design-system/components/ui/form';
import { PracticeAreasCombobox } from '../../../practice-area/components/practice-areas-combobox';
import { useFormContext } from 'react-hook-form';
import { getProfilePracticeAreas } from '../../actions/profile-practice-areas-actions';

interface ProfileFormPracticeAreasProps {
  profileId?: string;
}

export function ProfileFormPracticeAreas({ profileId }: ProfileFormPracticeAreasProps) {
  const form = useFormContext();
  const [isLoading, setIsLoading] = useState(profileId ? true : false);

  useEffect(() => {
    // If we're editing an existing profile, get its practice areas
    if (profileId) {
      const fetchPracticeAreas = async () => {
        try {
          setIsLoading(true);
          const response = await getProfilePracticeAreas(profileId);
          if (response.status === 'success' && response.data) {
            // Extract the law branch IDs and set them in the form
            const practiceAreaIds = response.data.map(area => area.lawBranchId);
            form.setValue('practiceAreaIds', practiceAreaIds);
          }
        } catch (error) {
          console.error('Failed to fetch profile practice areas:', error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchPracticeAreas();
    }
  }, [profileId, form]);

  return (
    <FormField
      control={form.control}
      name="practiceAreaIds"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Áreas de Práctica</FormLabel>
          <FormControl>
            <PracticeAreasCombobox
              value={field.value || []} 
              onChange={field.onChange}
              disabled={isLoading}
              placeholder="Selecciona las áreas de práctica"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
} 