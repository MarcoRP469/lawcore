
"use client";

import { useMemo } from "react";
import TablaUsuarios from "./_components/tabla-usuarios";
import type { Usuario } from "@/core/tipos";
import { Skeleton } from "@/components/ui/skeleton";
import { useData } from "@/hooks/use-data";
import { useUser } from "@/context/auth-provider";

export default function PaginaUsuarios() {
  const currentUser = useUser();

  const { data: users, isLoading: usersLoading } = useData<Usuario>("/usuarios");
  // Simular admins obteniendo usuarios y filtrando? O asumir que el backend ya maneja permisos.
  // Por ahora dejamos admins vacío o lo implementamos en el backend como /usuarios/admins
  const { data: admins, isLoading: adminsLoading } = useData<{id: string}>("/admins");

  const adminUIDs = useMemo(() => (admins || []).map(admin => admin.id), [admins]);
  const loading = usersLoading || adminsLoading;

  if (loading) {
    return (
      <div>
        <div className="flex items-center py-4">
          <Skeleton className="h-10 w-full max-w-sm" />
        </div>
        <Skeleton className="h-[500px] w-full" />
      </div>
    );
  }

  return (
    <div>
      <TablaUsuarios 
        data={users || []} 
        admins={adminUIDs}
        currentUserId={currentUser?.id} 
      />
    </div>
  );
}
