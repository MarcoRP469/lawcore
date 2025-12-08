
"use client";

/*
  Guía rápida — dónde cambiar colores, tamaños y fondos en este componente

  Este componente usa utilidades de Tailwind (clases en `className`) y tokens
  del sistema de diseño (por ejemplo `bg-card`, `text-primary`, `text-card-foreground`).

  Opciones para personalizar:
  - Cambiar clases directamente: edita las clases Tailwind en `className`.
    Ej: `text-2xl` -> `text-3xl` para un título más grande.

  - Usar tokens/variables del tema: muchos colores vienen del tema (p.ej. `text-primary`,
    `bg-card`). Para cambiar su valor global, modifica `tailwind.config.ts` o los
    tokens/variables CSS del proyecto (ver `tailwind.config.ts` y los archivos en `src/styles` si existen).

  - Reemplazar por clases personalizadas: si necesitas colores exactos, usa
    `className="bg-[#123456] text-[#fafafa]"` o define clases en tu CSS.

  Ejemplos rápidos:
  - Color del título: cambia `text-2xl` o `text-primary` en `CardTitle`.
  - Fondo de la tarjeta: `bg-card` en el `Card` — sustituir por `bg-white` o `bg-[#f3f4f6]`.
  - Color de iconos: `text-primary` en el icono — cámbialo por `text-red-500`.
  - Tamaño de icono: `h-4 w-4` -> `h-5 w-5` o `h-6 w-6`.
  - Espaciado: utilidades `space-y-2`, `pt-6`, `space-x-2` controlan separaciones verticales/horizontales.

  Si quieres, puedo aplicar cambios concretos (p.ej. aumentar todos los tamaños de icono
  o cambiar el fondo a `bg-white`). Dime qué prefieres.
*/

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { DISTRITOS, TODOS_LOS_SERVICIOS } from "@/core/datos";
import { type LucideIcon } from "lucide-react";

interface FiltrosNotariaProps {
  filters: {
    district: string;
    availableNow: boolean;
    services: string[];
  };
  onFilterChange: (filterType: string, value: any) => void;
  onServiceFilterChange: (service: string, checked: boolean) => void;
  resetFilters: () => void;
}


export default function FiltrosNotaria({ filters, onFilterChange, onServiceFilterChange, resetFilters }: FiltrosNotariaProps) {
  return (
    <Card className="sticky top-8 shadow-md bg-card text-card-foreground">
      {/*
        Cambiar fondo de la tarjeta:
        - `bg-card` es un token del tema.
        - Reemplazar por clases Tailwind p.ej. `bg-white`, `bg-gray-50` o `bg-[#f3f4f6]`.
      */}
      <CardHeader className="flex-row items-center justify-between">
        {/* Cambiar tamaño y color del título: `text-2xl` -> `text-3xl`, o añadir `text-primary` */}
        <CardTitle className="text-2xl">Filtros</CardTitle>
        <Button variant="link" className="p-0 h-auto" onClick={resetFilters}>Restablecer</Button>
      </CardHeader>
      <Separator />
      <CardContent className="pt-6 space-y-6">
        <div className="space-y-2">
          <Label htmlFor="district">Distrito</Label>
          <Select
            value={filters.district}
            onValueChange={(value) => onFilterChange("district", value)}
          >
            <SelectTrigger id="district" className="w-full">
              <SelectValue placeholder="Selecciona un distrito" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="!text-[#F3F5F7]">Todos los Distritos</SelectItem>
              {DISTRITOS.map((d) => (
                <SelectItem key={d} value={d}>{d}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="available-now">Disponible Ahora</Label>
          <Switch
            id="available-now"
            checked={filters.availableNow}
            onCheckedChange={(checked) => onFilterChange("availableNow", checked)}
          />
        </div>
        
        <Separator />

        <div className="space-y-4">
            {/* Cambiar estilo del encabezado de sección:
              - `font-semibold` controla peso de la fuente
              - `text-primary` controla color (cambiar token o reemplazar por `text-gray-800`)
            */}
            <h4 className="font-semibold text-primary">Servicios</h4>
            <div className="space-y-3">
                {Object.values(TODOS_LOS_SERVICIOS).map((service) => {
                    const Icon = service.icon as LucideIcon;
                    return (
                        <div key={service.name} className="flex items-center space-x-2">
                            <Checkbox
                                id={service.name}
                                checked={filters.services.includes(service.name)}
                                onCheckedChange={(checked) => onServiceFilterChange(service.name, !!checked)}
                            />
                    {/* Cambiar tamaño y color del icono:
                      - `h-4 w-4` -> `h-5 w-5` para icono más grande
                      - `text-primary` -> `text-indigo-600` o color literal
                    */}
                    <Label htmlFor={service.name} className="font-normal flex items-center gap-2 text-sm">
                      {Icon && <Icon className="h-4 w-4 text-primary" />}
                                {service.name}
                            </Label>
                        </div>
                    )
                })}
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
