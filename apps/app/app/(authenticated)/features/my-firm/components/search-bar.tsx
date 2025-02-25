'use client';

import { useEffect, useState, useRef } from 'react';
import { Search, X, Filter } from 'lucide-react';
import { Input } from '@repo/design-system/components/ui/input';
import { Button } from '@repo/design-system/components/ui/button';
import { useDebounce } from '@repo/design-system/hooks/use-debounce';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@repo/design-system/components/ui/dropdown-menu';
import { Badge } from '@repo/design-system/components/ui/badge';
import type { SearchBarProps } from '../types';

export function SearchBar({
  value,
  onChange,
  placeholder = 'Search...',
  className = '',
  filters = {},
  onFilterChange,
}: SearchBarProps) {
  const [localValue, setLocalValue] = useState(value);
  const debouncedValue = useDebounce(localValue, 300);
  const isFirstRender = useRef(true);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  // Update local value when prop value changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Notify parent of changes after debounce
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    onChange(debouncedValue);
  }, [debouncedValue, onChange]);

  // Calculate active filters
  useEffect(() => {
    const active: string[] = [];
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== '') {
          active.push(key);
        }
      });
    }
    setActiveFilters(active);
  }, [filters]);

  // Handle filter changes
  const handleFilterChange = (key: string, value: string) => {
    if (onFilterChange) {
      onFilterChange({ ...filters, [key]: value });
    }
  };

  // Clear search
  const handleClear = () => {
    setLocalValue('');
    onChange('');
  };

  return (
    <div className={`relative flex items-center gap-1.5 ${className}`}>
      <div className="relative flex-grow">
        <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder={placeholder}
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          className="pl-8 pr-7 w-full bg-background border-muted h-9 text-sm"
        />
        {localValue && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            onClick={handleClear}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size="icon"
            className={`h-9 w-9 ${activeFilters.length > 0 ? "border-primary text-primary" : ""}`}
          >
            <Filter className="h-3.5 w-3.5" />
            {activeFilters.length > 0 && (
              <span className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-primary text-[9px] font-medium text-primary-foreground flex items-center justify-center">
                {activeFilters.length}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel className="text-xs">Filter By</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <DropdownMenuGroup>
            <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">Practice Area</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => handleFilterChange('practiceArea', 'Corporate')} className="text-xs">
              Corporate
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleFilterChange('practiceArea', 'Litigation')} className="text-xs">
              Litigation
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleFilterChange('practiceArea', 'Tax')} className="text-xs">
              Tax
            </DropdownMenuItem>
          </DropdownMenuGroup>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuGroup>
            <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">Role</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => handleFilterChange('role', 'leader')} className="text-xs">
              Lead Lawyers
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleFilterChange('role', 'member')} className="text-xs">
              Team Members
            </DropdownMenuItem>
          </DropdownMenuGroup>
          
          <DropdownMenuSeparator />
          
          {activeFilters.length > 0 && (
            <DropdownMenuItem 
              className="text-destructive focus:text-destructive text-xs"
              onClick={() => onFilterChange && onFilterChange({})}
            >
              Clear All Filters
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      
      {/* Active filters */}
      {activeFilters.length > 0 && (
        <div className="absolute -bottom-6 left-0 flex flex-wrap gap-1.5">
          {Object.entries(filters).map(([key, value]) => {
            if (value && value !== '') {
              return (
                <Badge 
                  key={key} 
                  variant="secondary"
                  className="bg-primary/10 text-primary text-xs py-0 h-5"
                >
                  {key}: {value}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-3.5 w-3.5 ml-1 hover:bg-transparent"
                    onClick={() => handleFilterChange(key, '')}
                  >
                    <X className="h-2.5 w-2.5" />
                  </Button>
                </Badge>
              );
            }
            return null;
          })}
        </div>
      )}
    </div>
  );
} 