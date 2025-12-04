"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import type { Notaria } from "@/core/tipos";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import api from "@/services/api";
import { useToast } from "@/hooks/use-toast";

interface TablaNotariasProps {
  data: Notaria[];
  onEdit: (notaria: Notaria) => void;
}

export default function TablaNotarias({ data, onEdit }: TablaNotariasProps) {
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const { toast } = useToast();

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await api.delete(`/notarias/${deletingId}`);
      toast({ title: "Notaría eliminada" });
      window.location.reload();
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Error al eliminar" });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Distrito</TableHead>
            <TableHead>Teléfono</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((notaria) => (
            <TableRow key={notaria.id}>
              <TableCell className="font-medium">{notaria.name}</TableCell>
              <TableCell>{notaria.district}</TableCell>
              <TableCell>{notaria.phone}</TableCell>
              <TableCell>
                <span className={`px-2 py-1 rounded-full text-xs ${notaria.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {notaria.available ? 'Disponible' : 'No disponible'}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="icon" onClick={() => onEdit(notaria)}>
                  <Edit className="h-4 w-4" />
                </Button>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={() => setDeletingId(notaria.id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta acción no se puede deshacer. Esto eliminará permanentemente la notaría y sus datos.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel onClick={() => setDeletingId(null)}>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Eliminar</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
