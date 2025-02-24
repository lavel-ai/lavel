'use client';

import { Controller } from 'react-hook-form';
import { Input } from '@repo/design-system/components/ui/input';
import { Label } from '@repo/design-system/components/ui/label';
// Placeholder for Google Places integration
import PlacesAutocomplete from 'react-places-autocomplete';

export function AddressInput({ index, control }) {
  return (
    <div className="space-y-2">
      <Controller
        name={`addresses.${index}.street`}
        control={control}
        render={({ field }) => (
          <PlacesAutocomplete value={field.value} onChange={field.onChange} onSelect={(address) => field.onChange(address)}>
            {({ getInputProps, suggestions, getSuggestionItemProps }) => (
              <div>
                <Label>Street</Label>
                <Input {...getInputProps({ placeholder: 'Enter street address' })} />
                <div className="absolute z-10 bg-white shadow-md">
                  {suggestions.map((suggestion) => (
                    <div {...getSuggestionItemProps(suggestion)} key={suggestion.placeId} className="p-2 hover:bg-gray-100">
                      {suggestion.description}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </PlacesAutocomplete>
        )}
      />
      <Controller name={`addresses.${index}.city`} control={control} render={({ field }) => <Input {...field} placeholder="City" />} />
      <Controller name={`addresses.${index}.state`} control={control} render={({ field }) => <Input {...field} placeholder="State" />} />
      <Controller name={`addresses.${index}.zipCode`} control={control} render={({ field }) => <Input {...field} placeholder="Zip Code" />} />
      <Controller name={`addresses.${index}.country`} control={control} render={({ field }) => <Input {...field} placeholder="Country" />} />
    </div>
  );
}