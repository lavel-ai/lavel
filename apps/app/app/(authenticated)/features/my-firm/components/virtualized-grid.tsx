'use client';

import { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useWindowSize } from '@repo/design-system/hooks/use-window-size';
import { useIsMobile } from '@repo/design-system/hooks/use-mobile';

interface VirtualizedGridProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoading?: boolean;
  estimateSize?: number;
  className?: string;
}

const BREAKPOINTS = {
  mobile: 640,
  tablet: 1024,
  desktop: 1200,
} as const;

const GRID_CONFIG = {
  padding: 16, // Gap between items
  containerPadding: 16, // Container padding
  defaultWidth: 1200, // Default width if window size is undefined
  minColumnWidth: 300, // Minimum width for each column
} as const;

export function VirtualizedGrid<T>({
  items,
  renderItem,
  onLoadMore,
  hasMore = false,
  isLoading = false,
  estimateSize = 300,
  className = '',
}: VirtualizedGridProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);
  const { width: windowWidth } = useWindowSize();
  const isMobile = useIsMobile();

  // Calculate number of columns based on screen size
  const getColumnCount = () => {
    const width = windowWidth || GRID_CONFIG.defaultWidth;
    if (width <= BREAKPOINTS.mobile) return 1;
    if (width <= BREAKPOINTS.tablet) return 2;
    return 3;
  };

  const columnCount = getColumnCount();
  const availableWidth = (windowWidth || GRID_CONFIG.defaultWidth) - (GRID_CONFIG.containerPadding * 2);
  const columnWidth = Math.max(
    GRID_CONFIG.minColumnWidth,
    (availableWidth - (GRID_CONFIG.padding * (columnCount - 1))) / columnCount
  );

  // Calculate row count
  const rowCount = Math.ceil(items.length / columnCount);

  const rowVirtualizer = useVirtualizer({
    count: hasMore ? rowCount + 1 : rowCount, // Add extra row for loading more
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateSize + GRID_CONFIG.padding,
    overscan: 5,
  });

  // Load more items when reaching the bottom
  const maybeLoadMore = () => {
    const lastRow = rowVirtualizer.getVirtualItems().at(-1);
    if (lastRow && lastRow.index === rowCount - 1 && hasMore && !isLoading && onLoadMore) {
      onLoadMore();
    }
  };

  return (
    <div
      ref={parentRef}
      className={`h-[600px] overflow-auto ${className}`}
      onScroll={() => maybeLoadMore()}
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const rowStartIndex = virtualRow.index * columnCount;
          const rowItems = items.slice(rowStartIndex, rowStartIndex + columnCount);

          return (
            <div
              key={virtualRow.key}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {rowItems.map((item, columnIndex) => (
                <div key={columnIndex} className="h-full">
                  {renderItem(item, rowStartIndex + columnIndex)}
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* Loading indicator */}
      {isLoading && (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      )}
    </div>
  );
} 