
import type { Metadata } from 'next';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: 'Política de Privacidad | LawCore',
  description: 'Conoce cómo LawCore protege y gestiona tus datos personales de acuerdo a la ley peruana.',
};

export default function PaginaPoliticaPrivacidad() {
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
              Política de Privacidad
            </h1>
            <p className="mt-4 text-xl text-muted-foreground">
              Tu confianza y la protección de tus datos son nuestra prioridad.
            </p>
            <p className="text-sm mt-2 text-muted-foreground">Última actualización: 26 de Noviembre de 2025</p>
          </header>

          <div className="prose prose-lg max-w-none text-foreground prose-headings:text-primary prose-headings:font-headline prose-a:text-primary prose-strong:text-foreground">

            <p>Nuestra política de privacidad está siendo actualizada para ofrecerte mayor claridad y transparencia. Vuelve a consultar esta página pronto para ver la versión final.</p>

          </div>
        </div>
      </div>
    </div>
  );
}
