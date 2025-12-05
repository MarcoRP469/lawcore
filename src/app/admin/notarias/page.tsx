"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import TablaNotarias from "./_components/tabla-notarias";
import { Skeleton } from "@/components/ui/skeleton";
import FormularioNotaria from "./_components/formulario-notaria";
import type { Notaria } from "@/core/tipos";
import { useData } from "@/hooks/use-data";
import { useAuth } from "@/context/auth-provider";

export default function PaginaNotarias() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedNotary, setSelectedNotary] = useState<Notaria | null>(null);

  const { user } = useAuth();
  const isClient = user?.role === 'client';
  const isSuperAdmin = user?.role === 'superadmin' || user?.es_admin === true;

  // Filtrado de data en base al rol
  // Si es client, solo obtener sus notarias (backend puede filtrar por owner_id si se pasa parametro,
  // o podemos filtrar aqui client-side si traemos todas. Lo ideal es backend.)
  // Modificaremos useData o pasaremos el owner_id como prop si el hook lo soporta,
  // pero dado que el hook es generico, filtramos aqui por seguridad visual (backend ya protege endpoints).

  // Vamos a usar el endpoint general y pasar parametro owner_id
  const endpoint = isClient ? `/notarias?owner_id=${user?.id}` : "/notarias";
  const { data: notaries, isLoading: notariesLoading } = useData<Notaria>(endpoint);

  const handleAddNew = () => {
    setSelectedNotary(null);
    setDialogOpen(true);
  };

  const handleEdit = (notary: Notaria) => {
    setSelectedNotary(notary);
    setDialogOpen(true);
  };
  
  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedNotary(null);
  };

  if (notariesLoading) {
    return (
      <div>
        <div className="flex justify-end mb-6">
          <Skeleton className="h-10 w-36" />
        </div>
        <Skeleton className="h-[500px] w-full" />
      </div>
    );
  }

  // Regla de Negocio: Client solo puede añadir 1 notaria.
  // Si ya tiene una en la lista, ocultar boton "Añadir".
  const clientHasNotary = isClient && notaries && notaries.length > 0;
  const showAddButton = isSuperAdmin || (isClient && !clientHasNotary);

  return (
    <div>
      {showAddButton && (
        <div className="flex justify-end mb-6">
          <Button onClick={handleAddNew}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Añadir Notaría
          </Button>
        </div>
      )}

      {isClient && notaries?.length === 0 && (
          <div className="text-center p-8 border rounded-lg bg-muted/20">
              <h3 className="font-semibold text-lg">Bienvenido al Panel de Notario</h3>
              <p className="text-muted-foreground mb-4">Aún no has registrado tu notaría.</p>
              <Button onClick={handleAddNew}>Registrar mi Notaría</Button>
          </div>
      )}

      {notaries && notaries.length > 0 && (
          <TablaNotarias
            data={notaries || []}
            onEdit={handleEdit}
            userRole={user?.role} // Pasar rol a la tabla para ocultar/mostrar botones
          />
      )}

      <FormularioNotaria
        isOpen={dialogOpen}
        onClose={handleDialogClose}
        notaria={selectedNotary}
      />
    </div>
  );
}
