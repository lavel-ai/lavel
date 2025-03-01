// apps/app/app/(authenticated)/features/departments/components/create-department-dialog.tsx
'use client';

import { Button } from "@repo/design-system/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@repo/design-system/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@repo/design-system/components/ui/drawer";
import { useIsMobile } from "@repo/design-system/hooks/use-mobile";
import { useState } from "react";
import { Plus } from "lucide-react";
import { DepartmentForm } from "./department-form";

interface CreateDepartmentDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function CreateDepartmentDialog({ 
  open: controlledOpen, 
  onOpenChange: setControlledOpen 
}: CreateDepartmentDialogProps) {
  const isMobile = useIsMobile();
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);

  // Handle both controlled and uncontrolled states
  const open = controlledOpen !== undefined ? controlledOpen : uncontrolledOpen;
  const setOpen = setControlledOpen || setUncontrolledOpen;
  
  // Close the dialog on successful form submission
  const handleSuccess = () => {
    setOpen(false);
  };

  // Show nothing while detecting mobile state
  if (typeof isMobile === 'undefined') {
    return null;
  }

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Crear Departamento
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Crear Nuevo Departamento</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 py-6">
            <DepartmentForm onSuccess={handleSuccess} />
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Crear Departamento
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Departamento</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <DepartmentForm onSuccess={handleSuccess} />
        </div>
      </DialogContent>
    </Dialog>
  );
}