
import Link from "next/link";
import Image from "next/image";

export default function PieDePagina() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-card text-card-foreground">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <Image
              src="/logoLawCore.svg"
              alt="LawCore Logo"
              width={96}
              height={96}
              className="h-24 w-24"
            />
            <span className="text-lg font-bold">LawCore</span>
          </div>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
            <Link href="/nosotros" className="hover:text-primary transition-colors">Nosotros</Link>
            <Link href="/contacto" className="hover:text-primary transition-colors">Contacto</Link>
            <Link href="/terminos" className="hover:text-primary transition-colors">Términos de Servicio</Link>
            <Link href="/privacidad" className="hover:text-primary transition-colors">Política de Privacidad</Link>
          </div>
        </div>
        <div className="mt-8 pt-4 border-t border-border/50 text-center text-sm">
           <p className="mb-2">“Compara notarías en Huaraz por horarios, servicios y costos de referencia. Datos independientes y actualizados.”</p>
          <p className="text-muted-foreground">&copy; {currentYear} LawCore. Todos los derechos reservados. Información con fines informativos. Ver <Link href="/terminos" className="underline">términos</Link>.</p>
        </div>
      </div>
    </footer>
  );
}
