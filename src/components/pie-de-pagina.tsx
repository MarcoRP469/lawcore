
import Link from "next/link";

const LawCoreLogo = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 200 200"
    className={className}
    fill="currentColor"
    stroke="currentColor"
  >
    {/* Outer Circles */}
    <circle cx="100" cy="100" r="95" strokeWidth="2" fill="none" className="stroke-primary" />
    <circle cx="100" cy="100" r="88" strokeWidth="1.5" fill="none" className="stroke-primary" />

    {/* Inner Structure */}
    <circle cx="100" cy="100" r="68" strokeWidth="1.5" fill="none" className="stroke-primary" />
    <path d="M 32,100 H 168" strokeWidth="1.5" fill="none" className="stroke-primary" />
    <path d="M 100,32 V 80" strokeWidth="1.5" fill="none" className="stroke-primary" />

    {/* Text */}
    <text x="100" y="45" textAnchor="middle" fontSize="14" fontWeight="bold" letterSpacing="2" className="fill-primary">
        LawCore
    </text>
    <text x="100" y="168" textAnchor="middle" fontSize="10" fontWeight="bold" letterSpacing="1" className="fill-primary">
        NOTARIAS LEGALES
    </text>
    <text x="60" y="105" fontSize="16" fontWeight="bold" textAnchor="middle" className="fill-primary">M</text>
    <text x="140" y="105" fontSize="16" fontWeight="bold" textAnchor="middle" className="fill-primary">S</text>

    {/* Laurel Wreath */}
    <g transform="translate(100, 100) scale(0.6)">
        <path d="M -20,65 C -40,40 -40,10 -20,-15 C -35,10 -35,40 -20,65" strokeWidth="3" fill="none" className="stroke-primary"/>
        <path d="M -22,55 L -35,45" strokeWidth="3" fill="none" className="stroke-primary"/>
        <path d="M -22,40 L -38,28" strokeWidth="3" fill="none" className="stroke-primary"/>
        <path d="M -22,25 L -35,15" strokeWidth="3" fill="none" className="stroke-primary"/>
        <path d="M -22,10 L -32,3" strokeWidth="3" fill="none" className="stroke-primary"/>
        <path d="M -22,-5 L -30,-12" strokeWidth="3" fill="none" className="stroke-primary"/>
    </g>
     <g transform="translate(100, 100) scale(0.6) scale(-1, 1)">
        <path d="M -20,65 C -40,40 -40,10 -20,-15 C -35,10 -35,40 -20,65" strokeWidth="3" fill="none" className="stroke-primary"/>
        <path d="M -22,55 L -35,45" strokeWidth="3" fill="none" className="stroke-primary"/>
        <path d="M -22,40 L -38,28" strokeWidth="3" fill="none" className="stroke-primary"/>
        <path d="M -22,25 L -35,15" strokeWidth="3" fill="none" className="stroke-primary"/>
        <path d="M -22,10 L -32,3" strokeWidth="3" fill="none" className="stroke-primary"/>
        <path d="M -22,-5 L -30,-12" strokeWidth="3" fill="none" className="stroke-primary"/>
    </g>

    {/* Central Figure */}
    <g transform="translate(100, 75)" className="stroke-primary fill-primary">
        {/* Base */}
        <path d="M -20,48 A 20,8 0 0,0 20,48 H -20 Z" strokeWidth="1.5" />
        <path d="M -15,40 A 15,6 0 0,0 15,40 H -15 Z" strokeWidth="1.5"/>

        {/* Body */}
        <path d="M 0,40 V 10" strokeWidth="1.5" />
        <circle cx="0" cy="0" r="8" />
        <path d="M -3,10 L -18,18 L -18,28 L -3,18 Z" /> 
        <path d="M 3,10 L 18,18 L 18,28 L 3,18 Z" />

        {/* Arms / Scales */}
        <g transform="translate(0, 15)">
            <path d="M -40,0 H 40" strokeWidth="2" fill="none" />
            
            {/* Left Scale */}
            <g transform="translate(-30, 0)">
                <path d="M 0,0 V 5" strokeWidth="1.5" fill="none" />
                <path d="M -8,5 H 8" strokeWidth="1.5" fill="none" />
                <path d="M -8,5 C -8,15 8,15 8,5" strokeWidth="1.5" fill="none" />
            </g>
            
            {/* Right Scale */}
            <g transform="translate(30, 0)">
                <path d="M 0,0 V 5" strokeWidth="1.5" fill="none" />
                <path d="M -8,5 H 8" strokeWidth="1.5" fill="none" />
                <path d="M -8,5 C -8,15 8,15 8,5" strokeWidth="1.5" fill="none" />
            </g>
        </g>
    </g>
  </svg>
);

export default function PieDePagina() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-card text-card-foreground">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <LawCoreLogo className="h-10 w-10 text-primary" />
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
