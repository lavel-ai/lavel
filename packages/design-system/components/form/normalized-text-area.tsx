// packages/design-system/components/form/normalized-textarea.tsx
import React, { useEffect, useRef, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { normalizeText } from '@repo/schema/src/utils/normalize';

type NormalizeType = 'trim' | 'none';

interface NormalizedTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  name: string;
  label?: string;
  normalize?: NormalizeType;
  error?: string;
  showChanges?: boolean;
  className?: string;
  labelClassName?: string;
  textareaClassName?: string;
  errorClassName?: string;
}

export function NormalizedTextarea({
  name,
  label,
  normalize = 'trim',
  error,
  showChanges = true,
  className,
  labelClassName,
  textareaClassName,
  errorClassName,
  ...props
}: NormalizedTextareaProps) {
  const { pending } = useFormStatus();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [originalValue, setOriginalValue] = useState<string>('');
  const [normalized, setNormalized] = useState(false);
  
  // Store original value on focus
  const handleFocus = () => {
    if (textareaRef.current) {
      setOriginalValue(textareaRef.current.value);
      setNormalized(false);
    }
  };
  
  // Apply normalization on blur
  const handleBlur = () => {
    if (!textareaRef.current || normalize === 'none') return;
    
    const value = textareaRef.current.value;
    let normalizedValue = value;
    
    switch (normalize) {
      case 'trim':
        normalizedValue = normalizeText.trim(value);
        break;
    }
    
    // Only update if value changed
    if (normalizedValue !== value) {
      textareaRef.current.value = normalizedValue;
      setNormalized(true);
    }
  };
  
  // Reset normalized state when input changes
  useEffect(() => {
    const handleInput = () => {
      setNormalized(false);
    };
    
    const textareaElement = textareaRef.current;
    if (textareaElement) {
      textareaElement.addEventListener('input', handleInput);
      return () => {
        textareaElement.removeEventListener('input', handleInput);
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
      
      <Textarea
        ref={textareaRef}
        id={name}
        name={name}
        onFocus={handleFocus}
        onBlur={handleBlur}
        disabled={pending}
        className={textareaClassName}
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