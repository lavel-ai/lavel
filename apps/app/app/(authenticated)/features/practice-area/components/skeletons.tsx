'use client';

import { Skeleton } from '@repo/design-system/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@repo/design-system/components/ui/table';

export function PracticeAreasSkeleton() {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <Skeleton className="h-8 w-48" />
        </div>
        <Skeleton className="h-9 w-24" />
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead><Skeleton className="h-4 w-24" /></TableHead>
            <TableHead><Skeleton className="h-4 w-32" /></TableHead>
            <TableHead><Skeleton className="h-4 w-20" /></TableHead>
            <TableHead className="text-right"><Skeleton className="h-4 w-16 ml-auto" /></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, index) => (
            <TableRow key={index}>
              <TableCell><Skeleton className="h-5 w-10" /></TableCell>
              <TableCell><Skeleton className="h-5 w-40" /></TableCell>
              <TableCell><Skeleton className="h-5 w-16" /></TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end space-x-2">
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-8 w-8" />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function PracticeAreaDetailsSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-6 w-40" />
      <Skeleton className="h-20 w-full" />
      <div className="flex items-center space-x-2">
        <Skeleton className="h-5 w-5" />
        <Skeleton className="h-5 w-20" />
      </div>
    </div>
  );
} 