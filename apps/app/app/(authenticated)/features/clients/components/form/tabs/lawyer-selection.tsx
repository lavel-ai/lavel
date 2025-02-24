'use client';

import { useQuery } from '@tanstack/react-query';
import { Controller } from 'react-hook-form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/design-system/components/ui/select';
import { getTeamMembers } from '../../actions/client-form-actions';

export function LawyerSelection({ control }) {
  const { data: lawyers } = useQuery({
    queryKey: ['teamMembers'],
    queryFn: getTeamMembers,
  });

  return (
    <Controller
      name="primaryLawyerId"
      control={control}
      render={({ field }) => (
        <Select onValueChange={field.onChange} value={field.value}>
          <SelectTrigger>
            <SelectValue placeholder="Select a lawyer" />
          </SelectTrigger>
          <SelectContent>
            {lawyers?.map((lawyer) => (
              <SelectItem key={lawyer.id} value={lawyer.id}>
                {lawyer.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    />
  );
}