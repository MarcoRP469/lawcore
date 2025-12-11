"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Loader2,
  Camera,
  Mail,
  Phone,
  User,
  Shield,
  Star,
  Edit3,
  Check,
  Sparkles,
  ArrowLeft,
  Home
} from "lucide-react";
import api from "@/services/api";
import { useToast } from "@/hooks/use-toast";

export default function PaginaPerfil() {
  const router = useRouter();
  const { user, updateUserContext, loading: authLoading } = useAuth();
  const { toast } = useToast();
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

    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Formato no soportado. Usa JPG, PNG o WEBP."
      });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "La imagen no debe superar los 2MB."
      });
      return;
    }

    try {
      setLoading(true);
      const formDataUpload = new FormData();
      formDataUpload.append("file", file);

      const response = await api.post("/upload/", formDataUpload, {
        headers: {}
      });

      const uploadedUrl = response.data.url;
      setFormData(prev => ({ ...prev, foto_url: uploadedUrl }));
      toast({
        title: "Éxito",
        description: "Foto subida temporalmente. Guarda los cambios para aplicar."
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error al subir la imagen."
      });
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

      await updateUserContext();
      toast({
        title: "Éxito",
        description: "Perfil actualizado correctamente"
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error al actualizar perfil"
      });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="animate-spin h-12 w-12 text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <Shield className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg">Debes iniciar sesión para ver tu perfil.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getInitials = (name: string) => {
    if (!name) return "U";
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'superadmin': return 'from-purple-500 to-pink-500';
      case 'client': return 'from-blue-500 to-cyan-500';
      default: return 'from-amber-500 to-orange-500';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'superadmin': return <Shield className="h-4 w-4" />;
      case 'client': return <Star className="h-4 w-4" />;
      default: return <User className="h-4 w-4" />;
    }
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'public': return "Interactúa con las notarías comentando y guardando tus favoritas.";
      case 'client': return "Tienes permisos para gestionar tu notaría asignada.";
      case 'superadmin': return "Tienes control total del sistema.";
      default: return "";
    }
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <style jsx global>{`
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px hsl(var(--primary) / 0.3); }
          50% { box-shadow: 0 0 40px hsl(var(--primary) / 0.6); }
        }

        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient-shift 8s ease infinite;
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .glass-effect {
          background: hsl(var(--card));
          backdrop-filter: blur(10px);
          border: 1px solid hsl(var(--border));
        }

        .input-glow:focus {
          box-shadow: 0 0 0 3px hsl(var(--primary) / 0.2);
        }
      `}</style>

      <div className="container max-w-4xl mx-auto">
        {/* Header con gradiente animado */}
        <div className="relative mb-8 overflow-hidden rounded-3xl">
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-primary animate-gradient opacity-90"></div>
          <div className="relative px-8 py-12">
            {/* Botón de volver */}
            <Button
              onClick={() => router.push('/')}
              variant="ghost"
              className="absolute top-4 left-4 text-primary-foreground hover:bg-primary-foreground/20 transition-all duration-300 group"
            >
              <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
              Volver al inicio
            </Button>

            <div className="text-center">
              <Sparkles className="h-8 w-8 mx-auto mb-4 text-primary-foreground animate-float" />
              <h1 className="text-4xl font-bold text-primary-foreground mb-2">Mi Perfil</h1>
              <p className="text-primary-foreground/90">Gestiona tu información personal</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Columna izquierda - Avatar y Rol */}
          <div className="md:col-span-1 space-y-6">
            {/* Avatar Card */}
            <Card className="glass-effect overflow-hidden">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center gap-4">
                  <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-full blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
                    <Avatar className="relative h-32 w-32 border-4 border-background shadow-2xl">
                      <AvatarImage src={formData.foto_url} />
                      <AvatarFallback className="text-3xl bg-gradient-to-br from-primary to-accent text-primary-foreground">
                        {getInitials(formData.nombre)}
                      </AvatarFallback>
                    </Avatar>
                    <label
                      htmlFor="avatar-upload"
                      className="absolute bottom-0 right-0 p-3 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-full cursor-pointer hover:scale-110 transition-transform shadow-lg"
                    >
                      <Camera size={20} />
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
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-card-foreground">{formData.nombre || "Usuario"}</h3>
                    <p className="text-sm text-card-foreground/70 mt-1">Actualiza tu foto de perfil</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Rol Card */}
            <Card className="glass-effect overflow-hidden">
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${getRoleBadgeColor(user.role)} text-white font-semibold shadow-lg`}>
                    {getRoleIcon(user.role)}
                    <span className="uppercase text-sm">{user.role}</span>
                  </div>
                  <p className="text-sm text-card-foreground/80 leading-relaxed">
                    {getRoleDescription(user.role)}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Stats Card */}
            <Card className="glass-effect">
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-primary" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-card-foreground/60 font-medium">Email</p>
                      <p className="text-sm text-card-foreground font-medium truncate">{user.email}</p>
                    </div>
                  </div>
                  {formData.telefono && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-primary" />
                      <div className="flex-1">
                        <p className="text-xs text-card-foreground/60 font-medium">Teléfono</p>
                        <p className="text-sm text-card-foreground font-medium">{formData.telefono}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Columna derecha - Formulario */}
          <div className="md:col-span-2">
            <Card className="glass-effect">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Edit3 className="h-5 w-5 text-primary" />
                  <CardTitle className="text-card-foreground">Editar Información</CardTitle>
                </div>
                <CardDescription className="text-card-foreground/70">
                  Actualiza tus datos personales
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Nombre */}
                  <div className="space-y-2">
                    <Label htmlFor="nombre" className="text-card-foreground font-medium flex items-center gap-2">
                      <User className="h-4 w-4 text-primary" />
                      Nombre Completo
                    </Label>
                    <Input
                      id="nombre"
                      value={formData.nombre}
                      onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                      disabled={loading}
                      className="bg-background/50 border-border text-card-foreground placeholder:text-card-foreground/40 focus:border-primary input-glow transition-all"
                      placeholder="Tu nombre completo"
                    />
                  </div>

                  {/* Email (disabled) */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-card-foreground font-medium flex items-center gap-2">
                      <Mail className="h-4 w-4 text-primary" />
                      Correo Electrónico
                    </Label>
                    <Input
                      id="email"
                      value={user.email || ''}
                      disabled
                      className="bg-background/30 border-border text-card-foreground/60"
                    />
                    <p className="text-xs text-card-foreground/60 flex items-center gap-1">
                      <Shield className="h-3 w-3" />
                      El correo no se puede cambiar por seguridad
                    </p>
                  </div>

                  {/* Teléfono */}
                  <div className="space-y-2">
                    <Label htmlFor="telefono" className="text-card-foreground font-medium flex items-center gap-2">
                      <Phone className="h-4 w-4 text-primary" />
                      Teléfono
                    </Label>
                    <Input
                      id="telefono"
                      value={formData.telefono}
                      onChange={e => setFormData({ ...formData, telefono: e.target.value })}
                      placeholder="+51 999 999 999"
                      disabled={loading}
                      className="bg-background/50 border-border text-card-foreground placeholder:text-card-foreground/40 focus:border-primary input-glow transition-all"
                    />
                  </div>

                  {/* Bio */}
                  <div className="space-y-2">
                    <Label htmlFor="bio" className="text-card-foreground font-medium flex items-center gap-2">
                      <Edit3 className="h-4 w-4 text-primary" />
                      Biografía
                    </Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={e => setFormData({ ...formData, bio: e.target.value })}
                      placeholder="Cuéntanos un poco sobre ti..."
                      className="resize-none bg-background/50 border-border text-card-foreground placeholder:text-card-foreground/40 focus:border-primary input-glow transition-all min-h-[120px]"
                      rows={5}
                      disabled={loading}
                    />
                    <p className="text-xs text-card-foreground/60">
                      {formData.bio.length}/500 caracteres
                    </p>
                  </div>

                  {/* Botón de guardar */}
                  <div className="pt-4">
                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground font-semibold py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Guardando...
                        </>
                      ) : (
                        <>
                          <Check className="mr-2 h-5 w-5" />
                          Guardar Cambios
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
