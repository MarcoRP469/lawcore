
"use client";

import * as React from "react";
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import DialogoAutenticacion from "./auth-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LayoutDashboard } from "lucide-react";
import { useUser, useAuth } from "@/context/auth-provider";
// import { useAdministrador } from "@/hooks/use-administrador"; // TODO

export default function Encabezado() {
  const user = useUser();
  const { logout } = useAuth();
  // const { isAdmin, isLoading: isAdminLoading } = useAdministrador();
  const isSuperAdmin = user?.role === 'superadmin' || user?.es_admin === true;
  const isAdminAccess = isSuperAdmin || user?.role === 'client';
  const isAdminLoading = false;
  const [authDialogOpen, setAuthDialogOpen] = React.useState(false);

  const handleSignOut = async () => {
    await logout();
  };

  const getInitials = (name?: string | null) => {
    if (!name) return "";
    const names = name.split(' ');
    return names.map(n => n[0]).join('').toUpperCase();
  }

  return (
    <>
      <header className="border-b bg-card shadow-sm text-card-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            <div className="flex items-center gap-6">
              <Link href="/" className="flex items-center gap-2">
                <Image
                  src="/logoLawCore.svg"
                  alt="LawCore Logo"
                  width={64}
                  height={64}
                  className="h-16 w-16"
                  priority
                />
                <span className="text-xl font-bold tracking-tight">
                  LawCore
                </span>
              </Link>
              <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
                <Link href="/nosotros" className="text-muted-foreground transition-colors hover:text-foreground">Nosotros</Link>
                <Link href="/contacto" className="text-muted-foreground transition-colors hover:text-foreground">Contacto</Link>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                       <Avatar className="h-10 w-10">
                        <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'Avatar'} />
                        <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.displayName || 'Usuario'}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/perfil">
                        <span className="mr-2">👤</span>
                        <span>Mi Perfil</span>
                      </Link>
                    </DropdownMenuItem>
                    {isAdminAccess && !isAdminLoading && (
                      <>
                        <DropdownMenuItem asChild>
                          <Link href="/admin/dashboard">
                            <LayoutDashboard className="mr-2 h-4 w-4" />
                            <span>{isSuperAdmin ? 'Panel de Administrador' : 'Gestionar mi Notaría'}</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={handleSignOut}>
                      Cerrar sesión
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  <Button variant="ghost" onClick={() => setAuthDialogOpen(true)}>Iniciar Sesión</Button>
                  <Button onClick={() => setAuthDialogOpen(true)}>Registrarse</Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>
      <DialogoAutenticacion open={authDialogOpen} onOpenChange={setAuthDialogOpen} />
    </>
  );
}
