// packages/design-system/components/form/normalized-text-input.tsx
import React, { useState } from 'react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { normalizeText } from '@repo/schema/src/utils/normalize';

type NormalizedTextInputProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  showNormalization?: boolean;
  normalizeFn?: (value: string) => string;
  placeholder?: string;
  required?: boolean;
};

export function NormalizedTextInput({
  label,
  value,
  onChange,
  error,
  showNormalization = true,
  normalizeFn = normalizeText.trim,
  placeholder,
  required = false,
}: NormalizedTextInputProps) {
  const [wasNormalized, setWasNormalized] = useState(false);
  
  const handleBlur = () => {
    if (!value) return;
    
    // Normalize on blur
    const normalized = normalizeFn(value);
    
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
      <Label>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <div className="relative">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={handleBlur}
          className={wasNormalized ? "bg-primary/5 transition-colors" : ""}
          placeholder={placeholder}
          required={required}
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

