"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Home,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/auth-provider";
// import { useAdministrador } from "@/hooks/use-administrador"; // TODO

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  // Bypass isAdmin por ahora hasta tener lógica backend. Asumimos login = admin o check manual.
  // const { isAdmin, isLoading: isAdminLoading } = useAdministrador(); 
  const isAdmin = !!user; // TODO: Check real admin
  const isAdminLoading = authLoading;

  const pageTitle = React.useMemo(() => {
    if (pathname?.startsWith("/admin/notarias")) {
      return "Gestión de Notarías";
    }
     if (pathname?.startsWith("/admin/usuarios")) {
      return "Gestión de Usuarios";
    }
    if (pathname?.startsWith("/admin/dashboard/metricas")) {
      return "Métricas";
    }
    switch (pathname) {
      case "/admin/dashboard":
        return "Inicio";
      default:
        return "Admin";
    }
  }, [pathname]);

  const showHomeButton = pathname !== "/admin/dashboard";

  React.useEffect(() => {
    if (!isAdminLoading && !isAdmin) {
        router.push('/');
    }
  }, [isAdmin, isAdminLoading, router]);

  if (isAdminLoading || !isAdmin) {
     return (
      <div className="flex h-screen w-full flex-col">
        <div className="border-b p-4">
            <Skeleton className="h-10 w-64" />
        </div>
        <div className="flex-1 p-8">
            <Skeleton className="h-[400px] w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-background">
      <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 py-4">
        <div className="flex items-center gap-4">
          {showHomeButton && (
            <Button asChild variant="outline">
              <Link href="/admin/dashboard">
                <Home className="mr-2 h-4 w-4" />
                Ir al Inicio
              </Link>
            </Button>
          )}
          <h1 className="text-2xl font-bold">{pageTitle}</h1>
        </div>
        <div className="ml-auto">
            <Button asChild variant="outline">
              <Link href="/">
                <LogOut className="mr-2 h-4 w-4" />
                Salir del Admin
              </Link>
            </Button>
        </div>
      </header>
      <main className="p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
