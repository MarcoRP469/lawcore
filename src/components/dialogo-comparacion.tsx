
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Check, Mail, Minus, Phone, Users, Globe } from "lucide-react";
import type { Notaria } from "@/core/tipos";
import { TODOS_LOS_SERVICIOS } from "@/core/datos";

interface DialogoComparacionProps {
  notaries: Notaria[];
}

export default function DialogoComparacion({ notaries }: DialogoComparacionProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button disabled={notaries.length < 2}>
            <Users className="mr-2 h-4 w-4" /> Comparar ({notaries.length})
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Comparar Notarías</DialogTitle>
          <DialogDescription>
            Vea una comparación lado a lado de las notarías seleccionadas.
          </DialogDescription>
        </DialogHeader>
        <div className="overflow-auto max-h-[70vh]">
          <Table>
            <TableHeader className="sticky top-0 bg-background">
              <TableRow>
                <TableHead className="font-semibold">Característica</TableHead>
                {notaries.map((notary) => (
                  <TableHead key={notary.id} className="text-center font-semibold">{notary.name}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Distrito</TableCell>
                {notaries.map((notary) => (
                  <TableCell key={notary.id} className="text-center">{notary.district}</TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Disponibilidad</TableCell>
                {notaries.map((notary) => (
                  <TableCell key={notary.id} className="text-center">{notary.available ? "Disponible" : "No disponible"}</TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Calificación</TableCell>
                {notaries.map((notary) => (
                  <TableCell key={notary.id} className="text-center">{notary.rating} / 5</TableCell>
                ))}
              </TableRow>
              <TableRow className="bg-muted/50">
                  <TableCell colSpan={notaries.length + 1} className="font-semibold">Servicios</TableCell>
              </TableRow>
              {Object.values(TODOS_LOS_SERVICIOS).map((service) => (
                <TableRow key={service.name}>
                  <TableCell>{service.name}</TableCell>
                  {notaries.map((notary) => (
                    <TableCell key={notary.id} className="text-center">
                      {notary.services && notary.services.includes(service.name) ? (
                        <Check className="mx-auto h-5 w-5 text-green-500" />
                      ) : (
                        <Minus className="mx-auto h-5 w-5 text-muted-foreground" />
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
              <TableRow className="bg-muted/50">
                  <TableCell colSpan={notaries.length + 1} className="font-semibold">Contacto</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Celular</TableCell>
                {notaries.map((notary) => (
                  <TableCell key={notary.id} className="text-center">
                    <Button variant="ghost" size="sm" asChild>
                        <a href={`tel:${notary.phone}`}><Phone className="h-4 w-4"/></a>
                    </Button>
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell>Teléfono Fijo</TableCell>
                {notaries.map((notary) => (
                  <TableCell key={notary.id} className="text-center">
                    {notary.landline ? (
                        <Button variant="ghost" size="sm" asChild>
                            <a href={`tel:${notary.landline}`}><Phone className="h-4 w-4"/></a>
                        </Button>
                    ) : (
                        <Minus className="mx-auto h-5 w-5 text-muted-foreground" />
                    )}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell>Correo electrónico</TableCell>
                {notaries.map((notary) => (
                  <TableCell key={notary.id} className="text-center">
                    <Button variant="ghost" size="sm" asChild>
                        <a href={`mailto:${notary.email}`}><Mail className="h-4 w-4"/></a>
                    </Button>
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell>Página Web</TableCell>
                {notaries.map((notary) => (
                  <TableCell key={notary.id} className="text-center">
                    {notary.website ? (
                       <Button variant="ghost" size="sm" asChild>
                           <a href={notary.website} target="_blank" rel="noopener noreferrer"><Globe className="h-4 w-4"/></a>
                       </Button>
                    ) : (
                        <Minus className="mx-auto h-5 w-5 text-muted-foreground" />
                    )}
                  </TableCell>
                ))}
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
}
