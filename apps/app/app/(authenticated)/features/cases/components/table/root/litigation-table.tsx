'use client';

import { type Case } from '@repo/database/src/tenant-app/schema';
import {
  type CaseTableProps,
  type CaseTableState,
  type CaseFilterState,
} from './types';
import { useCallback, useState } from 'react';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type Table as TableType,
  type Row,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@repo/design-system/components/ui/table';
import { Checkbox } from '@repo/design-system/components/ui/checkbox';

export function LitigationTable({ data, isLoading, error }: CaseTableProps) {
  const [rowSelection, setRowSelection] = useState({});
  const [columnVisibility, setColumnVisibility] = useState({});

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
      },
      {
        accessorKey: 'title',
        header: 'Title',
      },
      {
        accessorKey: 'type',
        header: 'Type',
      },
      {
        accessorKey: 'status',
        header: 'Status',
      },
      {
        accessorKey: 'riskLevel',
        header: 'Risk Level',
      },
      {
        accessorKey: 'startDate',
        header: 'Start Date',
      },
      {
        accessorKey: 'estimatedEndDate',
        header: 'Est. End Date',
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
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && 'selected'}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={columns().length}
                className="h-24 text-center"
              >
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
} 