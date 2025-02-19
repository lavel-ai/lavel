'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@repo/design-system/components/ui/card';
import { Button } from '@repo/design-system/components/ui/button';
import { PlusIcon } from 'lucide-react';
import CreateClientDialog from '../components/clients/create-client-dialog';

const ClientsPage = () => {
  return (
    <div className="p-4">
      {/* Create Client Card */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Clients</CardTitle>
          <CardDescription>Manage your clients.</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Existing content (e.g., a list of clients) would go here */}
          <p>Client list would go here...</p>
        </CardContent>
        <CardFooter>
          <CreateClientDialog>
            <Button>
                <PlusIcon className="mr-2 h-4 w-4" /> Add Client
            </Button>
          </CreateClientDialog>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ClientsPage; 