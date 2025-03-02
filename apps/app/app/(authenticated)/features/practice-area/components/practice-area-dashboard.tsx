'use client';

import { useState } from 'react';
import { PracticeAreaOption } from '../actions/practice-area-actions';
import { usePracticeAreas } from '../hooks/use-practice-areas';
import { Button } from '@repo/design-system/components/ui/button';
import { Input } from '@repo/design-system/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@repo/design-system/components/ui/table';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@repo/design-system/components/ui/dropdown-menu';
import { Badge } from '@repo/design-system/components/ui/badge';
import { Edit, MoreHorizontal, Search, Trash } from 'lucide-react';
import { PracticeAreaDialog } from './practice-area-dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@repo/design-system/components/ui/alert-dialog';

interface PracticeAreaDashboardProps {
  initialData?: PracticeAreaOption[];
}

export function PracticeAreaDashboard({ initialData }: PracticeAreaDashboardProps) {
  const { 
    practiceAreas, 
    isLoading, 
    isFetching,
    delete: deletePracticeArea,
    isDeleting
  } = usePracticeAreas({ initialData });

  const [searchQuery, setSearchQuery] = useState('');
  const [editingPracticeArea, setEditingPracticeArea] = useState<PracticeAreaOption | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Filter practice areas based on search query
  const filteredPracticeAreas = practiceAreas.filter(area => 
    area.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (area.description && area.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleEdit = (practiceArea: PracticeAreaOption) => {
    setEditingPracticeArea(practiceArea);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    setDeletingId(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (deletingId) {
      await deletePracticeArea(deletingId);
      setIsDeleteDialogOpen(false);
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Buscar áreas de práctica..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPracticeAreas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-6 text-gray-500">
                  {isLoading || isFetching 
                    ? 'Cargando áreas de práctica...' 
                    : 'No se encontraron áreas de práctica'}
                </TableCell>
              </TableRow>
            ) : (
              filteredPracticeAreas.map((area) => (
                <TableRow key={area.id}>
                  <TableCell>{area.id}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{area.name}</div>
                      {area.description && (
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {area.description}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {area.active ? (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        Activa
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                        Inactiva
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Abrir menú</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleEdit(area)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDelete(area.id)}
                          className="text-red-600"
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Dialog */}
      {editingPracticeArea && (
        <PracticeAreaDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          title="Editar Área de Práctica"
          practiceArea={editingPracticeArea}
          onSuccess={() => setIsEditDialogOpen(false)}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará el área de práctica. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-red-500 hover:bg-red-600"
              disabled={isDeleting}
            >
              {isDeleting ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 