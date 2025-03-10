// packages/design-system/components/form/normalized-input.tsx
'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { normalizeText } from '@repo/schema/src/utils/normalize';

export type NormalizeType = 'trim' | 'titleCase' | 'uppercase' | 'lowercase' | 'none';

interface NormalizedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  name: string;
  label?: string;
  normalize?: NormalizeType;
  error?: string;
  showChanges?: boolean;
  className?: string;
  labelClassName?: string;
  inputClassName?: string;
  errorClassName?: string;
}

export function NormalizedInput({
  name,
  label,
  normalize = 'trim',
  error,
  showChanges = true,
  className,
  labelClassName,
  inputClassName,
  errorClassName,
  ...props
}: NormalizedInputProps) {
  const { pending } = useFormStatus();
  const inputRef = useRef<HTMLInputElement>(null);
  const [originalValue, setOriginalValue] = useState<string>('');
  const [normalized, setNormalized] = useState(false);
  
  // Store original value on focus
  const handleFocus = () => {
    if (inputRef.current) {
      setOriginalValue(inputRef.current.value);
      setNormalized(false);
    }
  };
  
  // Apply normalization on blur
  const handleBlur = () => {
    if (!inputRef.current || normalize === 'none') return;
    
    const value = inputRef.current.value;
    let normalizedValue = value;
    
    switch (normalize) {
      case 'trim':
        normalizedValue = normalizeText.trim(value);
        break;
      case 'titleCase':
        normalizedValue = normalizeText.titleCase(value);
        break;
      case 'uppercase':
        normalizedValue = normalizeText.uppercase(value);
        break;
      case 'lowercase':
        normalizedValue = normalizeText.lowercase(value);
        break;
    }
    
    // Only update if value changed
    if (normalizedValue !== value) {
      inputRef.current.value = normalizedValue;
      setNormalized(true);
    }
  };
  
  // Reset normalized state when input changes
  useEffect(() => {
    const handleInput = () => {
      setNormalized(false);
    };
    
    const inputElement = inputRef.current;
    if (inputElement) {
      inputElement.addEventListener('input', handleInput);
      return () => {
        inputElement.removeEventListener('input', handleInput);
      };
    }
  }, []);
  
  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <Label htmlFor={name} className={labelClassName}>
          {label}
        </Label>
      )}
      
      <Input
        ref={inputRef}
        id={name}
        name={name}
        onFocus={handleFocus}
        onBlur={handleBlur}
        disabled={pending}
        className={inputClassName}
        {...props}
      />
      
      {error && (
        <p className={`text-sm text-destructive ${errorClassName}`}>
          {error}
        </p>
      )}
      
      {showChanges && normalized && (
        <p className="text-xs text-muted-foreground">
          Normalized from "{originalValue}"
        </p>
      )}
    </div>
  );
}