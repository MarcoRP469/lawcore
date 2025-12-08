"use client";

import Image from "next/image";
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Phone, Mail, MapPin, Star, Info, Globe, MessageSquareQuote, Facebook, Instagram, Linkedin, User } from "lucide-react";
import type { Notaria } from "@/core/types";
import { TODOS_LOS_SERVICIOS } from "@/core/constants/servicios";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import type { LucideIcon } from "lucide-react";

interface TarjetaNotariaProps {
  notary: Notaria;
  onCompareToggle: (id: number) => void;
  isComparing: boolean;
}

const CalificacionEstrellas = ({ rating }: { rating: number }) => {
  const safeRating = rating || 0;
  const totalStars = 5;
  const fullStars = Math.floor(safeRating);
  const partialStarPercentage = Math.round((safeRating - fullStars) * 100);

  return (
    <div className="flex items-center">
      {[...Array(totalStars)].map((_, i) => {
        const starIndex = i + 1;
        if (starIndex <= fullStars) {
          return <Star key={i} className="h-4 w-4 fill-primary text-primary" />;
        }
        if (starIndex === fullStars + 1 && partialStarPercentage > 0) {
          return (
            <div key={i} className="relative h-4 w-4">
              <Star className="absolute h-4 w-4 fill-muted text-border" />
              <div
                className="absolute h-4 w-4 overflow-hidden"
                style={{ width: `${partialStarPercentage}%` }}
              >
                <Star className="h-4 w-4 fill-primary text-primary" />
              </div>
            </div>
          );
        }
        return <Star key={i} className="h-4 w-4 fill-muted text-border" />;
      })}
       <span className="ml-2 text-sm font-semibold text-card-foreground">{safeRating.toFixed(1)}</span>
    </div>
  );
};

const TikTokIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M16 4h4v4" />
        <path d="M12 20v-8.5a4.5 4.5 0 1 1 4.5 4.5H12" />
        <path d="M12 4v4" />
        <path d="M20 8.5a4.5 4.5 0 1 0-4.5 4.5H20" />
    </svg>
);


export default function TarjetaNotaria({ notary, onCompareToggle, isComparing }: TarjetaNotariaProps) {
  
  const getIconForService = (serviceName: string): LucideIcon => {
    const service = Object.values(TODOS_LOS_SERVICIOS).find(s => s.name === serviceName);
    return service ? service.icon as LucideIcon : Info;
  };

  const handleInteractiveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };
  
  const handleCallClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.location.href = `tel:${notary.phone}`;
  };

  const handleEmailClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.location.href = `mailto:${notary.email}`;
  };

  const handleWebsiteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if(notary.website) {
        window.open(notary.website, '_blank', 'noopener,noreferrer');
    }
  };

  const hasSocialMedia = notary.facebookUrl || notary.instagramUrl || notary.tiktokUrl || notary.linkedinUrl;

  return (
    <Card
        className="flex flex-col h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-card text-card-foreground relative group"
    >
    <CardHeader className="flex-row gap-4 items-start relative z-10">
      {notary.avatarUrl && notary.avatarUrl.trim() !== "" ? (
        <Image
          src={notary.avatarUrl}
          alt={`Avatar de ${notary.name}`}
          width={80}
          height={80}
          className="rounded-full border-2 border-primary/20 object-cover"
          data-ai-hint="professional portrait"
        />
      ) : (
         <div className="flex items-center justify-center min-w-[80px] min-h-[80px] rounded-full border-2 border-primary/20 bg-muted">
           <User className="w-10 h-10 text-muted-foreground" />
         </div>
      )}
      <div className="flex-1">
        <CardTitle className="text-xl font-headline text-primary">
          <Link href={`/notaria/${notary.id}`} className="after:absolute after:inset-0 focus:outline-none">
            {notary.name}
          </Link>
        </CardTitle>
        <CardDescription className="flex items-center gap-2 mt-1 text-card-foreground/90">
          <MapPin className="h-4 w-4 text-primary" /> {notary.address}, {notary.district}
        </CardDescription>
        <div className="flex items-center gap-4 mt-2">
            <Badge variant={notary.available ? "default" : "secondary"} className={notary.available ? "bg-green-500 hover:bg-green-600 text-white" : ""}>
              {notary.available ? "Disponible" : "No disponible"}
            </Badge>
            <CalificacionEstrellas rating={notary.rating || 0} />
          </div>
      </div>
    </CardHeader>
    <CardContent className="flex-grow space-y-4">
       {notary.observations && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="mb-4 flex items-start gap-2 text-sm p-3 bg-accent/20 rounded-lg relative z-10">
                <Info className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                <p className="flex-1 text-primary">{notary.observations}</p>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Observaciones</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      <div>
        <h4 className="font-semibold mb-3 text-sm text-primary">Servicios Ofrecidos:</h4>
        <div className="flex flex-wrap gap-2">
          {notary.services && notary.services.slice(0, 3).map((serviceName) => {
            const Icon = getIconForService(serviceName);
            return Icon ? (
              <Badge key={serviceName} variant="outline" className="flex items-center gap-2 py-1 px-2 border-primary/50 text-primary-foreground">
                <Icon className="h-3 w-3 text-primary" />
                <span className="text-xs text-primary-foreground">{serviceName}</span>
              </Badge>
            ) : null;
          })}
          {notary.services && notary.services.length > 3 && (
            <Badge variant="outline" className="py-1 px-2 text-xs border-primary/50 text-primary-foreground">+{notary.services.length - 3} más</Badge>
          )}
        </div>
      </div>

      {notary.commentSummary && (
        <div className="w-full pt-4">
          <h4 className="font-semibold mb-2 text-sm flex items-center gap-2 text-primary">
            <MessageSquareQuote className="h-4 w-4" />
            Resumen de Opiniones
          </h4>
          <p className="text-xs text-muted-foreground italic">&ldquo;{notary.commentSummary}&rdquo;</p>
        </div>
      )}
    </CardContent>
    <Separator className="my-4" />
    <CardFooter className="flex-col items-start gap-4">
      <div className="flex justify-between w-full items-center">
          <div className="flex items-center gap-2 relative z-10">
            <Button variant="outline" size="sm" onClick={handleCallClick}>
                <Phone className="mr-2 h-4 w-4" /> Llamar
            </Button>
            <Button size="sm" onClick={handleEmailClick}>
                <Mail className="mr-2 h-4 w-4" /> Correo
            </Button>
             {notary.website && (
                <Button variant="outline" size="icon" onClick={handleWebsiteClick}>
                    <Globe className="h-4 w-4" />
                </Button>
             )}
          </div>
          {hasSocialMedia && (
            <div className="flex items-center gap-3 text-muted-foreground relative z-10">
                {notary.facebookUrl && <a href={notary.facebookUrl} target="_blank" rel="noopener noreferrer" className="hover:text-primary" onClick={handleInteractiveClick}><Facebook className="h-5 w-5"/></a>}
                {notary.instagramUrl && <a href={notary.instagramUrl} target="_blank" rel="noopener noreferrer" className="hover:text-primary" onClick={handleInteractiveClick}><Instagram className="h-5 w-5"/></a>}
                {notary.tiktokUrl && <a href={notary.tiktokUrl} target="_blank" rel="noopener noreferrer" className="hover:text-primary" onClick={handleInteractiveClick}><TikTokIcon className="h-5 w-5"/></a>}
                {notary.linkedinUrl && <a href={notary.linkedinUrl} target="_blank" rel="noopener noreferrer" className="hover:text-primary" onClick={handleInteractiveClick}><Linkedin className="h-5 w-5"/></a>}
            </div>
          )}
      </div>
      <div className="flex items-center space-x-2 pt-4 border-t w-full relative z-10" onClick={handleInteractiveClick}>
        <Checkbox id={`compare-${notary.id}`} onCheckedChange={() => onCompareToggle(notary.id)} checked={isComparing} />
        <Label htmlFor={`compare-${notary.id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Comparar
        </Label>
      </div>
    </CardFooter>
  </Card>
  );
}
