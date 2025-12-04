
"use client";

import type { Comentario } from "@/core/tipos";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";
import { Skeleton } from "./ui/skeleton";
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface ListaComentariosProps {
  comments: Comentario[] | null;
  loading: boolean;
}

const CalificacionEstrellas = ({ rating }: { rating: number }) => (
  <div className="flex items-center">
    {[...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? "fill-primary text-primary" : "fill-muted text-border"
        }`}
      />
    ))}
  </div>
);

const getInitials = (name?: string | null) => {
    if (!name) return "A";
    const names = name.split(' ');
    return names.map(n => n[0]).join('').toUpperCase();
}


export default function ListaComentarios({ comments, loading }: ListaComentariosProps) {

  if (loading) {
    return (
        <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
                 <div key={i} className="flex items-start gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-4/5" />
                    </div>
                </div>
            ))}
        </div>
    )
  }

  if (!comments || comments.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-10">
        <p>Aún no hay comentarios para esta notaría.</p>
        <p>¡Sé el primero en dejar una opinión!</p>
      </div>
    );
  }
  
  const sortedComments = comments.slice().sort((a, b) => {
    const dateA = new Date(a.createdAt || 0);
    const dateB = new Date(b.createdAt || 0);
    return dateB.getTime() - dateA.getTime();
  });


  return (
    <>
      <div className="space-y-6">
        {sortedComments.map((comment) => (
          <div key={comment.id} className="flex items-start gap-4">
            <Avatar>
              <AvatarImage src={comment.userPhotoURL || ""} alt={comment.userDisplayName} />
              <AvatarFallback>{getInitials(comment.userDisplayName)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <p className="font-semibold">{comment.userDisplayName}</p>
                  <CalificacionEstrellas rating={comment.rating} />
                </div>
                <div className="flex items-center gap-2">
                    <p className="text-xs text-muted-foreground">
                        {comment.createdAt ? `hace ${formatDistanceToNow(new Date(comment.createdAt), { locale: es })}` : ''}
                    </p>
                </div>
              </div>
              <p className="mt-1 text-sm text-foreground/90">{comment.text}</p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
