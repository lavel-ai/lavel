'use client';

import { Button } from '@repo/design-system/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@repo/design-system/components/ui/dialog';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@repo/design-system/components/ui/drawer';
import { ScrollArea } from '@repo/design-system/components/ui/scroll-area';
import { useIsMobile } from '@repo/design-system/hooks/use-mobile';
import { PlusIcon } from 'lucide-react';
import { useState } from 'react';
import ClientForm from './client-form';

interface CreateClientDialogProps {
  children?: React.ReactNode;
}

const CreateClientDialog: React.FC<CreateClientDialogProps> = ({
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();

  const closeDialog = () => {
    setIsOpen(false);
  };

  const Trigger = children ? (
    children
  ) : (
    <Button>
      <PlusIcon className="mr-2 h-4 w-4" /> Add Client
    </Button>
  );

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={setIsOpen}>
        <DrawerTrigger asChild>{Trigger}</DrawerTrigger>
        <DrawerContent className="min-h-[400px] p-6 sm:max-w-[800px]">
          <DrawerHeader>
            <DrawerTitle>Agregar Cliente</DrawerTitle>
            <DrawerDescription>Agrega un nuevo cliente.</DrawerDescription>
          </DrawerHeader>
          <ScrollArea className="h-[calc(100vh-10rem)] px-1">
            <ClientForm closeDialog={closeDialog} />
          </ScrollArea>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{Trigger}</DialogTrigger>
      <DialogContent className="h-[800px] p-6 sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Agregar Cliente</DialogTitle>
          <DialogDescription>Agrega un nuevo cliente.</DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[calc(100%-5rem)] px-1">
          <ClientForm closeDialog={closeDialog} />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default CreateClientDialog;
