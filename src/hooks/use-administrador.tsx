"use client";

import { useMemo } from "react";
import { useUser } from "@/context/auth-provider";

// Hook para saber si un usuario es administrador
export function useAdministrador() {
  const user = useUser();

  const isAdmin = useMemo(() => {
    if (!user) return false;
    return user.es_admin === true; // ⚡ Usamos el campo de MySQL
  }, [user]);

  return {
    isAdmin,
    isLoading: false,
  };
}
