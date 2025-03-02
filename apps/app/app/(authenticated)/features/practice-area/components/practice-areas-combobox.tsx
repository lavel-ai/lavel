'use client';

import { Check, ChevronsUpDown, Plus, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Badge } from '@repo/design-system/components/ui/badge';
import { Button } from '@repo/design-system/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandSeparator,
} from '@repo/design-system/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@repo/design-system/components/ui/popover';
import { cn } from '@repo/design-system/lib/utils';
import { useToast } from '@repo/design-system/hooks/use-toast';
import { PracticeAreaOption } from '../actions/practice-area-actions';
import { PracticeAreaDialog } from './practice-area-dialog';
import { usePracticeAreas } from '../hooks/use-practice-areas';

interface PracticeAreasComboboxProps {
  value: number[];
  onChange: (value: number[]) => void;
  placeholder?: string;
  disabled?: boolean;
  allowCreate?: boolean;
  practiceAreas: PracticeAreaOption[];
  isLoading: boolean;
  onCreateSuccess?: () => Promise<void>;
}

export function PracticeAreasCombobox({
  value,
  onChange,
  placeholder = 'Seleccionar áreas de práctica',
  disabled = false,
  allowCreate = true,
  practiceAreas = [],
  isLoading = false,
  onCreateSuccess,
}: PracticeAreasComboboxProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Debug logs to track practice areas data
  useEffect(() => {
    console.log('PracticeAreasCombobox received data:', practiceAreas);
    if (practiceAreas && practiceAreas.length > 0) {
      console.log('First practice area:', practiceAreas[0]);
    } else {
      console.log('No practice areas received');
    }
  }, [practiceAreas]);
  
  // Only use the createAndSelect function from the hook
  const { createAndSelect } = usePracticeAreas();

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

  // Handle when a new practice area is created
  const handlePracticeAreaCreated = async (practiceArea: PracticeAreaOption) => {
    // Select the newly created area
    onChange([...value, practiceArea.id]);
    
    // Refresh the list of practice areas
    if (onCreateSuccess) {
      await onCreateSuccess();
    }
    
    // Clear the search
    setSearchQuery('');
  };

  // Open the create dialog
  const handleOpenCreateDialog = () => {
    setDialogOpen(true);
  };

  // Quick create from search term
  const handleQuickCreate = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      const response = await createAndSelect({ 
        name: searchQuery.trim(),
        active: true
      });
      
      if (response.status === 'success' && response.data) {
        // Add to selected areas
        onChange([...value, response.data.id]);
        
        // Close popover and clear search
        setOpen(false);
        setSearchQuery('');
        
        // Refresh practice areas
        if (onCreateSuccess) {
          await onCreateSuccess();
        }
        
        toast({
          title: 'Área creada',
          description: `Se ha creado "${searchQuery.trim()}" correctamente`,
        });
      }
    } catch (error) {
      console.error('Error creating practice area:', error);
      toast({
        title: 'Error',
        description: 'No se pudo crear el área de práctica',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-2">
      {/* Debug display */}
      <div className="p-2 bg-amber-100 rounded mb-2 text-xs">
        <div>Debug: Received {practiceAreas?.length || 0} practice areas</div>
        <div>First area: {practiceAreas?.[0]?.name || 'None'}</div>
        <div>IsLoading: {isLoading ? 'Yes' : 'No'}</div>
      </div>
      
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

      {/* Practice Area Dialog for creating new practice areas */}
      <PracticeAreaDialog 
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={handlePracticeAreaCreated}
        trigger={null} // We'll manually control the dialog
      />

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
            {isLoading ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                Cargando áreas de práctica...
              </div>
            ) : (
              <>
                <CommandEmpty className="py-6 text-center text-sm">
                  No se encontraron áreas de práctica.
                  {allowCreate && searchQuery.trim() && (
                    <div className="mt-2">
                      <Button 
                        size="sm" 
                        className="mx-auto"
                        onClick={handleQuickCreate}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Crear "{searchQuery.trim()}"
                      </Button>
                    </div>
                  )}
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
                
                {allowCreate && (
                  <>
                    <CommandSeparator />
                    <CommandGroup>
                      <CommandItem
                        onSelect={handleOpenCreateDialog}
                        className="py-2"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Crear nueva área de práctica
                      </CommandItem>
                    </CommandGroup>
                  </>
                )}
              </>
            )}
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}