// apps/app/app/(authenticated)/[...catchall]/cases/[caseId]/page.tsx
'use client';

import { useCases } from '@/hooks/useCases';
import { Button } from '@repo/design-system/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@repo/design-system/components/ui/card';
import { Input } from '@repo/design-system/components/ui/input';
import { Label } from '@repo/design-system/components/ui/label';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@repo/design-system/components/ui/dialog';

type Props = {
  params: {
    caseId: string;
  };
};
export default function CasePage({ params }: Props) {
  const { caseId } = params;
  const { data: caseData, isLoading, error } = useCases();
//   const { mutate: deleteCaseMutation } = useDeleteCase();
//   const { mutate: updateCaseMutation, isPending: isUpdating } = useUpdateCase();
  const router = useRouter();
    const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleDelete = () => {
//     deleteCaseMutation(caseId);
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!caseData) return <div>Case not found</div>;

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>{caseData.title}</CardTitle>
          <CardDescription>Case ID: {caseData.id}</CardDescription>
        </CardHeader>
        <CardContent>
          <p>
            <strong>Client ID:</strong> {caseData.clientId}
          </p>
          <p>
            <strong>Status:</strong> {caseData.status}
          </p>
          <p>
            <strong>Description:</strong> {caseData.description}
          </p>
        </CardContent>
        <CardFooter>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="mr-2">
                Edit
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Case</DialogTitle>
                <DialogDescription>
                  Make changes to the case details.
                </DialogDescription>
              </DialogHeader>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
//                   updateCaseMutation({ caseId, formData });
                    setIsDialogOpen(false);
                }}
              >
                <div className="mb-4">
                  <Label htmlFor="name">Case Name</Label>
                  <Input
                    id="name"
                    name="name"
                    defaultValue={caseData.name}
                    required
                  />
                </div>
                <div className="mb-4">
                  <Label htmlFor="clientId">Client ID</Label>
                  <Input
                    id="clientId"
                    name="clientId"
                    defaultValue={caseData.clientId}
                    required
                  />
                </div>
                <div className="mb-4">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    name="description"
                    defaultValue={caseData.description}
                  />
                </div>
                <div className="mb-4">
                  <Label htmlFor="status">Status</Label>
                  <Input
                    id="status"
                    name="status"
                    defaultValue={caseData.status}
                  />
                </div>
                <DialogFooter>
                  <Button type="submit" /* disabled={isUpdating} */>
                    {/* {isUpdating ? 'Updating...' : 'Update Case'} */}
                    Update Case
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <Button variant="destructive" onClick={handleDelete}>
            Delete
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
