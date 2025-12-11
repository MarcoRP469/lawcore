import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Ad } from "@/types/ad";
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { MapPin, Tag, User } from 'lucide-react';

interface AdCardProps {
    ad: Ad;
}

export function AdCard({ ad }: AdCardProps) {
    const typeColors = {
        oferta: "bg-green-500 hover:bg-green-600",
        demanda: "bg-blue-500 hover:bg-blue-600",
        promocion: "bg-purple-500 hover:bg-purple-600",
    };

    const typeLabels = {
        oferta: "Oferta",
        demanda: "Demanda",
        promocion: "Promoción",
    };

    return (
        <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col h-full">
            <div className="relative h-48 w-full bg-gray-100">
                {ad.imagen_url ? (
                    <Image
                        src={ad.imagen_url}
                        alt={ad.titulo}
                        fill
                        className="object-cover"
                    />
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                        <span className="text-4xl font-bold opacity-20">LawCore</span>
                    </div>
                )}
                <Badge
                    className={`absolute top-2 right-2 ${typeColors[ad.tipo]} text-white border-0`}
                >
                    {typeLabels[ad.tipo]}
                </Badge>
            </div>

            <CardHeader className="p-4 pb-0">
                <div className="flex justify-between items-start">
                    <h3 className="text-xl font-bold line-clamp-1">{ad.titulo}</h3>
                    {ad.precio && (
                        <span className="font-bold text-lg text-primary">
                            S/ {ad.precio.toFixed(2)}
                        </span>
                    )}
                </div>
            </CardHeader>

            <CardContent className="p-4 flex-grow">
                <p className="text-muted-foreground line-clamp-3 text-sm mb-4">
                    {ad.descripcion}
                </p>

                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-auto">
                    <User className="w-4 h-4" />
                    <span className="truncate">{ad.userDisplayName || 'Usuario LawCore'}</span>
                </div>
            </CardContent>

            <CardFooter className="p-4 bg-muted/30 border-t flex justify-between items-center text-xs text-muted-foreground">
                <span>
                    {formatDistanceToNow(new Date(ad.creado_en), { addSuffix: true, locale: es })}
                </span>
                <Button variant="outline" size="sm" asChild>
                    <Link href={`/anuncios/${ad.id}`}>Ver Detalle</Link>
                </Button>
            </CardFooter>
        </Card>
    );
}
