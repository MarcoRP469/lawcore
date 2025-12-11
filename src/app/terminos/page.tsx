
import type { Metadata } from 'next';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: 'Términos de Servicio | LawCore',
  description: 'Lee los términos y condiciones de uso de la plataforma LawCore.',
};

export default function PaginaTerminos() {
  return (
    <div className="bg-background text-foreground">
      <div className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-4xl">
          <div className="mb-6">
            <Button variant="ghost" asChild>
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver al inicio
              </Link>
            </Button>
          </div>
          <header className="text-center mb-16">
            <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl font-headline text-primary">
              Términos de Servicio
            </h1>
            <p className="mt-4 text-xl text-muted-foreground">
              Reglas de uso para una comunidad transparente y útil.
            </p>
            <p className="text-sm mt-2 text-muted-foreground">Última actualización: 26 de Noviembre de 2025</p>
          </header>

          <div className="prose prose-lg max-w-none text-foreground prose-headings:text-primary prose-headings:font-headline prose-a:text-primary prose-strong:text-foreground">

            <p>Nuestros términos de servicio están siendo revisados y actualizados para mejorar la experiencia en nuestra plataforma. Por favor, vuelve a consultar esta sección en una fecha posterior para ver la versión final.</p>

          </div>
        </div>
      </div>
    </div>
  );
}
