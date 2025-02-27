'use client';

import { Check, ChevronsUpDown } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Badge } from '@repo/design-system/components/ui/badge';
import { Button } from '@repo/design-system/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@repo/design-system/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@repo/design-system/components/ui/popover';
import { cn } from '@repo/design-system/lib/utils';
import { getLawyers } from '../../../lawyers/actions/lawyer-actions';

export interface LawyerOption {
  id: string;
  name: string;
  lastName: string;
  maternalLastName?: string | null;
  practiceArea?: string | null;
  isLeadLawyer?: boolean;
}

interface LawyerComboboxProps {
  value?: string | null | undefined;
  onChange: (value: string | null) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function LawyerCombobox({
  value,
  onChange,
  placeholder = 'Seleccionar abogado',
  disabled = false,
}: LawyerComboboxProps) {
  const [open, setOpen] = useState(false);
  const [lawyers, setLawyers] = useState<LawyerOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchLawyers = async () => {
      try {
        setLoading(true);
        const response = await getLawyers();
        if (response.status === 'success' && response.data) {
          setLawyers(
            response.data.map((lawyer) => ({
              id: lawyer.id,
              name: lawyer.name,
              lastName: lawyer.lastName,
              maternalLastName: lawyer.maternalLastName,
              practiceArea: lawyer.practiceArea,
              isLeadLawyer: lawyer.isLeadLawyer,
            }))
          );
        }
      } catch (error) {
        // Handle error silently
      } finally {
        setLoading(false);
      }
    };

    fetchLawyers();
  }, []);

  // Filter lawyers based on search query
  const filteredLawyers = lawyers.filter((lawyer) => {
    if (!searchQuery) return true;
    
    const fullName = `${lawyer.name} ${lawyer.lastName} ${
      lawyer.maternalLastName || ''
    }`.toLowerCase();
    
    return fullName.includes(searchQuery.toLowerCase());
  });

  // Find the selected lawyer
  const selectedLawyer = value ? lawyers.find((lawyer) => lawyer.id === value) : undefined;

  return (
    <Popover open={open} onOpenChange={setOpen} modal={true}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled}
        >
          {selectedLawyer ? (
            <span>
              {selectedLawyer.name} {selectedLawyer.lastName}{' '}
              {selectedLawyer.maternalLastName || ''}
            </span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-full p-0"
        style={{
          width: 'var(--radix-popover-trigger-width)',
          maxHeight: '80vh',
          overflowY: 'auto',
          zIndex: 100,
          position: 'relative',
        }}
        align="start"
        sideOffset={5}
      >
        <Command className="overflow-hidden">
          <CommandInput
            placeholder="Buscar abogado..."
            className="h-9"
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          {loading ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              Cargando abogados...
            </div>
          ) : (
            <>
              <CommandEmpty className="py-6 text-center text-sm">
                No se encontraron abogados.
              </CommandEmpty>
              <CommandGroup>
                {filteredLawyers.map((lawyer) => (
                  <CommandItem
                    key={lawyer.id}
                    value={lawyer.id}
                    onSelect={() => {
                      onChange(lawyer.id);
                      setOpen(false);
                    }}
                    className="flex items-start py-2"
                  >
                    <div className="flex flex-col">
                      <div className="flex items-center">
                        <Check
                          className={cn(
                            'mr-2 h-4 w-4',
                            value && value === lawyer.id ? 'opacity-100' : 'opacity-0'
                          )}
                        />
                        <span className="font-medium">
                          {lawyer.name} {lawyer.lastName}{' '}
                          {lawyer.maternalLastName || ''}
                        </span>
                        {lawyer.isLeadLawyer && (
                          <Badge
                            variant="outline"
                            className="ml-2 bg-primary/10 text-primary text-xs"
                          >
                            Principal
                          </Badge>
                        )}
                      </div>
                      {lawyer.practiceArea && (
                        <span className="ml-6 text-sm text-muted-foreground">
                          {lawyer.practiceArea}
                        </span>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  );
}
