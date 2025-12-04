
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, MapPin } from "lucide-react";
import type { Metadata } from 'next';

const esquemaFormularioContacto = z.object({
  name: z.string().min(2, "El nombre es requerido."),
  email: z.string().email("Por favor ingresa un correo válido."),
  phone: z.string().optional(),
  subject: z.string({ required_error: "Debes seleccionar un asunto." }),
  notary: z.string().optional(),
  message: z.string().min(10, "El mensaje debe tener al menos 10 caracteres."),
  privacyPolicy: z.boolean().refine(val => val === true, {
    message: "Debes aceptar la Política de Privacidad para continuar.",
  }),
});

type ValoresFormularioContacto = z.infer<typeof esquemaFormularioContacto>;

export default function PaginaContacto() {
  const { toast } = useToast();

  const form = useForm<ValoresFormularioContacto>({
    resolver: zodResolver(esquemaFormularioContacto),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      subject: undefined,
      notary: "",
      message: "",
      privacyPolicy: false,
    },
  });

  function onSubmit(data: ValoresFormularioContacto) {
    console.log(data);
    toast({
      title: "Hemos recibido tu mensaje",
      description: `Hola ${data.name}, tu solicitud sobre "${data.subject}" ha sido registrada. Te responderemos en 24-48h hábiles.`,
    });
    form.reset();
  }

  return (
    <div className="bg-background text-foreground">
      <div className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-5xl">
          <header className="text-center mb-16">
            <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl font-headline text-primary">
              Contacto
            </h1>
            <p className="mt-4 text-xl text-muted-foreground">
              ¿Necesitas ayuda o quieres actualizar datos? Estamos aquí para escucharte.
            </p>
          </header>

          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Canales de Atención</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Mail className="h-6 w-6 text-primary" />
                    <a href="mailto:mr9708407@gmail.com" className="hover:underline">mr9708407@gmail.com</a>
                  </div>
                  <div className="flex items-center gap-4">
                    <Phone className="h-6 w-6 text-primary" />
                    <a href="https://wa.me/51929970536" target="_blank" rel="noopener noreferrer" className="hover:underline">+51 929970536</a>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Tiempo de Respuesta</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Respondemos a todas las consultas en un plazo de <strong>24 a 48 horas hábiles</strong>. ¡Gracias por tu paciencia!</p>
                </CardContent>
              </Card>
            </div>

            <Card className="p-6 md:p-8">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre y Apellido</FormLabel>
                        <FormControl><Input placeholder="Juan Pérez" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl><Input placeholder="tu@correo.com" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Asunto</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger><SelectValue placeholder="Selecciona un motivo" /></SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Consulta general">Consulta general</SelectItem>
                            <SelectItem value="Corrección de datos">Corrección de datos</SelectItem>
                            <SelectItem value="Alianza comercial">Alianza comercial</SelectItem>
                            <SelectItem value="Otro">Otro</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mensaje</FormLabel>
                        <FormControl><Textarea placeholder="Escribe tu mensaje aquí..." rows={5} {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="privacyPolicy"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Acepto la Política de Privacidad</FormLabel>
                          <FormDescription>
                            Entiendo cómo se usarán mis datos.
                          </FormDescription>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? "Enviando..." : "Enviar Mensaje"}
                  </Button>
                </form>
              </Form>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
