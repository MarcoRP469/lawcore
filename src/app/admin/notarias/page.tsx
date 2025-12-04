
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import TablaNotarias from "./_components/tabla-notarias";
import { Skeleton } from "@/components/ui/skeleton";
import FormularioNotaria from "./_components/formulario-notaria";
import type { Notaria } from "@/core/tipos";
import { useData } from "@/hooks/use-data";

export default function PaginaNotarias() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedNotary, setSelectedNotary] = useState<Notaria | null>(null);
  const { data: notaries, isLoading: notariesLoading } = useData<Notaria>("/notarias");

  const handleAddNew = () => {
    setSelectedNotary(null);
    setDialogOpen(true);
  };

  const handleEdit = (notary: Notaria) => {
    setSelectedNotary(notary);
    setDialogOpen(true);
  };
  
  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedNotary(null);
  };

  if (notariesLoading) {
    return (
      <div>
        <div className="flex justify-end mb-6">
          <Skeleton className="h-10 w-36" />
        </div>
        <Skeleton className="h-[500px] w-full" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-end mb-6">
        <Button onClick={handleAddNew}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Añadir Notaría
        </Button>
      </div>
      <TablaNotarias data={notaries || []} onEdit={handleEdit} />
      <FormularioNotaria
        isOpen={dialogOpen}
        onClose={handleDialogClose}
        notaria={selectedNotary}
      />
    </div>
  );
}
