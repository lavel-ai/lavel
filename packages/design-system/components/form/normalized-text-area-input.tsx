// packages/design-system/components/form/normalized-textarea.tsx
import React, { useState } from 'react';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { normalizeText } from '@repo/schema/src/utils/normalize';

type NormalizedTextareaProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  showNormalization?: boolean;
  normalizeFn?: (value: string) => string;
  placeholder?: string;
  required?: boolean;
};

export function NormalizedTextarea({
  label,
  value,
  onChange,
  error,
  showNormalization = true,
  normalizeFn = normalizeText.trim,
  placeholder,
  required = false,
}: NormalizedTextareaProps) {
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
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={handleBlur}
          className={wasNormalized ? "bg-primary/5 transition-colors" : ""}
          placeholder={placeholder}
          required={required}
        />
        {wasNormalized && showNormalization && (
          <span className="absolute right-3 top-6 -translate-y-1/2 text-xs text-muted-foreground animate-in fade-in">
            Formato aplicado
          </span>
        )}
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}