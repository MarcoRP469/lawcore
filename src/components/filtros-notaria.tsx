
"use client";

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
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="text-xl">Filtros</CardTitle>
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
              <SelectItem value="all">Todos los Distritos</SelectItem>
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
