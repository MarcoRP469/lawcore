
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

  const loading = usersLoading;

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

  const safeUsers = (users || []).map(u => ({
      ...u,
      role: u.role || 'public' // Fallback
  }));

  return (
    <div>
      <TablaUsuarios 
        data={safeUsers}
        currentUserId={currentUser?.id} 
      />
    </div>
  );
}
