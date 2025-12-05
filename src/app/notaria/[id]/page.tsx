
"use client";

import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Encabezado from "@/components/encabezado";
import PieDePagina from "@/components/pie-de-pagina";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Home, Phone, Mail, MapPin, Star, ArrowLeft, Briefcase, FileText, CheckCircle2, MessageSquare, UserCircle, Video, Globe, Facebook, Instagram, Linkedin, User } from "lucide-react";
import FormularioComentario from "@/components/formulario-comentario";
import ListaComentarios from "@/components/lista-comentarios";
import { useMemo } from "react";
import type { Notaria, Comentario } from "@/core/tipos";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { useData, useOneData } from "@/hooks/use-data";
import { useUser } from "@/context/auth-provider";
import { Separator } from "@/components/ui/separator";

const TikTokIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M16 4h4v4" />
        <path d="M12 20v-8.5a4.5 4.5 0 1 1 4.5 4.5H12" />
        <path d="M12 4v4" />
        <path d="M20 8.5a4.5 4.5 0 1 0-4.5 4.5H20" />
    </svg>
);

const CalificacionEstrellas = ({ rating, count }: { rating: number, count: number }) => {
    const totalStars = 5;
    const fullStars = Math.floor(rating);
    const partialStarPercentage = Math.round((rating - fullStars) * 100);

    return (
        <div className="flex items-center">
        {[...Array(totalStars)].map((_, i) => {
            const starIndex = i + 1;
            if (starIndex <= fullStars) {
            return <Star key={i} className="h-5 w-5 fill-primary text-primary" />;
            }
            if (starIndex === fullStars + 1 && partialStarPercentage > 0) {
            return (
                <div key={i} className="relative h-5 w-5">
                <Star className="absolute h-5 w-5 fill-muted text-border" />
                <div
                    className="absolute h-5 w-5 overflow-hidden"
                    style={{ width: `${partialStarPercentage}%` }}
                >
                    <Star className="h-5 w-5 fill-primary text-primary" />
                </div>
                </div>
            );
            }
            return <Star key={i} className="h-5 w-5 fill-muted text-border" />;
        })}
        <span className="ml-2 text-lg font-bold text-foreground">{rating.toFixed(1)}</span>
        {count > 0 && <span className="ml-2 text-sm text-muted-foreground">({count} {count === 1 ? 'opinión' : 'opiniones'})</span>}
        </div>
    );
};

export default function PaginaDetalleNotaria() {
  const params = useParams();
  const notaryId = params.id as string;
  const user = useUser();
  
  const { data: notary, isLoading: notaryLoading } = useOneData<Notaria>(`/notarias/${notaryId}`);
  const { data: comments, isLoading: commentsLoading } = useData<Comentario>(`/comentarios?notaria_id=${notaryId}`);

  const { averageRating, totalComments } = useMemo(() => {
    if (!comments || comments.length === 0) {
      return { averageRating: notary?.rating || 0, totalComments: 0 };
    }
    const totalRating = comments.reduce((acc, comment) => acc + comment.rating, 0);
    return {
      averageRating: totalRating / comments.length,
      totalComments: comments.length,
    };
  }, [comments, notary?.rating]);
  
  if (notaryLoading) {
    return (
        <div className="flex flex-col min-h-screen bg-background">
          <Encabezado />
          <main className="flex-grow container mx-auto px-4 py-12">
             <div className="mb-8">
                <Skeleton className="h-9 w-32" />
             </div>
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-1">
                    <Skeleton className="h-96 w-full" />
                </div>
                <div className="lg:col-span-2 space-y-12">
                    <Skeleton className="h-64 w-full" />
                    <Skeleton className="h-80 w-full" />
                </div>
             </div>
          </main>
          <PieDePagina />
        </div>
    )
  }

  if (!notary) {
    return (
      <div className="flex flex-col min-h-screen">
        <Encabezado />
        <main className="flex-grow container mx-auto px-4 py-8 text-center">
          <h1 className="text-4xl font-bold">Notaría no encontrada</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            La notaría que buscas no existe o ha sido eliminada.
          </p>
          <Button asChild className="mt-8">
            <Link href="/">Volver al inicio</Link>
          </Button>
        </main>
        <PieDePagina />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Encabezado />
      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="mb-8">
            <Button asChild variant="outline" size="sm">
                <Link href="/" className="flex items-center gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Volver a la lista
                </Link>
            </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-1">
                 <Card className="sticky top-8 shadow-lg">
                    <CardHeader className="items-center text-center">
                        {notary.avatarUrl && notary.avatarUrl.trim() !== "" ? (
                            <Image
                                src={notary.avatarUrl}
                                alt={`Avatar de ${notary.name}`}
                                width={120}
                                height={120}
                                className="rounded-full border-4 border-primary"
                            />
                        ) : (
                            <div className="flex items-center justify-center w-[120px] h-[120px] rounded-full border-4 border-primary bg-muted">
                                <User className="w-16 h-16 text-muted-foreground" />
                            </div>
                        )}
                        <CardTitle className="text-2xl pt-4 font-headline text-primary">{notary.name}</CardTitle>
                        <CalificacionEstrellas rating={averageRating} count={totalComments} />
                    </CardHeader>
                    <CardContent className="text-sm space-y-4">
                        <div className="flex items-start gap-3">
                            <MapPin className="h-5 w-5 text-primary mt-1 shrink-0" />
                            <p className="text-card-foreground">{notary.address}, {notary.district}</p>
                        </div>
                         <div className="flex items-center gap-3">
                            <Phone className="h-5 w-5 text-primary shrink-0" />
                            <a href={`tel:${notary.phone}`} className="hover:underline text-card-foreground">Cel: {notary.phone}</a>
                        </div>
                        {notary.landline && (
                            <div className="flex items-center gap-3">
                                <Phone className="h-5 w-5 text-primary shrink-0" />
                                <a href={`tel:${notary.landline}`} className="hover:underline text-card-foreground">Fijo: {notary.landline}</a>
                            </div>
                        )}
                         <div className="flex items-center gap-3">
                            <Mail className="h-5 w-5 text-primary shrink-0" />
                             <a href={`mailto:${notary.email}`} className="hover:underline text-card-foreground break-all">{notary.email}</a>
                        </div>
                        {notary.website && (
                          <div className="flex items-center gap-3">
                              <Globe className="h-5 w-5 text-primary shrink-0" />
                              <a href={notary.website} target="_blank" rel="noopener noreferrer" className="hover:underline text-card-foreground break-all">{notary.website}</a>
                          </div>
                        )}
                        {(notary.facebookUrl || notary.instagramUrl || notary.tiktokUrl || notary.linkedinUrl) && (
                            <>
                                <Separator />
                                <div className="flex items-center justify-center gap-4 pt-2">
                                    {notary.facebookUrl && (
                                        <a href={notary.facebookUrl} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                                            <Facebook className="h-6 w-6" />
                                        </a>
                                    )}
                                    {notary.instagramUrl && (
                                        <a href={notary.instagramUrl} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                                            <Instagram className="h-6 w-6" />
                                        </a>
                                    )}
                                    {notary.tiktokUrl && (
                                        <a href={notary.tiktokUrl} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                                            <TikTokIcon className="h-6 w-6" />
                                        </a>
                                    )}
                                    {notary.linkedinUrl && (
                                        <a href={notary.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                                            <Linkedin className="h-6 w-6" />
                                        </a>
                                    )}
                                </div>
                                <Separator />
                            </>
                        )}
                        <Badge variant={notary.available ? "default" : "secondary"} className={`w-full justify-center text-base py-2 ${notary.available ? "bg-green-500 hover:bg-green-600 text-white" : ""}`}>
                            {notary.available ? "Disponible Ahora" : "No Disponible"}
                        </Badge>
                        {notary.observations && (
                            <p className="pt-2 text-center text-xs text-muted-foreground italic">&ldquo;{notary.observations}&rdquo;</p>
                        )}
                    </CardContent>
                 </Card>
            </div>
            <div className="lg:col-span-2 space-y-12">
                <div>
                    <h2 className="text-3xl font-bold font-headline mb-6 text-foreground flex items-center gap-3">
                        <Briefcase className="h-8 w-8 text-primary" />
                        Servicios y Requisitos
                    </h2>

                    {notary.detailedServices && notary.detailedServices.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {notary.detailedServices.map((service) => (
                                   <Dialog key={service.slug}>
                                     <DialogTrigger asChild>
                                        <Card className="group relative overflow-hidden rounded-lg cursor-pointer transform transition-transform duration-300 hover:scale-105 hover:shadow-2xl">
                                            <CardContent className="p-0">
                                                <Image
                                                    src={(service.images && service.images[0]) || `https://picsum.photos/seed/${service.slug}/400/400`}
                                                    alt={`Imagen de ${service.name}`}
                                                    width={400}
                                                    height={400}
                                                    className="object-cover w-full h-48"
                                                    data-ai-hint="legal services"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                                                <h3 className="absolute bottom-4 left-4 text-lg font-bold text-white group-hover:text-primary transition-colors">
                                                    {service.name}
                                                </h3>
                                                {service.price && (
                                                    <div className="absolute bottom-4 right-4 bg-primary text-primary-foreground text-sm font-bold py-1 px-3 rounded-full">
                                                        S/ {service.price.toFixed(2)}
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                     </DialogTrigger>
                                     <DialogContent className="sm:max-w-[625px]">
                                         <DialogHeader>
                                            <DialogTitle className="text-2xl text-primary font-headline">{service.name}</DialogTitle>
                                            <DialogDescription>
                                                Detalles y requisitos para el trámite de {service.name}.
                                            </DialogDescription>
                                         </DialogHeader>
                                         <ScrollArea className="max-h-[60vh] pr-4">
                                            <div className="py-4 space-y-6">
                                                <div>
                                                    <h4 className="font-semibold mb-3">Lista de Requisitos:</h4>
                                                    <ul className="space-y-2">
                                                    {service.requisitos.map((req, reqIndex) => (
                                                        <li key={reqIndex} className="flex items-start gap-3 text-sm">
                                                            <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                                                            <span>{req}</span>
                                                        </li>
                                                    ))}
                                                    </ul>
                                                </div>
                                                {service.videoUrl && (
                                                <div className="space-y-3">
                                                    <h4 className="font-semibold flex items-center gap-2">
                                                        <Video className="h-5 w-5 text-primary" />
                                                        Guia de tu tramite
                                                    </h4>
                                                    <div
                                                        className="aspect-video w-full"
                                                        dangerouslySetInnerHTML={{ __html: service.videoUrl || "" }}
                                                    />
                                                </div>
                                                )}
                                            </div>
                                         </ScrollArea>
                                     </DialogContent>
                                   </Dialog>
                                )
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-16 bg-card rounded-lg shadow-sm">
                            <h3 className="text-xl font-semibold">No hay servicios detallados</h3>
                            <p className="text-muted-foreground mt-2">Esta notaría aún no ha publicado una lista detallada de sus servicios y requisitos.</p>
                        </div>
                    )}
                </div>

                <div>
                    <h2 className="text-3xl font-bold font-headline mb-6 text-foreground flex items-center gap-3">
                        <MessageSquare className="h-8 w-8 text-primary" />
                        Opiniones y Comentarios
                    </h2>
                     <Card>
                        <CardHeader>
                          <CardTitle>Deja tu opinión</CardTitle>
                        </CardHeader>
                        <CardContent>
                          {user ? (
                            <FormularioComentario notaryId={notaryId} />
                          ) : (
                            <div className="text-center text-muted-foreground p-8 border-dashed border-2 rounded-lg">
                              <UserCircle className="mx-auto h-12 w-12 text-muted-foreground/50" />
                              <p className="mt-4">
                                Necesitas <Button variant="link" className="p-0 h-auto">iniciar sesión</Button> para dejar un comentario.
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </Card>

                    <div className="mt-8">
                       <ListaComentarios comments={comments || []} loading={commentsLoading} />
                    </div>
                </div>
            </div>
        </div>

      </main>
      <PieDePagina />
    </div>
  );
}
