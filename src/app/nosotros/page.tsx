
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Handshake, Target, TestTube, Search, Shield, Users } from "lucide-react";
import type { Metadata } from 'next';
import Link from "next/link";

export const metadata: Metadata = {
  title: 'Sobre Nosotros | LawCore',
  description: 'Conoce la misión, metodología y valores de LawCore, la plataforma independiente para comparar notarías en Huaraz.',
};

const ValueCard = ({ icon, title, children }: { icon: React.ReactNode, title: string, children: React.ReactNode }) => (
  <div className="flex items-start gap-4">
    <div className="mt-1 text-primary">{icon}</div>
    <div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-muted-foreground">{children}</p>
    </div>
  </div>
);

export default function PaginaNosotros() {
  return (
    <div className="bg-background text-foreground">
      <div className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-4xl">
          <header className="text-center mb-16">
            <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl font-headline text-primary">
              Sobre LawCore
            </h1>
            <p className="mt-4 text-xl text-muted-foreground">
              Independencia, claridad y servicio a la comunidad de Huaraz.
            </p>
          </header>

          <div className="space-y-12">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">¿Quiénes somos?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg leading-relaxed">
                  LawCore es una plataforma independiente que ayuda a las personas de Huaraz a encontrar y comparar notarías según horario, servicios, costos de referencia y opiniones verificadas. Nuestro objetivo es que puedas elegir con confianza y ahorrar tiempo.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">¿Qué hacemos?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-lg">
                <p>Reunimos información pública y de fuente directa (webs oficiales, llamadas, visitas y usuarios verificados).</p>
                <p>La normalizamos para que puedas comparar “manzana con manzana”.</p>
                <p>Actualizamos los datos de forma periódica y mostramos la fecha de última actualización en cada ficha.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Nuestros Valores</CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-8">
                <ValueCard icon={<Shield className="h-6 w-6"/>} title="Independencia">
                  No favorecemos a ninguna notaría. La información se presenta de forma objetiva para que tú decidas.
                </ValueCard>
                <ValueCard icon={<Search className="h-6 w-6"/>} title="Claridad">
                  Transformamos datos complejos en información fácil de entender, para que tomes decisiones informadas.
                </ValueCard>
                <ValueCard icon={<Users className="h-6 w-6"/>} title="Servicio a la Comunidad">
                  Creemos que el acceso a información clara es un derecho. Nuestra plataforma es y será siempre gratuita para los usuarios.
                </ValueCard>
                <ValueCard icon={<Handshake className="h-6 w-6"/>} title="Transparencia">
                  Comunicamos abiertamente cómo funciona nuestra plataforma y cómo se financia.
                </ValueCard>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Metodología de Comparación</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-lg">Para ofrecerte una visión completa, ponderamos diversos factores:</p>
                <ul className="list-disc list-inside space-y-2 text-lg">
                  <li><strong>Cobertura de servicios (40%):</strong> La variedad y especialización de los trámites que ofrece cada notaría.</li>
                  <li><strong>Horarios y tiempos de atención (25%):</strong> Flexibilidad y disponibilidad para atender al público.</li>
                  <li><strong>Transparencia de tarifas (20%):</strong> Facilidad para acceder a costos de referencia.</li>
                  <li><strong>Accesibilidad/Ubicación (10%):</strong> Facilidad para llegar a sus oficinas.</li>
                  <li><strong>Satisfacción de usuarios (5%):</strong> Opiniones y valoraciones de usuarios verificados.</li>
                </ul>
                <p className="mt-4 text-sm text-muted-foreground">Nota: Las ponderaciones pueden ajustarse según encuestas locales; los cambios se publican en esta página.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Financiación y Alcance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-lg">
                <div>
                  <h3 className="font-semibold text-primary">¿Cómo financiamos el proyecto?</h3>
                  <p>La plataforma es gratuita para usuarios. Podemos recibir ingresos por espacios publicitarios claramente señalizados o acuerdos de visibilidad con notarías (que nunca influyen en el ranking). Siempre indicamos cualquier relación comercial.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-primary">Alcance y Limitaciones</h3>
                  <p>No somos una notaría ni brindamos asesoría legal. La información es de carácter informativo y puede variar. Verifica siempre los datos directamente con la notaría antes de iniciar un trámite.</p>
                </div>
                 <div>
                  <h3 className="font-semibold text-primary">Transparencia y Correcciones</h3>
                  <p>¿Detectaste un error? Escríbenos a través de nuestra <Link href="/contacto" className="underline hover:text-primary">página de contacto</Link> y lo revisaremos en un máximo de 72 horas.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
