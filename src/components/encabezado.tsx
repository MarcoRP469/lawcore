
"use client";

import * as React from "react";
import { Button } from '@/components/ui/button';
import Link from 'next/link';
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

const LawCoreLogo = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 200 200"
    className={className}
    fill="currentColor"
    stroke="currentColor"
  >
    <circle cx="100" cy="100" r="95" strokeWidth="2" fill="none" className="stroke-primary" />
    <circle cx="100" cy="100" r="88" strokeWidth="1.5" fill="none" className="stroke-primary" />
    <circle cx="100" cy="100" r="68" strokeWidth="1.5" fill="none" className="stroke-primary" />
    <path d="M 32,100 H 168" strokeWidth="1.5" fill="none" className="stroke-primary" />
    <path d="M 100,32 V 80" strokeWidth="1.5" fill="none" className="stroke-primary" />
    <text x="100" y="45" textAnchor="middle" fontSize="14" fontWeight="bold" letterSpacing="2" className="fill-primary">
        LawCore
    </text>
    <text x="100" y="168" textAnchor="middle" fontSize="10" fontWeight="bold" letterSpacing="1" className="fill-primary">
        NOTARIAS LEGALES
    </text>
    <text x="60" y="105" fontSize="16" fontWeight="bold" textAnchor="middle" className="fill-primary">M</text>
    <text x="140" y="105" fontSize="16" fontWeight="bold" textAnchor="middle" className="fill-primary">S</text>
    <g transform="translate(100, 100) scale(0.6)">
        <path d="M -20,65 C -40,40 -40,10 -20,-15 C -35,10 -35,40 -20,65" strokeWidth="3" fill="none" className="stroke-primary"/>
        <path d="M -22,55 L -35,45" strokeWidth="3" fill="none" className="stroke-primary"/>
        <path d="M -22,40 L -38,28" strokeWidth="3" fill="none" className="stroke-primary"/>
        <path d="M -22,25 L -35,15" strokeWidth="3" fill="none" className="stroke-primary"/>
        <path d="M -22,10 L -32,3" strokeWidth="3" fill="none" className="stroke-primary"/>
        <path d="M -22,-5 L -30,-12" strokeWidth="3" fill="none" className="stroke-primary"/>
    </g>
     <g transform="translate(100, 100) scale(0.6) scale(-1, 1)">
        <path d="M -20,65 C -40,40 -40,10 -20,-15 C -35,10 -35,40 -20,65" strokeWidth="3" fill="none" className="stroke-primary"/>
        <path d="M -22,55 L -35,45" strokeWidth="3" fill="none" className="stroke-primary"/>
        <path d="M -22,40 L -38,28" strokeWidth="3" fill="none" className="stroke-primary"/>
        <path d="M -22,25 L -35,15" strokeWidth="3" fill="none" className="stroke-primary"/>
        <path d="M -22,10 L -32,3" strokeWidth="3" fill="none" className="stroke-primary"/>
        <path d="M -22,-5 L -30,-12" strokeWidth="3" fill="none" className="stroke-primary"/>
    </g>
    <g transform="translate(100, 75)" className="stroke-primary fill-primary">
        <path d="M -20,48 A 20,8 0 0,0 20,48 H -20 Z" strokeWidth="1.5" />
        <path d="M -15,40 A 15,6 0 0,0 15,40 H -15 Z" strokeWidth="1.5"/>
        <path d="M 0,40 V 10" strokeWidth="1.5" />
        <circle cx="0" cy="0" r="8" />
        <path d="M -3,10 L -18,18 L -18,28 L -3,18 Z" /> 
        <path d="M 3,10 L 18,18 L 18,28 L 3,18 Z" />
        <g transform="translate(0, 15)">
            <path d="M -40,0 H 40" strokeWidth="2" fill="none" />
            <g transform="translate(-30, 0)">
                <path d="M 0,0 V 5" strokeWidth="1.5" fill="none" />
                <path d="M -8,5 H 8" strokeWidth="1.5" fill="none" />
                <path d="M -8,5 C -8,15 8,15 8,5" strokeWidth="1.5" fill="none" />
            </g>
            <g transform="translate(30, 0)">
                <path d="M 0,0 V 5" strokeWidth="1.5" fill="none" />
                <path d="M -8,5 H 8" strokeWidth="1.5" fill="none" />
                <path d="M -8,5 C -8,15 8,15 8,5" strokeWidth="1.5" fill="none" />
            </g>
        </g>
    </g>
  </svg>
);

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
                <LawCoreLogo className="h-16 w-16 text-primary" />
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
