"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Edit, Trash2, AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import api from "@/services/api";
import Link from "next/link";

type Anuncio = {
    id: number;
    titulo: string;
    descripcion: string;
    tipo: string;
    precio?: number;
    contacto?: string;
    imagen_url?: string;
    usuario_id?: string;
    creado_en: string;
};

type PlanInfo = {
    plan: {
        nombre: string;
        limite_anuncios: number | null;
    } | null;
    estado: string;
    fecha_fin: string | null;
    anuncios_usados: number;
    anuncios_disponibles: number | null;
};

export default function AnunciosAdminPage() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [anuncios, setAnuncios] = useState<Anuncio[]>([]);
    const [planInfo, setPlanInfo] = useState<PlanInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingAnuncio, setEditingAnuncio] = useState<Anuncio | null>(null);
    const [formData, setFormData] = useState({
        titulo: "",
        descripcion: "",
        tipo: "oferta",
        precio: "",
        contacto: "",
    });

    useEffect(() => {
        fetchAnuncios();
        fetchPlanInfo();
    }, []);

    const fetchAnuncios = async () => {
        try {
            const response = await api.get("/anuncios");
            // Filtrar solo los anuncios del usuario actual
            const misAnuncios = response.data.filter((a: Anuncio) => a.usuario_id === user?.id);
            setAnuncios(misAnuncios);
        } catch (error) {
            console.error("Error al cargar anuncios:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchPlanInfo = async () => {
        try {
            const response = await api.get("/suscripciones/mi-plan");
            setPlanInfo(response.data);
        } catch (error) {
            console.error("Error al cargar plan:", error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validar suscripción antes de crear
        if (!editingAnuncio && planInfo) {
            if (planInfo.estado !== 'activa') {
                toast({
                    title: "Suscripción requerida",
                    description: "Necesitas una suscripción activa para publicar anuncios",
                    variant: "destructive",
                });
                return;
            }

            if (planInfo.anuncios_disponibles !== null && planInfo.anuncios_disponibles <= 0) {
                toast({
                    title: "Límite alcanzado",
                    description: `Has alcanzado el límite de ${planInfo.plan?.limite_anuncios} anuncios de tu plan`,
                    variant: "destructive",
                });
                return;
            }
        }

        try {
            const payload = {
                ...formData,
                precio: formData.precio ? parseFloat(formData.precio) : null,
            };

            if (editingAnuncio) {
                await api.put(`/anuncios/${editingAnuncio.id}`, payload);
                toast({
                    title: "Anuncio actualizado",
                    description: "El anuncio se actualizó correctamente",
                });
            } else {
                await api.post("/anuncios", payload);
                toast({
                    title: "Anuncio creado",
                    description: "El anuncio se publicó correctamente",
                });
            }

            setDialogOpen(false);
            resetForm();
            fetchAnuncios();
            fetchPlanInfo();
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.response?.data?.detail || "No se pudo guardar el anuncio",
                variant: "destructive",
            });
        }
    };

    const handleDelete = async (anuncioId: number) => {
        if (!confirm("¿Estás seguro de eliminar este anuncio?")) return;

        try {
            await api.delete(`/anuncios/${anuncioId}`);
            toast({
                title: "Anuncio eliminado",
                description: "El anuncio se eliminó correctamente",
            });
            fetchAnuncios();
            fetchPlanInfo();
        } catch (error) {
            toast({
                title: "Error",
                description: "No se pudo eliminar el anuncio",
                variant: "destructive",
            });
        }
    };

    const handleEdit = (anuncio: Anuncio) => {
        setEditingAnuncio(anuncio);
        setFormData({
            titulo: anuncio.titulo,
            descripcion: anuncio.descripcion,
            tipo: anuncio.tipo,
            precio: anuncio.precio?.toString() || "",
            contacto: anuncio.contacto || "",
        });
        setDialogOpen(true);
    };

    const resetForm = () => {
        setEditingAnuncio(null);
        setFormData({
            titulo: "",
            descripcion: "",
            tipo: "oferta",
            precio: "",
            contacto: "",
        });
    };

    const canCreateAd = planInfo?.estado === 'activa' &&
        (planInfo.anuncios_disponibles === null || planInfo.anuncios_disponibles > 0);

    return (
        <div className="container mx-auto py-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Gestión de Anuncios</h1>
                    <p className="text-muted-foreground mt-2">
                        Administra tus anuncios y ofertas
                    </p>
                </div>
                <Dialog open={dialogOpen} onOpenChange={(open) => {
                    setDialogOpen(open);
                    if (!open) resetForm();
                }}>
                    <DialogTrigger asChild>
                        <Button disabled={!canCreateAd}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Crear Anuncio
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>{editingAnuncio ? "Editar Anuncio" : "Crear Nuevo Anuncio"}</DialogTitle>
                            <DialogDescription>
                                Completa la información de tu anuncio
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="titulo">Título *</Label>
                                <Input
                                    id="titulo"
                                    value={formData.titulo}
                                    onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="descripcion">Descripción *</Label>
                                <Textarea
                                    id="descripcion"
                                    value={formData.descripcion}
                                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                                    rows={4}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="tipo">Tipo *</Label>
                                    <Select value={formData.tipo} onValueChange={(value) => setFormData({ ...formData, tipo: value })}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="oferta">Oferta</SelectItem>
                                            <SelectItem value="demanda">Demanda</SelectItem>
                                            <SelectItem value="promocion">Promoción</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="precio">Precio (S/)</Label>
                                    <Input
                                        id="precio"
                                        type="number"
                                        step="0.01"
                                        value={formData.precio}
                                        onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="contacto">Contacto</Label>
                                <Input
                                    id="contacto"
                                    value={formData.contacto}
                                    onChange={(e) => setFormData({ ...formData, contacto: e.target.value })}
                                    placeholder="Email o teléfono"
                                />
                            </div>

                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                                    Cancelar
                                </Button>
                                <Button type="submit">
                                    {editingAnuncio ? "Actualizar" : "Crear"} Anuncio
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Información del Plan */}
            {planInfo && (
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="text-lg">Estado de Suscripción</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {planInfo.estado === 'activa' && planInfo.plan ? (
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">Plan: {planInfo.plan.nombre}</p>
                                    <p className="text-sm text-muted-foreground">
                                        Anuncios: {planInfo.anuncios_usados} / {planInfo.plan.limite_anuncios || '∞'}
                                    </p>
                                    {planInfo.fecha_fin && (
                                        <p className="text-sm text-muted-foreground">
                                            Válido hasta: {new Date(planInfo.fecha_fin).toLocaleDateString()}
                                        </p>
                                    )}
                                </div>
                                <Badge variant="default">Activa</Badge>
                            </div>
                        ) : (
                            <div className="flex items-start gap-3 p-4 border border-destructive rounded-lg bg-destructive/10">
                                <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                                <div>
                                    <p className="font-medium text-destructive">Sin suscripción activa</p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Necesitas una suscripción activa para publicar anuncios.
                                        <Link href="/suscripciones" className="underline ml-1 text-primary">
                                            Ver planes disponibles
                                        </Link>
                                    </p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Lista de Anuncios */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <Card key={i} className="animate-pulse">
                            <CardHeader className="h-40 bg-gray-200" />
                        </Card>
                    ))}
                </div>
            ) : anuncios.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {anuncios.map((anuncio) => (
                        <Card key={anuncio.id}>
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <CardTitle className="text-lg">{anuncio.titulo}</CardTitle>
                                    <Badge variant={
                                        anuncio.tipo === 'oferta' ? 'default' :
                                            anuncio.tipo === 'demanda' ? 'secondary' : 'outline'
                                    }>
                                        {anuncio.tipo}
                                    </Badge>
                                </div>
                                <CardDescription className="line-clamp-2">
                                    {anuncio.descripcion}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {anuncio.precio && (
                                        <p className="text-lg font-bold">S/ {anuncio.precio.toFixed(2)}</p>
                                    )}
                                    {anuncio.contacto && (
                                        <p className="text-sm text-muted-foreground">
                                            Contacto: {anuncio.contacto}
                                        </p>
                                    )}
                                    <p className="text-xs text-muted-foreground">
                                        Publicado: {new Date(anuncio.creado_en).toLocaleDateString()}
                                    </p>
                                    <div className="flex gap-2 pt-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex-1"
                                            onClick={() => handleEdit(anuncio)}
                                        >
                                            <Edit className="h-4 w-4 mr-1" />
                                            Editar
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex-1 text-destructive hover:text-destructive"
                                            onClick={() => handleDelete(anuncio.id)}
                                        >
                                            <Trash2 className="h-4 w-4 mr-1" />
                                            Eliminar
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card>
                    <CardContent className="py-12 text-center">
                        <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium">No tienes anuncios publicados</h3>
                        <p className="text-muted-foreground mt-2">
                            {canCreateAd ? "Crea tu primer anuncio para empezar" : "Activa una suscripción para publicar anuncios"}
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
