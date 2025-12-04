"use client";

import * as React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth-provider";

const esquemaLogin = z.object({
  email: z.string().email({ message: "Por favor ingresa un correo válido." }),
  password: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres." }),
});

const esquemaRegistro = z.object({
  displayName: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres." }),
  email: z.string().email({ message: "Por favor ingresa un correo válido." }),
  password: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres." }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden.",
  path: ["confirmPassword"],
});

type DialogoAutenticacionProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function DialogoAutenticacion({ open, onOpenChange }: DialogoAutenticacionProps) {
  const { login, register } = useAuth();
  const { toast } = useToast();
  
  const formularioLogin = useForm<z.infer<typeof esquemaLogin>>({
    resolver: zodResolver(esquemaLogin),
    defaultValues: { email: "", password: "" },
  });

  const formularioRegistro = useForm<z.infer<typeof esquemaRegistro>>({
    resolver: zodResolver(esquemaRegistro),
    defaultValues: { displayName: "", email: "", password: "", confirmPassword: "" },
  });

  const handleSuccess = (title: string, description: string) => {
    toast({ title, description });
    onOpenChange(false);
  };
  
  const handleError = (error: any) => {
      // Intentar extraer el mensaje de error de la API
      let errorMessage = "Ha ocurrido un error. Por favor, inténtalo de nuevo.";
      if (error?.response?.data?.detail) {
          errorMessage = error.response.data.detail;
      }

      toast({
        variant: "destructive",
        title: "Error de autenticación",
        description: errorMessage,
      });
  };

  const handleLogin = async (values: z.infer<typeof esquemaLogin>) => {
    try {
      await login(values.email, values.password);
      handleSuccess("¡Bienvenido de vuelta!", "Has iniciado sesión correctamente.");
    } catch (error) {
      handleError(error);
    }
  };

  const handleRegister = async (values: z.infer<typeof esquemaRegistro>) => {
    try {
      await register(values.email, values.password, values.displayName);
      handleSuccess("¡Registro exitoso!", "Tu cuenta ha sido creada. ¡Bienvenido!");
    } catch (error) {
      handleError(error);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Acceso de Usuario</DialogTitle>
          <DialogDescription>
            Inicia sesión o crea una cuenta para continuar.
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
            <TabsTrigger value="register">Registrarse</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <Form {...formularioLogin}>
              <form onSubmit={formularioLogin.handleSubmit(handleLogin)} className="space-y-4 py-4">
                <FormField
                  control={formularioLogin.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Correo electrónico</FormLabel>
                      <FormControl>
                        <Input placeholder="tu@correo.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={formularioLogin.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contraseña</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                       <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={formularioLogin.formState.isSubmitting}>
                  {formularioLogin.formState.isSubmitting ? "Iniciando sesión..." : "Iniciar Sesión"}
                </Button>
              </form>
            </Form>
          </TabsContent>
          <TabsContent value="register">
            <Form {...formularioRegistro}>
              <form onSubmit={formularioRegistro.handleSubmit(handleRegister)} className="space-y-4 py-4">
                <FormField
                  control={formularioRegistro.control}
                  name="displayName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre completo</FormLabel>
                      <FormControl>
                        <Input placeholder="Tu nombre" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={formularioRegistro.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Correo electrónico</FormLabel>
                      <FormControl>
                        <Input placeholder="tu@correo.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={formularioRegistro.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contraseña</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={formularioRegistro.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirmar Contraseña</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={formularioRegistro.formState.isSubmitting}>
                  {formularioRegistro.formState.isSubmitting ? "Creando cuenta..." : "Crear Cuenta"}
                  </Button>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
