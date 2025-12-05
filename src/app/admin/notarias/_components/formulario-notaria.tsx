"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { DISTRITOS, TODOS_LOS_SERVICIOS } from "@/core/datos";
import type { Notaria, Usuario } from "@/core/tipos";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Upload,
  X,
  PlusCircle,
  Trash2,
  ImagePlus,
  Video,
  DollarSign,
  Facebook,
  Instagram,
  Linkedin,
  Loader2,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import api from "@/services/api";
import { useAuth } from "@/context/auth-provider";

// --------------------------------------
// Esquemas Zod
// --------------------------------------

const esquemaServicioDetallado = z.object({
  name: z.string().min(1, "El nombre del servicio no puede estar vacío."),
  slug: z.string(),
  price: z.preprocess(
    (val) => (val === "" || val === null ? undefined : val),
    z
      .number({
        invalid_type_error: "El precio debe ser un número.",
      })
      .optional()
  ),
  requisitos: z.array(z.string().min(1, "El requisito no puede estar vacío.")),
  images: z.array(z.string()).optional(),
  videoUrl: z.string().optional(),
});

const urlValidation = z
  .string()
  .url({ message: "Por favor ingresa una URL válida." })
  .optional()
  .or(z.literal(""));

const esquemaNotaria = z.object({
  name: z.string().min(3, { message: "El nombre debe tener al menos 3 caracteres." }),
  address: z.string().min(5, { message: "La dirección es obligatoria." }),
  district: z.string({ required_error: "Por favor selecciona un distrito." }),
  phone: z.string().min(9, { message: "El celular debe tener al menos 9 dígitos." }),
  landline: z.string().optional(),
  email: z.string().email({ message: "Por favor ingresa un correo válido." }),
  website: urlValidation,
  facebookUrl: urlValidation,
  instagramUrl: urlValidation,
  tiktokUrl: urlValidation,
  linkedinUrl: urlValidation,
  available: z.boolean().default(false),
  services: z
    .array(z.string())
    .refine((value) => value.some((item) => item), {
      message: "Tienes que seleccionar al menos un servicio.",
    }),
  avatarUrl: z
    .string()
    .url({ message: "Por favor selecciona una imagen de referencia." })
    .or(z.literal("")),
  rating: z.coerce.number().min(0).max(5).default(0),
  observations: z.string().optional(),
  detailedServices: z.array(esquemaServicioDetallado).optional(),
  commentSummary: z.string().optional(),
  ownerId: z.string().optional(),
});

type ValoresFormularioNotaria = z.infer<typeof esquemaNotaria>;

interface FormularioNotariaProps {
  isOpen: boolean;
  onClose: () => void;
  notaria: Notaria | null;
}

// --------------------------------------
// Utilidades
// --------------------------------------

const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "");

const uploadImage = async (file: File): Promise<string> => {
  if (file.size > 2 * 1024 * 1024) {
    throw new Error("Imagen demasiado grande (máx 2MB).");
  }
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post("/upload/", formData);
  return response.data.url;
};

const TikTokIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M16 4h4v4" />
    <path d="M12 20v-8.5a4.5 4.5 0 1 1 4.5 4.5H12" />
    <path d="M12 4v4" />
    <path d="M20 8.5a4.5 4.5 0 1 0-4.5 4.5H20" />
  </svg>
);

// --------------------------------------
// Componente principal
// --------------------------------------

export default function FormularioNotaria({ isOpen, onClose, notaria }: FormularioNotariaProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'superadmin' || user?.es_admin === true;

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [potentialOwners, setPotentialOwners] = useState<Usuario[]>([]);

  // serviceIndex -> imageIndex -> File
  const [detailedServiceFiles, setDetailedServiceFiles] = useState<Record<number, Record<number, File>>>({});

  const todosLosServicios = Object.values(TODOS_LOS_SERVICIOS);

  const form = useForm<ValoresFormularioNotaria>({
    resolver: zodResolver(esquemaNotaria),
    defaultValues: {
      name: "",
      address: "",
      email: "",
      phone: "",
      landline: "",
      website: "",
      facebookUrl: "",
      instagramUrl: "",
      tiktokUrl: "",
      linkedinUrl: "",
      district: "",
      available: false,
      services: [],
      rating: 0,
      avatarUrl: "",
      observations: "",
      detailedServices: [],
      commentSummary: "Aún no hay suficientes comentarios para un resumen.",
      ownerId: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "detailedServices",
  });

  useEffect(() => {
      // Fetch owners list if superadmin
      if (isSuperAdmin && isOpen) {
          api.get('/usuarios').then(res => {
              setPotentialOwners(res.data);
          }).catch(console.error);
      }
  }, [isSuperAdmin, isOpen]);

  // Reset cuando se abre el modal o cambia la notaria
  useEffect(() => {
    if (!isOpen) return;

    const defaultValues: Partial<ValoresFormularioNotaria> = notaria
      ? {
          ...notaria,
          name: notaria.name || "",
          address: notaria.address || "",
          district: notaria.district || "",
          phone: notaria.phone || "",
          email: notaria.email || "",
          available: notaria.available || false,
          services: notaria.services || [],
          avatarUrl: notaria.avatarUrl || "",
          observations: notaria.observations || "",
          website: notaria.website || "",
          facebookUrl: notaria.facebookUrl || "",
          instagramUrl: notaria.instagramUrl || "",
          tiktokUrl: notaria.tiktokUrl || "",
          linkedinUrl: notaria.linkedinUrl || "",
          landline: notaria.landline || "",
          rating: notaria.rating || 0,
          detailedServices: (notaria.detailedServices || []).map((s) => ({
            ...s,
            name: s.name || "",
            slug: s.slug || "",
            requisitos: s.requisitos || [],
            images: s.images || [],
            videoUrl: s.videoUrl || "",
            price: s.price === undefined ? "" : s.price,
          })) as any,
          commentSummary: notaria.commentSummary || "Aún no hay suficientes comentarios para un resumen.",
          ownerId: (notaria as any).userId || "",
        }
      : {
          name: "",
          address: "",
          district: "",
          phone: "",
          landline: "",
          email: "",
          website: "",
          facebookUrl: "",
          instagramUrl: "",
          tiktokUrl: "",
          linkedinUrl: "",
          available: false,
          services: [],
          rating: 0,
          avatarUrl: "",
          observations: "",
          detailedServices: [],
          commentSummary: "Aún no hay suficientes comentarios para un resumen.",
          ownerId: "",
        };

    form.reset(defaultValues as ValoresFormularioNotaria);
    setImagePreview(defaultValues.avatarUrl || null);
    setAvatarFile(null);
    setDetailedServiceFiles({});
  }, [isOpen, notaria, form]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast({
          variant: "destructive",
          title: "Imagen demasiado grande",
          description: "Por favor, sube una imagen de menos de 2MB.",
        });
        return;
      }
      setAvatarFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const removeImage = () => {
    if (imagePreview && imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(null);
    setAvatarFile(null);
    form.setValue(
      "avatarUrl",
      `https://picsum.photos/seed/${form.getValues("name") || "default"}/100/100`
    );
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const onSubmit = async (data: ValoresFormularioNotaria) => {
    form.clearErrors();
    setIsSubmitting(true);

    try {
      // Avatar
      let finalAvatarUrl = data.avatarUrl;
      if (avatarFile) {
        finalAvatarUrl = await uploadImage(avatarFile);
      } else if (!imagePreview) {
        finalAvatarUrl = `https://picsum.photos/seed/${data.name}/100/100`;
      }

      // Servicios detallados (subir imágenes)
      const processedDetailedServices = await Promise.all(
        (data.detailedServices || []).map(async (service, serviceIndex) => {
          const finalImages = await Promise.all(
            (service.images || []).map(async (image, imageIndex) => {
              const file = detailedServiceFiles[serviceIndex]?.[imageIndex];
              if (file) {
                return await uploadImage(file);
              }
              return image;
            })
          );

          const cleanedService: any = {
            ...service,
            images: finalImages,
          };

          if (
            cleanedService.price === undefined ||
            cleanedService.price === "" ||
            cleanedService.price === null
          ) {
            delete cleanedService.price;
          }

          return cleanedService;
        })
      );

      const payload = {
        ...data,
        avatarUrl: finalAvatarUrl,
        detailedServices: processedDetailedServices,
      };

      if (notaria && notaria.id) {
        await api.put(`/notarias/${notaria.id}`, payload);
        toast({
          title: "Notaría actualizada",
          description: `La notaría "${data.name}" ha sido actualizada exitosamente.`,
        });
      } else {
        await api.post("/notarias", payload);
        toast({
          title: "Notaría creada",
          description: `La notaría "${data.name}" ha sido creada exitosamente.`,
        });
      }

      onClose();
      // Si quieres, puedes quitar el reload y manejar estados en el padre
      window.location.reload();
    } catch (error: any) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error al Guardar",
        description:
          error?.message || (error.response?.data?.detail) || "No se pudo guardar la notaría.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>{notaria ? "Editar Notaría" : "Añadir Nueva Notaría"}</DialogTitle>
          <DialogDescription>
            {notaria
              ? "Modifica los detalles de la notaría."
              : "Completa el formulario para añadir una nueva notaría."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <ScrollArea className="h-[60vh] pr-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                {/* Columna izquierda */}
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre de la Notaría</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej. Notaría Pérez" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {isSuperAdmin && (
                      <FormField
                        control={form.control}
                        name="ownerId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Propietario (Usuario Cliente)</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Asignar propietario" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="">-- Sin asignar (Admin) --</SelectItem>
                                {potentialOwners.map(u => (
                                    <SelectItem key={u.id} value={u.id}>
                                        {u.displayName || u.email} ({u.role || 'public'})
                                    </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormDescription>Solo visible para Superadmin</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                  )}

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dirección</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej. Av. Principal 123" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="district"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Distrito</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona un distrito" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {DISTRITOS.map((d) => (
                              <SelectItem key={d} value={d}>
                                {d}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Celular</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej. 987654321" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="landline"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Teléfono Fijo (Opcional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej. 043-421234" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Correo Electrónico</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej. contacto@notaria.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="website"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Página Web (opcional)</FormLabel>
                        <FormControl>
                          <Input placeholder="https://www.notariaperez.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="facebookUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Facebook className="h-4 w-4" /> Facebook (Opcional)
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="https://facebook.com/notaria..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="instagramUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Instagram className="h-4 w-4" /> Instagram (Opcional)
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="https://instagram.com/notaria..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="tiktokUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <TikTokIcon className="h-4 w-4" /> TikTok (Opcional)
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="https://tiktok.com/@notaria..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="linkedinUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Linkedin className="h-4 w-4" /> LinkedIn (Opcional)
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="https://linkedin.com/company/notaria..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Avatar / Imagen */}
                  <FormField
                    control={form.control}
                    name="avatarUrl"
                    render={() => (
                      <FormItem>
                        <FormLabel>Imagen de Perfil</FormLabel>
                        <FormControl>
                          <div className="flex items-center gap-6">
                            <div className="relative">
                              <Image
                                src={
                                  imagePreview ||
                                  `https://picsum.photos/seed/${
                                    form.getValues("name") || "default"
                                  }/120/120`
                                }
                                alt="Vista previa del avatar"
                                width={120}
                                height={120}
                                className="rounded-full border-4 border-primary/20 object-cover"
                              />
                              {imagePreview && (
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="icon"
                                  className="absolute -top-1 -right-1 h-7 w-7 rounded-full"
                                  onClick={removeImage}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => fileInputRef.current?.click()}
                            >
                              <Upload className="mr-2 h-4 w-4" />
                              Subir Imagen
                            </Button>
                            <Input
                              type="file"
                              ref={fileInputRef}
                              className="hidden"
                              accept="image/png, image/jpeg, image/webp"
                              onChange={handleImageChange}
                            />
                          </div>
                        </FormControl>
                        <FormDescription>
                          Sube una imagen para el perfil de la notaría (máx 2MB).
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="observations"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Observaciones</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Añade observaciones o notas importantes..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="available"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>Disponible Ahora</FormLabel>
                          <FormDescription>
                            Indica si la notaría está atendiendo actualmente.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {/* Servicios generales */}
                  <FormField
                    control={form.control}
                    name="services"
                    render={() => (
                      <FormItem>
                        <div className="mb-4">
                          <FormLabel className="text-base">Servicios (Generales)</FormLabel>
                          <FormDescription>
                            Selecciona los servicios generales para el filtrado rápido en la
                            página principal.
                          </FormDescription>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          {todosLosServicios?.map((service) => (
                            <FormField
                              key={service.name}
                              control={form.control}
                              name="services"
                              render={({ field }) => {
                                return (
                                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(service.name)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([
                                                ...(field.value || []),
                                                service.name,
                                              ])
                                            : field.onChange(
                                                (field.value || [])?.filter(
                                                  (value: string) => value !== service.name
                                                )
                                              );
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="font-normal flex items-center gap-2">
                                      {service.name}
                                    </FormLabel>
                                  </FormItem>
                                );
                              }}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Columna derecha - Servicios detallados */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium">Servicios Detallados y Requisitos</h3>
                    <p className="text-sm text-muted-foreground">
                      Añade los servicios específicos con sus requisitos para la página de
                      detalle.
                    </p>
                  </div>
                  {fields.map((field, serviceIndex) => (
                    <ItemServicioDetallado
                      key={field.id}
                      form={form}
                      serviceIndex={serviceIndex}
                      removeService={remove}
                      updateServiceImageFile={(imageIndex: number, file: File | null) => {
                        setDetailedServiceFiles((prev) => {
                          const newFiles = { ...prev };
                          if (!newFiles[serviceIndex]) newFiles[serviceIndex] = {};
                          if (file) {
                            newFiles[serviceIndex][imageIndex] = file;
                          } else {
                            delete newFiles[serviceIndex][imageIndex];
                          }
                          return newFiles;
                        });
                      }}
                    />
                  ))}
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() =>
                      append({
                        name: "",
                        slug: "",
                        requisitos: [""],
                        images: [],
                        videoUrl: "",
                        price: "" as any,
                      })
                    }
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Añadir Servicio Detallado
                  </Button>
                </div>
              </div>
            </ScrollArea>
            <DialogFooter className="pt-6">
              <Button type="button" variant="ghost" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting || form.formState.isSubmitting}>
                {(isSubmitting || form.formState.isSubmitting) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isSubmitting || form.formState.isSubmitting
                  ? "Guardando..."
                  : "Guardar Notaría"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// --------------------------------------
// ItemServicioDetallado
// --------------------------------------

interface ItemServicioDetalladoProps {
  form: any;
  serviceIndex: number;
  removeService: (index: number) => void;
  updateServiceImageFile: (imageIndex: number, file: File | null) => void;
}

function ItemServicioDetallado({
  form,
  serviceIndex,
  removeService,
  updateServiceImageFile,
}: ItemServicioDetalladoProps) {
  const { fields: reqFields, append: appendReq, remove: removeReq } = useFieldArray({
    control: form.control,
    name: `detailedServices.${serviceIndex}.requisitos`,
  });

  const { fields: imgFields, append: appendImg, remove: removeImg, update: updateImg } =
    useFieldArray({
      control: form.control,
      name: `detailedServices.${serviceIndex}.images`,
    });

  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { toast } = useToast();
  const [previews, setPreviews] = useState<Record<number, string>>({});

  useEffect(() => {
    return () => {
      Object.values(previews).forEach(URL.revokeObjectURL);
    };
  }, [previews]);

  const handleServiceImageUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
    imageIndex: number
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast({
          variant: "destructive",
          title: "Imagen demasiado grande",
          description: "Por favor, sube una imagen de menos de 2MB.",
        });
        return;
      }
      updateServiceImageFile(imageIndex, file);

      const previewUrl = URL.createObjectURL(file);
      setPreviews((p) => ({ ...p, [imageIndex]: previewUrl }));
      updateImg(imageIndex, `placeholder-for-file-${file.name}`);
    }
  };

  const removeServiceImage = (imageIndex: number) => {
    removeImg(imageIndex);
    updateServiceImageFile(imageIndex, null);
    if (previews[imageIndex]) {
      URL.revokeObjectURL(previews[imageIndex]);
      setPreviews((p) => {
        const newPreviews = { ...p };
        delete newPreviews[imageIndex];
        return newPreviews;
      });
    }
  };

  return (
    <div className="p-4 border rounded-lg space-y-4 relative bg-muted/20">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 h-7 w-7 text-destructive"
        onClick={() => removeService(serviceIndex)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>

      <FormField
        control={form.control}
        name={`detailedServices.${serviceIndex}.name`}
        render={({ field: nameField }) => (
          <FormItem>
            <FormLabel>Nombre del Servicio</FormLabel>
            <FormControl>
              <Input
                {...nameField}
                placeholder="Ej. Constitución de Empresas"
                onChange={(e) => {
                  nameField.onChange(e);
                  form.setValue(
                    `detailedServices.${serviceIndex}.slug`,
                    slugify(e.target.value)
                  );
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name={`detailedServices.${serviceIndex}.price`}
        render={({ field }) => {
          const fieldValue = field.value ?? "";
          return (
            <FormItem>
              <FormLabel>Precio Referencial (S/)</FormLabel>
              <FormControl>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="number"
                    placeholder="Ej. 150.00"
                    className="pl-8"
                    {...field}
                    value={fieldValue}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === "" ? undefined : Number(e.target.value)
                      )
                    }
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          );
        }}
      />

      {/* Requisitos */}
      <div>
        <FormLabel>Requisitos</FormLabel>
        <div className="space-y-2 mt-2">
          {reqFields.map((field, reqIndex) => (
            <div key={field.id} className="flex items-center gap-2">
              <FormField
                control={form.control}
                name={`detailedServices.${serviceIndex}.requisitos.${reqIndex}`}
                render={({ field: reqField }) => (
                  <FormItem className="flex-grow">
                    <FormControl>
                      <Input {...reqField} placeholder={`Requisito ${reqIndex + 1}`} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-9 w-9 shrink-0"
                onClick={() => removeReq(reqIndex)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => appendReq("")}
          >
            <PlusCircle className="mr-2 h-4 w-4" /> Añadir Requisito
          </Button>
        </div>
      </div>

      {/* Imágenes del servicio */}
      <div>
        <FormLabel>Imágenes del Servicio</FormLabel>
        <FormDescription>Añade imágenes para el carrusel.</FormDescription>
        <div className="space-y-3 mt-2">
          {imgFields.map((field, imgIndex) => {
            const imagesArray =
              form.watch(`detailedServices.${serviceIndex}.images`) || [];
            const imageValue = imagesArray[imgIndex];
            const previewSrc =
              previews[imgIndex] ||
              (imageValue?.startsWith("http") || imageValue?.startsWith("data:")
                ? imageValue
                : null);

            return (
              <div key={field.id} className="flex items-center gap-2">
                {previewSrc && (
                  <Image
                    src={previewSrc}
                    alt="Preview"
                    width={40}
                    height={40}
                    className="rounded-md object-cover"
                  />
                )}
                <div className="flex-grow text-sm text-muted-foreground truncate">
                  {imageValue?.startsWith("placeholder")
                    ? imageValue.replace("placeholder-for-file-", "")
                    : imageValue?.startsWith("http") || imageValue?.startsWith("data:")
                    ? "Imagen guardada"
                    : "Selecciona una imagen"}
                </div>

                <Input
                  type="file"
                  ref={(el) => { fileInputRefs.current[imgIndex] = el; }}
                  className="hidden"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={(e) => handleServiceImageUpload(e, imgIndex)}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 shrink-0"
                  onClick={() => fileInputRefs.current[imgIndex]?.click()}
                >
                  <Upload className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="h-9 w-9 shrink-0"
                  onClick={() => removeServiceImage(imgIndex)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            );
          })}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => appendImg("")}
          >
            <ImagePlus className="mr-2 h-4 w-4" /> Añadir Imagen
          </Button>
        </div>
      </div>

      {/* Video */}
      <FormField
        control={form.control}
        name={`detailedServices.${serviceIndex}.videoUrl`}
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              <Video className="h-4 w-4" /> Código de Inserción del Video (HTML)
            </FormLabel>
            <FormDescription>
              Para YouTube, ve a Compartir &gt; Incorporar. Para Canva, ve a Compartir &gt; Más
              &gt; Insertar. Copia y pega el código HTML aquí.
            </FormDescription>
            <FormControl>
              <Textarea placeholder='<iframe src="..." ...></iframe>' {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
