"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Camera, User } from "lucide-react";
import api from "@/services/api";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";

export default function PaginaPerfil() {
  const { user, updateUserContext, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    bio: "",
    telefono: "",
    foto_url: ""
  });

  useEffect(() => {
    if (user) {
      setFormData({
        nombre: user.displayName || "",
        bio: user.bio || "",
        telefono: user.phoneNumber || "",
        foto_url: user.photoURL || ""
      });
    }
  }, [user]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validación básica
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error("Formato no soportado. Usa JPG, PNG o WEBP.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("La imagen no debe superar los 2MB.");
      return;
    }

    try {
      setLoading(true);
      const formDataUpload = new FormData();
      formDataUpload.append("file", file);

      // Subir archivo al backend (usamos la ruta de upload existente)
      // Omitimos Content-Type para que el navegador ponga el boundary
      const response = await api.post("/upload/", formDataUpload, {
        headers: {
            // "Content-Type": "multipart/form-data" // Axios lo pone auto
        }
      });

      const uploadedUrl = response.data.url;
      setFormData(prev => ({ ...prev, foto_url: uploadedUrl }));
      toast.success("Foto subida temporalmente. Guarda los cambios para aplicar.");
    } catch (error) {
      console.error(error);
      toast.error("Error al subir la imagen.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.put("/usuarios/me", {
        nombre: formData.nombre,
        bio: formData.bio,
        telefono: formData.telefono,
        foto_url: formData.foto_url
      });

      await updateUserContext(); // Refrescar contexto
      toast.success("Perfil actualizado correctamente");
    } catch (error) {
      console.error(error);
      toast.error("Error al actualizar perfil");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;
  if (!user) return <div className="p-8 text-center">Debes iniciar sesión para ver tu perfil.</div>;

  const getInitials = (name: string) => {
    if (!name) return "U";
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0,2);
  };

  return (
    <div className="container py-10 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Mi Perfil</CardTitle>
          <CardDescription>
            Gestiona tu información personal y visualiza tus datos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Avatar Section */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative group">
                <Avatar className="h-32 w-32 border-4 border-background shadow-lg">
                  <AvatarImage src={formData.foto_url} />
                  <AvatarFallback className="text-2xl">{getInitials(formData.nombre)}</AvatarFallback>
                </Avatar>
                <label
                  htmlFor="avatar-upload"
                  className="absolute bottom-0 right-0 p-2 bg-primary text-primary-foreground rounded-full cursor-pointer hover:bg-primary/90 transition-colors shadow-sm"
                >
                  <Camera size={18} />
                </label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                  disabled={loading}
                />
              </div>
              <p className="text-xs text-muted-foreground">Click en la cámara para cambiar foto (Max 2MB)</p>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre Completo</Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={e => setFormData({...formData, nombre: e.target.value})}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input
                id="email"
                value={user.email || ''}
                disabled
                className="bg-muted text-muted-foreground"
              />
              <p className="text-xs text-muted-foreground">El correo no se puede cambiar.</p>
            </div>

            <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono</Label>
                <Input
                    id="telefono"
                    value={formData.telefono}
                    onChange={e => setFormData({...formData, telefono: e.target.value})}
                    placeholder="+51 999 999 999"
                    disabled={loading}
                />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Biografía / Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={e => setFormData({...formData, bio: e.target.value})}
                placeholder="Cuéntanos un poco sobre ti..."
                className="resize-none"
                rows={4}
                disabled={loading}
              />
            </div>

             <div className="pt-4 flex justify-end">
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Guardar Cambios
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Sección Futura: Mis Comentarios / Favoritos */}
      <div className="mt-8 space-y-4">
          <h3 className="text-lg font-semibold">Mi Rol: <span className="uppercase text-primary">{user.role}</span></h3>
          <p className="text-sm text-muted-foreground">
             {user.role === 'public' && "Interactúa con las notarías comentando y guardando tus favoritas."}
             {user.role === 'client' && "Tienes permisos para gestionar tu notaría asignada."}
             {user.role === 'superadmin' && "Tienes control total del sistema."}
          </p>
      </div>
    </div>
  );
}
