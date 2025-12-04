
"use client";

import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Building, Users, BarChart3 } from "lucide-react";

const apps = [
  {
    title: "Gestión de Notarías",
    description: "Crear, editar y eliminar notarías. Gestionar servicios y disponibilidad.",
    href: "/admin/notarias",
    icon: <Building className="h-8 w-8 text-primary" />,
  },
  {
    title: "Gestión de Usuarios",
    description: "Ver, editar y asignar roles a los usuarios de la plataforma.",
    href: "/admin/usuarios",
    icon: <Users className="h-8 w-8 text-primary" />,
  },
  {
    title: "Métricas y Analíticas",
    description: "Visualizar estadísticas de visitas, usuarios y comentarios en la plataforma.",
    href: "/admin/dashboard/metricas",
    icon: <BarChart3 className="h-8 w-8 text-primary" />,
  },
];

export default function PaginaDashboard() {
  return (
    <div className="space-y-8">
       <div>
        <h2 className="text-3xl font-bold font-headline">Espacio de Aplicaciones</h2>
        <p className="text-muted-foreground mt-2">Selecciona una herramienta para empezar a gestionar tu plataforma.</p>
       </div>
       <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {apps.map((app) => (
            <Link href={app.href} key={app.title} className="group">
                <Card className="h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-primary/50">
                    <CardHeader>
                        <div className="mb-4">{app.icon}</div>
                        <CardTitle className="text-xl">{app.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CardDescription>{app.description}</CardDescription>
                    </CardContent>
                </Card>
            </Link>
        ))}
       </div>
    </div>
  );
}
