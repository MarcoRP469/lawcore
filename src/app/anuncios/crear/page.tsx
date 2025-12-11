"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AdCreate } from '@/types/ad';
import { Loader2, UploadCloud } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function CrearAnuncioPage() {
    const { user, loading: authLoading } = useAuth(); // Asumiendo que existe un AuthContext
    const router = useRouter();
    const { toast } = useToast();

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<Partial<AdCreate>>({
        tipo: 'oferta',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (value: string) => {
        setFormData(prev => ({ ...prev, tipo: value as any }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            toast({
                title: "Error de autenticación",
                description: "Debes iniciar sesión para publicar un anuncio",
                variant: "destructive",
            });
            return;
        }

        setLoading(true);
        try {
            // Validaciones básicas
            if (!formData.titulo || !formData.descripcion || !formData.tipo) {
                throw new Error("Por favor completa los campos requeridos");
            }

            const token = localStorage.getItem("token");
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/anuncios/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    ...formData,
                    precio: formData.precio ? Number(formData.precio) : undefined,
                }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.detail || 'Error al crear anuncio');
            }

            toast({
                title: "¡Anuncio publicado!",
                description: "Tu anuncio ha sido creado exitosamente.",
            });

            router.push('/anuncios');
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    if (authLoading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;

    if (!user) {
        return (
            <div className="container mx-auto py-20 text-center">
                <h1 className="text-2xl font-bold mb-4">Acceso Restringido</h1>
                <p className="mb-8 text-gray-600">Necesitas iniciar sesión para publicar anuncios.</p>
                <Button onClick={() => router.push('/login')}>Ir a Login</Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-10 max-w-2xl text-black">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">Publicar Nuevo Anuncio</CardTitle>
                    <CardDescription>
                        Completa el formulario para publicar tu oferta, demanda o promoción.
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="titulo">Título del Anuncio *</Label>
                            <Input
                                id="titulo"
                                name="titulo"
                                placeholder="Ej: Busco notario para escrituras urgentes"
                                value={formData.titulo || ''}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="tipo">Tipo de Anuncio *</Label>
                                <Select value={formData.tipo} onValueChange={handleSelectChange}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona un tipo" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="oferta">Oferta</SelectItem>
                                        <SelectItem value="demanda">Demanda</SelectItem>
                                        <SelectItem value="promocion">Promoción</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="precio">Precio (S/) (Opcional)</Label>
                                <Input
                                    id="precio"
                                    name="precio"
                                    type="number"
                                    placeholder="0.00"
                                    step="0.01"
                                    value={formData.precio || ''}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="descripcion">Descripción Detallada *</Label>
                            <Textarea
                                id="descripcion"
                                name="descripcion"
                                placeholder="Describe los detalles de lo que ofreces o buscas..."
                                className="h-32"
                                value={formData.descripcion || ''}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="imagen_url">URL de Imagen (Opcional)</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="imagen_url"
                                    name="imagen_url"
                                    placeholder="https://ejemplo.com/imagen.jpg"
                                    value={formData.imagen_url || ''}
                                    onChange={handleChange}
                                />
                                {/* Aquí se podría integrar un subidor de archivos real más adelante */}
                                <Button type="button" variant="outline" size="icon" title="Subir imagen (Próximamente)">
                                    <UploadCloud className="h-4 w-4" />
                                </Button>
                            </div>
                            <p className="text-xs text-gray-500">Por ahora pega una URL de imagen externa.</p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="contacto">Información de Contacto (Opcional)</Label>
                            <Input
                                id="contacto"
                                name="contacto"
                                placeholder="Teléfono, Email o WhatsApp adicional"
                                value={formData.contacto || ''}
                                onChange={handleChange}
                            />
                        </div>

                    </CardContent>
                    <CardFooter className="flex justify-between">
                        <Button variant="ghost" type="button" onClick={() => router.back()}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Publicar Anuncio
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
