"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/context/auth-provider";
import api from "@/services/api";

const esquemaComentario = z.object({
  text: z.string().min(10, "El comentario debe tener al menos 10 caracteres.").max(500, "El comentario no puede exceder los 500 caracteres."),
  rating: z.number().min(1, "Debes seleccionar una calificación.").max(5),
});

interface FormularioComentarioProps {
  notaryId: string;
}

export default function FormularioComentario({ notaryId }: FormularioComentarioProps) {
  const user = useUser();
  const { toast } = useToast();
  const [hoverRating, setHoverRating] = useState(0);

  const form = useForm<z.infer<typeof esquemaComentario>>({
    resolver: zodResolver(esquemaComentario),
    defaultValues: {
      text: "",
      rating: 0,
    },
  });

  async function onSubmit(values: z.infer<typeof esquemaComentario>) {
    if (!user) return;
    
    try {
        await api.post("/comentarios", {
            notary_id: parseInt(notaryId),
            rating: values.rating,
            texto: values.text // Backend espera 'texto' (si usamos Pydantic alias) o mapear en frontend
            // Revisando schemas.py: ComentarioBase tiene text: str = Field(alias="texto")
            // Si enviamos JSON, FastAPI/Pydantic busca por nombre de campo 'text' o por alias 'texto' si populate_by_name=True.
            // Enviemos 'text' para estar seguros o probamos. En schemas.py use populate_by_name=True asi que ambos funcionan.
            // Pero esperate, en routers/comentarios.py:
            // puntaje=comentario.rating, texto=comentario.text
            // Asi que enviamos 'text' y 'rating' y 'notaryId' como definimos en el schema ComentarioCreate.
        });

        toast({
          title: "¡Gracias por tu opinión!",
          description: "Tu comentario ha sido publicado.",
        });
        form.reset();
        window.location.reload(); // Recargar para ver el comentario nuevo
    } catch (error) {
        console.error(error);
        toast({
            variant: "destructive",
            title: "Error al publicar",
            description: "No se pudo guardar tu comentario. Inténtalo de nuevo.",
        });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="rating"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tu calificación</FormLabel>
              <FormControl>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-8 w-8 cursor-pointer transition-colors ${
                        (hoverRating || (field.value || 0)) >= star
                          ? "text-primary fill-primary"
                          : "text-muted-foreground/50"
                      }`}
                      onClick={() => field.onChange(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                    />
                  ))}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="text"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tu comentario</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Escribe aquí tu experiencia con la notaría..."
                  rows={4}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Publicando..." : "Publicar Comentario"}
        </Button>
      </form>
    </Form>
  );
}
