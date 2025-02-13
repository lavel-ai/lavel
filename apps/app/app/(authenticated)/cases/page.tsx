// apps/app/app/(authenticated)/[...catchall]/cases/page.tsx
'use client';

import { useCases } from '@/app/hook/src';
import { Button } from '@repo/design-system/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/design-system/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@repo/design-system/components/ui/table';
import Link from 'next/link';
import { useState } from 'react';
import { Case } from '@repo/database/src/tenant-app/schema/main/case-schema';
import { Input } from '@repo/design-system/components/ui/input';
import { Label } from '@repo/design-system/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@repo/design-system/components/ui/dialog';
import { Header } from '../components/header';

export default function CasesPage() {
  const { data: cases, isLoading, error } = useCases();
//   const { mutate: createCaseMutation, isPending: isCreating } = useCreateCase();

    const [isDialogOpen, setIsDialogOpen] = useState(false);

  if (isLoading) return <div>Loading cases...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <Header pages={[]} page="Cases" />
      <h1 className="text-2xl font-bold mb-4">Cases</h1>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button>Create Case</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Case</DialogTitle>
            <DialogDescription>
              Enter the details for the new case.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              // createCaseMutation(formData);
              setIsDialogOpen(false); // Close dialog on submit
            }}
          >
            <div className="mb-4">
              <Label htmlFor="name">Case Name</Label>
              <Input id="name" name="name" required />
            </div>
            <div className="mb-4">
              <Label htmlFor="clientId">Client ID</Label>
              <Input id="clientId" name="clientId" required />
            </div>
            <div className="mb-4">
              <Label htmlFor="description">Description</Label>
              <Input id="description" name="description" />
            </div>
            <div className="mb-4">
              <Label htmlFor="status">Status</Label>
              <Input id="status" name="status" />
            </div>
            <DialogFooter>
              <Button type="submit" /* disabled={isCreating} */>
                {/* {isCreating ? 'Creating...' : 'Create Case'} */}
                Create Case
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {cases?.map((caseItem: Case) => (
            <TableRow key={caseItem.id}>
              <TableCell>{caseItem.id}</TableCell>
              <TableCell>{caseItem.title}</TableCell>
              <TableCell>{caseItem.description}</TableCell>
              <TableCell>{caseItem.status}</TableCell>
              <TableCell>
                <Link href={`/cases/${caseItem.id}`}>
                  <Button variant="link">View</Button>
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
