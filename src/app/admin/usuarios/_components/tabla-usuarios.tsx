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
import { Shield, ShieldAlert, Trash2 } from "lucide-react";
import type { Usuario } from "@/core/tipos";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import api from "@/services/api";
import { useToast } from "@/hooks/use-toast";

interface TablaUsuariosProps {
  data: Usuario[];
  admins: string[];
  currentUserId?: string | null;
}

export default function TablaUsuarios({ data, admins, currentUserId }: TablaUsuariosProps) {
  const { toast } = useToast();

  const toggleAdmin = async (userId: string, isAdmin: boolean) => {
    // Para implementar esto necesitamos un endpoint en backend tipo POST /usuarios/{id}/toggle-admin
    // o modificar el usuario.
    // Simularemos el error por ahora o dejamos el placeholder.
    toast({ title: "Función no implementada en backend aún" });
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Usuario</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Rol</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((usuario) => {
            const isAdmin = admins.includes(usuario.id);
            return (
              <TableRow key={usuario.id}>
                <TableCell className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={usuario.photoURL || ""} />
                    <AvatarFallback>{usuario.displayName?.substring(0,2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{usuario.displayName || "Sin nombre"}</span>
                </TableCell>
                <TableCell>{usuario.email}</TableCell>
                <TableCell>
                  {isAdmin ? (
                     <span className="flex items-center gap-1 text-primary font-bold text-xs">
                        <Shield className="h-3 w-3" /> Admin
                     </span>
                  ) : (
                    <span className="text-muted-foreground text-xs">Usuario</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                    {usuario.id !== currentUserId && (
                        <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => toggleAdmin(usuario.id, isAdmin)}
                            title={isAdmin ? "Quitar admin" : "Hacer admin"}
                        >
                            {isAdmin ? <ShieldAlert className="h-4 w-4 text-orange-500" /> : <Shield className="h-4 w-4" />}
                        </Button>
                    )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
