
"use client";

import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Building, Users, BarChart3, CreditCard, Megaphone } from "lucide-react";
import { useUser } from "@/context/auth-provider";

const apps = [
  {
    title: "Gestión de Notarías",
    description: "Crear, editar y eliminar notarías. Gestionar servicios y disponibilidad.",
    href: "/admin/notarias",
    icon: <Building className="h-8 w-8 text-primary" />,
    roles: ["superadmin", "client"],
  },
  {
    title: "Gestión de Usuarios",
    description: "Ver, editar y asignar roles a los usuarios de la plataforma.",
    href: "/admin/usuarios",
    icon: <Users className="h-8 w-8 text-primary" />,
    roles: ["superadmin"],
  },
  {
    title: "Gestión de Anuncios",
    description: "Administra tus anuncios y ofertas. Requiere suscripción activa.",
    href: "/admin/anuncios",
    icon: <Megaphone className="h-8 w-8 text-primary" />,
    roles: ["superadmin", "client"],
  },
  {
    title: "Gestión de Suscripciones",
    description: "Crear y administrar planes de suscripción para anuncios premium.",
    href: "/admin/suscripciones",
    icon: <CreditCard className="h-8 w-8 text-primary" />,
    roles: ["superadmin"],
  },
  {
    title: "Métricas y Analíticas",
    description: "Visualizar estadísticas de visitas, usuarios y comentarios en la plataforma.",
    href: "/admin/dashboard/metricas",
    icon: <BarChart3 className="h-8 w-8 text-primary" />,
    roles: ["superadmin", "client"],
  },
];

export default function PaginaDashboard() {
  const user = useUser();
  // Determine if superadmin. Legacy support for es_admin boolean
  const isSuperAdmin = user?.role === 'superadmin' || user?.es_admin === true;
  const isClient = user?.role === 'client';

  // Filter apps based on role
  const visibleApps = apps.filter(app => {
    if (isSuperAdmin) return true;
    if (isClient && app.roles.includes("client")) return true;
    return false;
  });

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold font-headline">Espacio de Aplicaciones</h2>
        <p className="text-muted-foreground mt-2">Selecciona una herramienta para empezar a gestionar tu plataforma.</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {visibleApps.map((app) => (
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
