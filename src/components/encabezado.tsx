"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/auth-provider";
import { useToast } from "@/hooks/use-toast";
import api from "@/services/api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LogOut, User, Camera } from "lucide-react";

// =====================================
// ESTILOS Y CONFIGURACIÓN
// =====================================

// 🎨 COLORES Y ESTILOS DEL HEADER
const HEADER_STYLES = {
  // Color de fondo del header
  backgroundColor: "bg-card", // Cambiar: bg-blue-600, bg-slate-900, etc.

  // Color del borde inferior
  borderColor: "border-b border-slate-200", // Cambiar: border-blue-300, border-red-200, etc.

  // Sombra del header
  shadow: "shadow-sm", // Cambiar: shadow-md, shadow-lg, etc.

  // Color del texto general
  textColor: "text-card-foreground", // Cambiar: text-white, text-slate-900, etc.
};

// 🎨 ESTILOS DEL LOGO
const LOGO_STYLES = {
  // Tamaño del logo (width y height)
  width: 150, // Cambiar: 80, 120, 150, etc.
  height: 150, // Cambiar: 80, 120, 150, etc.

  // Clases CSS para el logo
  className: "h-32 w-32", // Cambiar: "h-20 w-20", "h-32 w-32", etc.

  // Tamaño del texto "LawCore"
  textSize: "text-3xl", // Cambiar: "text-sm", "text-2xl", "text-3xl", etc.

  // Peso de la fuente del logo
  fontWeight: "font-bold", // Cambiar: "font-semibold", "font-extrabold", etc.

  // Espaciado entre logo e imagen
  gap: "gap-4", // Cambiar: "gap-1", "gap-4", etc.
};

// 🎨 ESTILOS DEL AVATAR (PERFIL)
const AVATAR_STYLES = {
  // Tamaño del avatar en el dropdown
  avatarSize: "h-10 w-10", // Cambiar: "h-8 w-8", "h-12 w-12", etc.

  // Tamaño del avatar dentro del dropdown menu
  dropdownAvatarSize: "h-8 w-8", // Cambiar: "h-6 w-6", "h-10 w-10", etc.

  // Color de borde del avatar
  borderColor: "border-blue-300", // Cambiar: "border-red-300", "border-green-300", etc.

  // Grosor del borde
  borderWidth: "border-4", // Cambiar: "border-2", "border-8", etc.

  // Tamaño del nombre de usuario
  nameTextSize: "text-sm", // Cambiar: "text-xs", "text-base", etc.

  // Peso de la fuente del nombre
  nameFontWeight: "font-medium", // Cambiar: "font-semibold", "font-bold", etc.

  // Tamaño del email en el dropdown
  emailTextSize: "text-xs", // Cambiar: "text-sm", etc.
};

// 🎨 ESTILOS DE NAVEGACIÓN
const NAV_STYLES = {
  // Tamaño de fuente de los enlaces
  textSize: "text-base", // Cambiar: "text-2xl", "text-base", etc.

  // Peso de la fuente
  fontWeight: "font-medium", // Cambiar: "font-semibold", "font-bold", etc.

  // Color del texto normal
  textColor: "text-muted-foreground", // Cambiar: "text-slate-600", "text-gray-500", etc.

  // Color del texto al pasar el mouse
  hoverColor: "hover:text-foreground", // Cambiar: "hover:text-blue-600", etc.
};

// 🎨 ESTILOS DEL BOTÓN ADMIN
const BUTTON_ADMIN_STYLES = {
  variant: "outline", // Cambiar: "default", "ghost", "secondary", etc.
  size: "sm", // Cambiar: "xs", "md", "lg", etc.
  // Para más estilos, edita el componente Button
} as const; 

// 🎨 ESTILOS DEL BOTÓN LOGIN
const BUTTON_LOGIN_STYLES = {
  variant: "default", // Cambiar: "outline", "ghost", "secondary", etc.
  size: "sm", // Cambiar: "xs", "md", "lg", etc.
} as const;

// =====================================
// COMPONENTE PRINCIPAL
// =====================================

export default function Encabezado() {
  const { user, logout, updateUserContext } = useAuth();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(user?.photoURL || "");
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setAvatarUrl(user?.photoURL || "");
  }, [user?.photoURL]);

  const handleSignOut = async () => {
    await logout?.();
  };

  const getInitials = (name?: string | null) => {
    if (!name) return "";
    const names = name.split(" ");
    return names.map((n) => n[0]).join("").toUpperCase();
  };

  const handleAvatarFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Formato no soportado. Usa JPG, PNG o WEBP.",
      });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "La imagen no debe superar los 2MB.",
      });
      return;
    }

    try {
      setIsUploading(true);

      const formDataUpload = new FormData();
      formDataUpload.append("file", file);

      const response = await api.post("/upload/", formDataUpload);
      const uploadedUrl = response.data?.url;

      if (!uploadedUrl) {
        throw new Error("No se recibió URL tras subida.");
      }

      try {
        await api.put("/usuarios/me", { photoURL: uploadedUrl });
      } catch (err) {
        console.warn("No se pudo actualizar /usuarios/me:", err);
      }

      try {
        await updateUserContext?.();
      } catch (err) {
        console.warn("updateUserContext falló:", err);
      }

      setAvatarUrl(uploadedUrl);

      toast({
        title: "Éxito",
        description: "Avatar actualizado correctamente.",
      });
    } catch (err) {
      console.error("Error subiendo avatar:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo subir la imagen.",
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const isSuperAdmin = user?.role === "superadmin" || (user as any)?.es_admin === true;
  const isAdminAccess = isSuperAdmin || user?.role === "client";

  // =====================================
  // RENDER
  // =====================================
  console.log("USER:", user);
  return (
    <>
      {/* 🎨 HEADER - Modificar colores y estilos aquí */}
      <header className={`relative z-10 ${HEADER_STYLES.borderColor} ${HEADER_STYLES.backgroundColor} ${HEADER_STYLES.shadow} ${HEADER_STYLES.textColor}`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-24 items-center justify-between">
            
            {/* ========== SECCIÓN LOGO Y NAVEGACIÓN ========== */}
            <div className="flex items-center gap-8">
              
              {/* 🎨 LOGO - Modificar tamaño, color y fuente aquí */}
              <Link href="/" className={`flex items-center ${LOGO_STYLES.gap}`}>
                <Image
                  src="/logoLawCore.svg"
                  alt="LawCore Logo"
                  width={LOGO_STYLES.width}
                  height={LOGO_STYLES.height}
                  className={LOGO_STYLES.className}
                  priority
                />
                <span className={`${LOGO_STYLES.textSize} ${LOGO_STYLES.fontWeight} tracking-tight hidden sm:inline`}>
                  LawCore
                </span>
              </Link>

              {/* 🎨 NAVEGACIÓN - Modificar tamaño y color de fuente aquí */}
              <nav className={`hidden md:flex items-center gap-6 ${NAV_STYLES.textSize} ${NAV_STYLES.fontWeight}`}>
                <Link
                  href="/nosotros"
                  className={`${NAV_STYLES.textColor} transition-colors ${NAV_STYLES.hoverColor}`}
                >
                  Nosotros
                </Link>
                <Link
                  href="/contacto"
                  className={`${NAV_STYLES.textColor} transition-colors ${NAV_STYLES.hoverColor}`}
                >
                  Contacto
                </Link>
              </nav>
            </div>

            {/* ========== SECCIÓN ACCIONES DE USUARIO ========== */}
            <div className="flex items-center gap-4">
              {user ? (
                <>
                  {/* 🎨 BOTÓN ADMIN - Modificar estilo aquí */}
                  {isAdminAccess && (
                    <Link href="/admin/dashboard">
                      <Button variant={BUTTON_ADMIN_STYLES.variant} size={BUTTON_ADMIN_STYLES.size}>
                        Admin
                      </Button>
                    </Link>
                  )}

                  {/* ========== DROPDOWN MENU DE USUARIO ========== */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      {/* 🎨 AVATAR - Modificar tamaño y borde aquí */}
                      <Button variant="ghost" className={`relative ${AVATAR_STYLES.avatarSize} rounded-full p-0`}>
                        <Avatar className={AVATAR_STYLES.avatarSize}>
                          <AvatarImage
                            src={avatarUrl || ""}
                            alt={user?.displayName || "Usuario"}
                          />
                          <AvatarFallback>
                            {getInitials(user?.displayName)}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    
                    {/* ========== CONTENIDO DEL DROPDOWN ========== */}
                    <DropdownMenuContent align="end" className="w-56">
                      
                      {/* 🎨 INFO DE USUARIO EN DROPDOWN - Modificar tamaño y fuente aquí */}
                      <div className="flex items-center justify-start gap-2 p-2">
                        <Avatar className={AVATAR_STYLES.dropdownAvatarSize}>
                          <AvatarImage
                            src={avatarUrl || ""}
                            alt={user?.displayName || "Usuario"}
                          />
                          <AvatarFallback>
                            {getInitials(user?.displayName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col space-y-1">
                          <p className={`${AVATAR_STYLES.nameTextSize} ${AVATAR_STYLES.nameFontWeight} leading-none`}>
                            {user?.displayName || "Usuario"}
                          </p>
                          <p className={`${AVATAR_STYLES.emailTextSize} leading-none text-muted-foreground`}>
                            {user?.email}
                          </p>
                        </div>
                      </div>
                      <DropdownMenuSeparator />

                      {/* Opción: Mi Perfil */}
                      <DropdownMenuItem asChild>
                        <Link href="/perfil" className="cursor-pointer">
                          <User className="mr-2 h-4 w-4" />
                          <span>Mi Perfil</span>
                        </Link>
                      </DropdownMenuItem>

                      {/* Opción: Cambiar Foto */}
                      <DropdownMenuItem
                        onClick={triggerFileInput}
                        disabled={isUploading}
                      >
                        <Camera className="mr-2 h-4 w-4" />
                        <span>
                          {isUploading ? "Subiendo..." : "Cambiar Foto"}
                        </span>
                      </DropdownMenuItem>

                      <DropdownMenuSeparator />

                      {/* Opción: Cerrar sesión */}
                      <DropdownMenuItem onClick={handleSignOut}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Cerrar sesión</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Input file oculto para subir imagen */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleAvatarFile}
                    className="hidden"
                  />
                </>
              ) : (
                /* 🎨 BOTÓN LOGIN - Modificar estilo aquí */
                <Button variant={BUTTON_LOGIN_STYLES.variant} size={BUTTON_LOGIN_STYLES.size}>
                  Iniciar sesión
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
