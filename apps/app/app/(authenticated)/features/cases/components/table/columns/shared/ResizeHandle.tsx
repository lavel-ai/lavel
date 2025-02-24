'use client';

import { cn } from '@repo/design-system/lib/utils';
import { useEffect, useState } from 'react';

interface ResizeHandleProps {
  onResize: (delta: number) => void;
  className?: string;
}

export function ResizeHandle({ onResize, className }: ResizeHandleProps) {
  const [isResizing, setIsResizing] = useState(false);
  const [startX, setStartX] = useState(0);

  useEffect(() => {
    function onMouseMove(e: MouseEvent) {
      if (!isResizing) return;
      const delta = e.clientX - startX;
      onResize(delta);
      setStartX(e.clientX);
    }

    function onMouseUp() {
      setIsResizing(false);
    }

    if (isResizing) {
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, [isResizing, onResize, startX]);

  return (
    <div
      className={cn(
        'absolute right-0 top-0 h-full w-1 cursor-col-resize bg-border hover:bg-primary/50',
        isResizing && 'bg-primary',
        className
      )}
      onMouseDown={(e) => {
        e.preventDefault();
        setIsResizing(true);
        setStartX(e.clientX);
      }}
    />
  );
} 