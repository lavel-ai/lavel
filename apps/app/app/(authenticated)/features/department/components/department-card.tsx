// apps/app/app/(authenticated)/features/departments/components/department-card.tsx
import { Card, CardContent, CardHeader } from "@repo/design-system/components/ui/card";
import { Button } from "@repo/design-system/components/ui/button";
import { Edit, Trash2, Building, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@repo/design-system/components/ui/dropdown-menu';
import type { Department } from "../actions/get-departments";

interface DepartmentCardProps {
  department: Department;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function DepartmentCard({ department, onEdit, onDelete }: DepartmentCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-all border border-border h-[140px] flex flex-col">
      <div className="h-1 bg-gradient-to-r from-primary to-primary/80 w-full"></div>
      
      <CardHeader className="pb-1 pt-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Building className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-sm line-clamp-1">{department.name}</h3>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <MoreHorizontal className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(department.id)}>
                <Edit className="h-3.5 w-3.5 mr-2" />
                Editar Departamento
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete(department.id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5 mr-2" />
                Eliminar Departamento
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="flex-grow py-1 px-3 flex flex-col justify-between">
        <div className="space-y-1.5">
          {department.description ? (
            <p className="text-xs text-muted-foreground line-clamp-3">{department.description}</p>
          ) : (
            <p className="text-xs text-muted-foreground italic">Sin descripción</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}