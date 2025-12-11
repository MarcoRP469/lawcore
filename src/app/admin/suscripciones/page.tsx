"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Edit, Trash2, Users } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import api from "@/services/api";

type Plan = {
    id: number;
    nombre: string;
    descripcion: string;
    precio: number;
    limiteAnuncios: number | null;
    duracionDias: number;
    caracteristicas: string[];
    activo: boolean;
};

export default function SuscripcionesPage() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [planes, setPlanes] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
    const [formData, setFormData] = useState({
        nombre: "",
        descripcion: "",
        precio: 0,
        limiteAnuncios: null as number | null,
        duracionDias: 30,
        caracteristicas: [] as string[],
        activo: true,
    });
    const [caracteristicaInput, setCaracteristicaInput] = useState("");

    useEffect(() => {
        fetchPlanes();
    }, []);

    const fetchPlanes = async () => {
        try {
            const response = await api.get("/suscripciones/planes?solo_activos=false");
            setPlanes(response.data);
        } catch (error) {
            console.error("Error al cargar planes:", error);
            toast({
                title: "Error",
                description: "No se pudieron cargar los planes",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (editingPlan) {
                await api.put(`/suscripciones/planes/${editingPlan.id}`, formData);
                toast({
                    title: "Plan actualizado",
                    description: "El plan se actualizó correctamente",
                });
            } else {
                await api.post("/suscripciones/planes", formData);
                toast({
                    title: "Plan creado",
                    description: "El plan se creó correctamente",
                });
            }

            setDialogOpen(false);
            resetForm();
            fetchPlanes();
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.response?.data?.detail || "No se pudo guardar el plan",
                variant: "destructive",
            });
        }
    };

    const handleDelete = async (planId: number) => {
        if (!confirm("¿Estás seguro de eliminar este plan?")) return;

        try {
            await api.delete(`/suscripciones/planes/${planId}`);
            toast({
                title: "Plan eliminado",
                description: "El plan se eliminó correctamente",
            });
            fetchPlanes();
        } catch (error) {
            toast({
                title: "Error",
                description: "No se pudo eliminar el plan",
                variant: "destructive",
            });
        }
    };

    const handleEdit = (plan: Plan) => {
        setEditingPlan(plan);
        setFormData({
            nombre: plan.nombre,
            descripcion: plan.descripcion,
            precio: plan.precio,
            limiteAnuncios: plan.limiteAnuncios,
            duracionDias: plan.duracionDias,
            caracteristicas: plan.caracteristicas || [],
            activo: plan.activo,
        });
        setDialogOpen(true);
    };

    const resetForm = () => {
        setEditingPlan(null);
        setFormData({
            nombre: "",
            descripcion: "",
            precio: 0,
            limiteAnuncios: null,
            duracionDias: 30,
            caracteristicas: [],
            activo: true,
        });
        setCaracteristicaInput("");
    };

    const agregarCaracteristica = () => {
        if (caracteristicaInput.trim()) {
            setFormData({
                ...formData,
                caracteristicas: [...formData.caracteristicas, caracteristicaInput.trim()],
            });
            setCaracteristicaInput("");
        }
    };

    const eliminarCaracteristica = (index: number) => {
        setFormData({
            ...formData,
            caracteristicas: formData.caracteristicas.filter((_, i) => i !== index),
        });
    };

    if (user?.role !== "superadmin") {
        return (
            <div className="container mx-auto py-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Acceso Denegado</CardTitle>
                        <CardDescription>
                            Solo los administradores pueden acceder a esta sección
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Gestión de Planes de Suscripción</h1>
                    <p className="text-muted-foreground mt-2">
                        Crea y administra los planes de suscripción para anuncios
                    </p>
                </div>
                <Dialog open={dialogOpen} onOpenChange={(open) => {
                    setDialogOpen(open);
                    if (!open) resetForm();
                }}>
                    <DialogTrigger asChild>
                        <Button>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Crear Plan
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{editingPlan ? "Editar Plan" : "Crear Nuevo Plan"}</DialogTitle>
                            <DialogDescription>
                                Configura los detalles del plan de suscripción
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="nombre">Nombre del Plan *</Label>
                                    <Input
                                        id="nombre"
                                        value={formData.nombre}
                                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="precio">Precio (S/) *</Label>
                                    <Input
                                        id="precio"
                                        type="number"
                                        step="0.01"
                                        value={formData.precio}
                                        onChange={(e) => setFormData({ ...formData, precio: parseFloat(e.target.value) })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="descripcion">Descripción</Label>
                                <Textarea
                                    id="descripcion"
                                    value={formData.descripcion}
                                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                                    rows={3}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="limiteAnuncios">Límite de Anuncios</Label>
                                    <Input
                                        id="limiteAnuncios"
                                        type="number"
                                        placeholder="Dejar vacío para ilimitado"
                                        value={formData.limiteAnuncios || ""}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            limiteAnuncios: e.target.value ? parseInt(e.target.value) : null
                                        })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="duracionDias">Duración (días)</Label>
                                    <Input
                                        id="duracionDias"
                                        type="number"
                                        value={formData.duracionDias}
                                        onChange={(e) => setFormData({ ...formData, duracionDias: parseInt(e.target.value) })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Características</Label>
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Ej: Soporte prioritario"
                                        value={caracteristicaInput}
                                        onChange={(e) => setCaracteristicaInput(e.target.value)}
                                        onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), agregarCaracteristica())}
                                    />
                                    <Button type="button" onClick={agregarCaracteristica} variant="outline">
                                        Agregar
                                    </Button>
                                </div>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {formData.caracteristicas.map((car, index) => (
                                        <Badge key={index} variant="secondary" className="gap-1">
                                            {car}
                                            <button
                                                type="button"
                                                onClick={() => eliminarCaracteristica(index)}
                                                className="ml-1 hover:text-destructive"
                                            >
                                                ×
                                            </button>
                                        </Badge>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="activo"
                                    checked={formData.activo}
                                    onCheckedChange={(checked) => setFormData({ ...formData, activo: checked })}
                                />
                                <Label htmlFor="activo">Plan activo</Label>
                            </div>

                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                                    Cancelar
                                </Button>
                                <Button type="submit">
                                    {editingPlan ? "Actualizar" : "Crear"} Plan
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <Card key={i} className="animate-pulse">
                            <CardHeader className="h-40 bg-gray-200" />
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {planes.map((plan) => (
                        <Card key={plan.id} className={!plan.activo ? "opacity-60" : ""}>
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="flex items-center gap-2">
                                            {plan.nombre}
                                            {!plan.activo && <Badge variant="secondary">Inactivo</Badge>}
                                        </CardTitle>
                                        <CardDescription className="mt-2">
                                            {plan.descripcion}
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="text-3xl font-bold">
                                        S/ {plan.precio.toFixed(2)}
                                        <span className="text-sm font-normal text-muted-foreground">
                                            /{plan.duracionDias} días
                                        </span>
                                    </div>

                                    <div className="space-y-1">
                                        <p className="text-sm font-medium">
                                            Límite: {plan.limiteAnuncios ? `${plan.limiteAnuncios} anuncios` : "Ilimitado"}
                                        </p>
                                    </div>

                                    {plan.caracteristicas && plan.caracteristicas.length > 0 && (
                                        <div className="space-y-2">
                                            <p className="text-sm font-medium">Características:</p>
                                            <ul className="text-sm space-y-1">
                                                {plan.caracteristicas.map((car, index) => (
                                                    <li key={index} className="flex items-start">
                                                        <span className="mr-2">✓</span>
                                                        <span>{car}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    <div className="flex gap-2 pt-4">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex-1"
                                            onClick={() => handleEdit(plan)}
                                        >
                                            <Edit className="h-4 w-4 mr-1" />
                                            Editar
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex-1 text-destructive hover:text-destructive"
                                            onClick={() => handleDelete(plan.id)}
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
            )}

            {!loading && planes.length === 0 && (
                <Card>
                    <CardContent className="py-12 text-center">
                        <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium">No hay planes creados</h3>
                        <p className="text-muted-foreground mt-2">
                            Crea tu primer plan de suscripción para empezar
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
