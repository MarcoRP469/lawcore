
"use client";

import * as React from "react";
import { useMemo, useState } from "react";
import Image from "next/image";
import Encabezado from "@/components/encabezado";
import PieDePagina from "@/components/pie-de-pagina";
import FiltrosNotaria from "@/components/filtros-notaria";
import TarjetaNotaria from "@/components/tarjeta-notaria";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import type { Notaria } from "@/core/tipos";
import DialogoComparacion from "@/components/dialogo-comparacion";
import { Skeleton } from "@/components/ui/skeleton";
import { useData } from "@/hooks/use-data";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    district: "all",
    availableNow: false,
    services: [] as string[],
  });
  const [comparisonList, setComparisonList] = useState<number[]>([]);
  const { data: notaries, isLoading: notariesLoading } = useData<Notaria>("/notarias");

  const handleFilterChange = (filterType: string, value: any) => {
    setFilters((prev) => ({ ...prev, [filterType]: value }));
  };

  const handleServiceFilterChange = (service: string, checked: boolean) => {
    setFilters((prev) => {
      const newServices = checked
        ? [...prev.services, service]
        : prev.services.filter((s) => s !== service);
      return { ...prev, services: newServices };
    });
  };

  const toggleCompare = (notaryId: number) => {
    setComparisonList((prev) =>
      prev.includes(notaryId)
        ? prev.filter((id) => id !== notaryId)
        : [...prev, notaryId]
    );
  };

  const filteredNotaries = useMemo(() => {
    if (!notaries) return [];
    return notaries.filter((notary) => {
      const matchesSearch =
        searchQuery === "" ||
        notary.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (notary.services && notary.services.some((service) =>
          service.toLowerCase().includes(searchQuery.toLowerCase())
        ));

      const matchesDistrict =
        filters.district === "all" || notary.district === filters.district;

      const matchesAvailability = !filters.availableNow || notary.available;
      
      const matchesServices =
        filters.services.length === 0 ||
        (notary.services && filters.services.every((service) => notary.services.includes(service)));

      return matchesSearch && matchesDistrict && matchesAvailability && matchesServices;
    });
  }, [searchQuery, filters, notaries]);

  const notariesToCompare = useMemo(() => {
    if (!notaries) return [];
    return notaries.filter((notary) => comparisonList.includes(notary.id));
  }, [comparisonList, notaries]);
  
  const resetFilters = () => {
    setFilters({
      district: "all",
      availableNow: false,
      services: [],
    });
    setSearchQuery("");
  };

  return (
    <div className="flex flex-col min-h-screen bg-background relative">
       <div className="fixed inset-0 flex items-center justify-center pointer-events-none -z-10 opacity-5">
        <Image
          src="/logoLawCore.svg"
          alt="LawCore Watermark"
          width={500}
          height={500}
          priority
        />
      </div>
      <Encabezado />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold font-headline text-foreground">
            Encuentra una Notaría en Huaraz
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Tu socio de confianza para todos los servicios notariales. Busca por nombre o servicio para encontrar al profesional adecuado para tus necesidades.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 lg:gap-12">
          <aside className="lg:col-span-1 mb-8 lg:mb-0">
            <FiltrosNotaria
              filters={filters}
              onFilterChange={handleFilterChange}
              onServiceFilterChange={handleServiceFilterChange}
              resetFilters={resetFilters}
            />
          </aside>

          <main className="lg:col-span-3">
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar por nombre de notaría o servicio..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-14 text-lg w-full rounded-lg shadow-sm"
              />
               {searchQuery && (
                <Button variant="ghost" size="icon" className="absolute right-4 top-1/2 -translate-y-1/2" onClick={() => setSearchQuery('')}>
                  <X className="h-5 w-5 text-muted-foreground" />
                </Button>
              )}
            </div>

            <div className="mb-4 text-sm text-muted-foreground">
              Mostrando {filteredNotaries.length} de {notaries?.length || 0} notarías.
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {notariesLoading ? (
                <>
                  <Skeleton className="h-[450px] w-full" />
                  <Skeleton className="h-[450px] w-full" />
                </>
              ) : filteredNotaries.length > 0 ? (
                filteredNotaries.map((notary) => (
                  <TarjetaNotaria
                    key={notary.id}
                    notary={notary}
                    onCompareToggle={toggleCompare}
                    isComparing={comparisonList.includes(notary.id)}
                  />
                ))
              ) : (
                <div className="col-span-full text-center py-16 bg-card rounded-lg shadow-sm">
                  <h3 className="text-xl font-semibold">No se encontraron notarías</h3>
                  <p className="text-muted-foreground mt-2">Intenta ajustar tu búsqueda o filtros, o añade una nueva notaría en el panel de administración.</p>
                  <Button variant="outline" className="mt-4" onClick={resetFilters}>Restablecer filtros</Button>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
      <PieDePagina />
      {comparisonList.length > 0 && (
         <div className="sticky bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-sm border-t z-10">
            <div className="container mx-auto flex items-center justify-between">
                <p className="font-semibold">{comparisonList.length} Notar{comparisonList.length > 1 ? 'ías' : 'ía'} seleccionada</p>
                <div className="flex items-center gap-4">
                     <Button variant="ghost" onClick={() => setComparisonList([])}>Limpiar</Button>
                     <DialogoComparacion notaries={notariesToCompare} />
                </div>
            </div>
         </div>
      )}
    </div>
  );
}
