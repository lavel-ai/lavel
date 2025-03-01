'use client';

import { Check, ChevronsUpDown, X } from 'lucide-react';
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
import { getPracticeAreas, PracticeAreaOption } from '../actions/practice-area-actions';

interface PracticeAreasComboboxProps {
  value: number[];
  onChange: (value: number[]) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function PracticeAreasCombobox({
  value,
  onChange,
  placeholder = 'Seleccionar áreas de práctica',
  disabled = false,
}: PracticeAreasComboboxProps) {
  const [open, setOpen] = useState(false);
  const [practiceAreas, setPracticeAreas] = useState<PracticeAreaOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchPracticeAreas = async () => {
      try {
        setLoading(true);
        const response = await getPracticeAreas();
        if (response.status === 'success' && response.data) {
          setPracticeAreas(response.data);
        }
      } catch (error) {
        // Handle error silently
      } finally {
        setLoading(false);
      }
    };

    fetchPracticeAreas();
  }, []);

  // Filter practice areas based on search query
  const filteredPracticeAreas = practiceAreas.filter((area) => {
    if (!searchQuery) return true;
    return area.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Find the selected practice areas
  const selectedPracticeAreas = practiceAreas.filter(area => 
    value.includes(area.id)
  );

  const handleSelect = (id: number) => {
    if (value.includes(id)) {
      // Remove if already selected
      onChange(value.filter(itemId => itemId !== id));
    } else {
      // Add if not selected
      onChange([...value, id]);
    }
  };

  const handleRemove = (id: number) => {
    onChange(value.filter(itemId => itemId !== id));
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1">
        {selectedPracticeAreas.map((area) => (
          <Badge 
            key={area.id} 
            variant="secondary"
            className="flex items-center gap-1 px-3 py-1"
          >
            {area.name}
            <button
              type="button"
              className="ml-1 rounded-full outline-none focus:ring-2 focus:ring-offset-1"
              onClick={() => handleRemove(area.id)}
              disabled={disabled}
            >
              <X className="h-3 w-3" />
              <span className="sr-only">Remove {area.name}</span>
            </button>
          </Badge>
        ))}
      </div>

      <Popover open={open} onOpenChange={setOpen} modal={true}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={disabled}
          >
            {selectedPracticeAreas.length > 0 ? (
              <span className="text-left line-clamp-1">
                {selectedPracticeAreas.length} {selectedPracticeAreas.length === 1 ? 'área seleccionada' : 'áreas seleccionadas'}
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
            maxHeight: '60vh',
            overflowY: 'auto',
            zIndex: 100,
            position: 'relative',
          }}
          align="start"
          sideOffset={5}
        >
          <Command className="overflow-hidden">
            <CommandInput
              placeholder="Buscar área de práctica..."
              className="h-9"
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            {loading ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                Cargando áreas de práctica...
              </div>
            ) : (
              <>
                <CommandEmpty className="py-6 text-center text-sm">
                  No se encontraron áreas de práctica.
                </CommandEmpty>
                <CommandGroup>
                  {filteredPracticeAreas.map((area) => (
                    <CommandItem
                      key={area.id}
                      value={area.id.toString()}
                      onSelect={() => handleSelect(area.id)}
                      className="flex items-center py-2"
                    >
                      <div className="flex items-center flex-1">
                        <div
                          className={cn(
                            'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary',
                            value.includes(area.id)
                              ? 'bg-primary text-primary-foreground'
                              : 'opacity-50'
                          )}
                        >
                          {value.includes(area.id) && (
                            <Check className="h-3 w-3" />
                          )}
                        </div>
                        <span>{area.name}</span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
} 