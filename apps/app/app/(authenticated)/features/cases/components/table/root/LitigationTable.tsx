'use client';

import { type Case } from '@repo/database/src/tenant-app/schema/case-schema';
import {
  type CaseTableProps,
  type CaseTableState,
  type CaseFilterState,
} from './types';
import { useCallback, useState, useRef } from 'react';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type Table as TableType,
  type Row,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@repo/design-system/components/ui/table';
import { Checkbox } from '@repo/design-system/components/ui/checkbox';
import { ColumnManager } from '../columns/shared/ColumnManager';
import { cn } from '@repo/design-system/lib/utils';
import { ResizeHandle } from '../columns/shared/ResizeHandle';

export function LitigationTable({ data, isLoading, error }: CaseTableProps) {
  const [rowSelection, setRowSelection] = useState({});
  const [columnVisibility, setColumnVisibility] = useState({});
  const [columnSizing, setColumnSizing] = useState({});
  const tableContainerRef = useRef<HTMLDivElement>(null);

  const columns = useCallback(() => {
    const cols: ColumnDef<Case>[] = [
      {
        id: 'select',
        header: ({ table }: { table: TableType<Case> }) => (
          <Checkbox
            checked={table.getIsAllRowsSelected()}
            onCheckedChange={(checked) => table.toggleAllRowsSelected(!!checked)}
            aria-label="Select all"
          />
        ),
        cell: ({ row }: { row: Row<Case> }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(checked) => row.toggleSelected(!!checked)}
            aria-label="Select row"
          />
        ),
        enableResizing: false,
        size: 40,
      },
      {
        accessorKey: 'title',
        header: 'Title',
        size: 200,
      },
      {
        accessorKey: 'type',
        header: 'Type',
        size: 120,
      },
      {
        accessorKey: 'status',
        header: 'Status',
        size: 120,
      },
      {
        accessorKey: 'riskLevel',
        header: 'Risk Level',
        size: 120,
      },
      {
        accessorKey: 'startDate',
        header: 'Start Date',
        size: 150,
      },
      {
        accessorKey: 'estimatedEndDate',
        header: 'Est. End Date',
        size: 150,
      },
    ];
    return cols;
  }, []);

  const table = useReactTable({
    data,
    columns: columns(),
    state: {
      rowSelection,
      columnVisibility,
      columnSizing,
    },
    enableRowSelection: true,
    enableColumnResizing: true,
    columnResizeMode: 'onChange',
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnSizingChange: setColumnSizing,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const { rows } = table.getRowModel();
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    estimateSize: () => 45, // approximate row height
    getScrollElement: () => tableContainerRef.current,
    overscan: 10,
  });

  const virtualRows = rowVirtualizer.getVirtualItems();
  const totalSize = rowVirtualizer.getTotalSize();
  const paddingTop = virtualRows.length > 0 ? virtualRows?.[0]?.start || 0 : 0;
  const paddingBottom =
    virtualRows.length > 0
      ? totalSize - (virtualRows?.[virtualRows.length - 1]?.end || 0)
      : 0;

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <ColumnManager table={table} />
      </div>
      <div
        ref={tableContainerRef}
        className="rounded-md border overflow-auto h-[600px]"
      >
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    style={{ width: header.getSize() }}
                    className={cn(
                      'relative',
                      header.column.getCanResize() && 'select-none'
                    )}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    {header.column.getCanResize() && (
                      <ResizeHandle
                        onResize={(delta: number) => {
                          const size = header.getSize();
                          setColumnSizing((prev) => ({
                            ...prev,
                            [header.id]: Math.max(size + delta, 40),
                          }));
                        }}
                      />
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {paddingTop > 0 && (
              <tr>
                <td style={{ height: `${paddingTop}px` }} />
              </tr>
            )}
            {virtualRows.map((virtualRow) => {
              const row = rows[virtualRow.index];
              return (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      style={{ width: cell.column.getSize() }}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })}
            {paddingBottom > 0 && (
              <tr>
                <td style={{ height: `${paddingBottom}px` }} />
              </tr>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
} 