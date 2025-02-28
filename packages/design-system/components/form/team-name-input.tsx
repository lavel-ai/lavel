// packages/design-system/components/form/team-name-input.tsx
import React, { useState } from 'react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { normalizeText } from '@repo/schema/utils/normalize';

type TeamNameInputProps = {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  showNormalization?: boolean;
};

export function TeamNameInput({
  value,
  onChange,
  error,
  showNormalization = true,
}: TeamNameInputProps) {
  const [wasNormalized, setWasNormalized] = useState(false);
  
  const handleBlur = () => {
    if (!value) return;
    
    // Normalize on blur
    const normalized = normalizeText.titleCase(value.trim());
    
    // Only show feedback and update if the value changed
    if (normalized !== value) {
      onChange(normalized);
      
      if (showNormalization) {
        setWasNormalized(true);
        setTimeout(() => setWasNormalized(false), 1500);
      }
    }
  };
  
  return (
    <div className="space-y-2">
      <Label htmlFor="team-name">Nombre del Equipo</Label>
      <div className="relative">
        <Input
          id="team-name"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={handleBlur}
          className={wasNormalized ? "bg-primary/5 transition-colors" : ""}
        />
        {wasNormalized && showNormalization && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground animate-in fade-in">
            Formato aplicado
          </span>
        )}
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}