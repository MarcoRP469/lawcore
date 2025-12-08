
import { PieDePagina, Encabezado } from "@/components/common";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function StaticLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Encabezado />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
            <Button asChild variant="outline" size="sm">
                <Link href="/" className="flex items-center gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Volver al Inicio
                </Link>
            </Button>
        </div>
        {children}
      </main>
      <PieDePagina />
    </div>
  );
}
