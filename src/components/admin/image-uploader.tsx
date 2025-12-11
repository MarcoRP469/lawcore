"use client";

import { useState } from "react";
import Image from "next/image";
import { Upload, X, Loader2, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import api from "@/services/api";

interface ImageUploaderProps {
    images: string[];
    onImagesChange: (images: string[]) => void;
    maxImages?: number;
    maxSizeMB?: number;
}

export function ImageUploader({
    images,
    onImagesChange,
    maxImages = 5,
    maxSizeMB = 2
}: ImageUploaderProps) {
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const { toast } = useToast();

    const handleFileChange = async (files: FileList | null) => {
        if (!files || files.length === 0) return;

        // Verificar límite de imágenes
        if (images.length + files.length > maxImages) {
            toast({
                variant: "destructive",
                title: "Límite excedido",
                description: `Solo puedes subir hasta ${maxImages} imágenes por servicio.`
            });
            return;
        }

        const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
        const maxSizeBytes = maxSizeMB * 1024 * 1024;

        // Validar cada archivo
        for (let i = 0; i < files.length; i++) {
            const file = files[i];

            if (!validTypes.includes(file.type)) {
                toast({
                    variant: "destructive",
                    title: "Formato no válido",
                    description: `${file.name}: Solo se permiten JPG, PNG o WEBP.`
                });
                return;
            }

            if (file.size > maxSizeBytes) {
                toast({
                    variant: "destructive",
                    title: "Archivo muy grande",
                    description: `${file.name}: La imagen no debe superar ${maxSizeMB}MB.`
                });
                return;
            }
        }

        // Subir archivos
        setUploading(true);
        const uploadedUrls: string[] = [];

        try {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const formData = new FormData();
                formData.append("file", file);

                const response = await api.post("/upload/", formData, {
                    headers: {}
                });

                uploadedUrls.push(response.data.url);
            }

            // Agregar las nuevas URLs al array existente
            onImagesChange([...images, ...uploadedUrls]);

            toast({
                title: "Éxito",
                description: `${uploadedUrls.length} imagen(es) subida(s) correctamente.`
            });
        } catch (error) {
            console.error(error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Error al subir las imágenes. Intenta nuevamente."
            });
        } finally {
            setUploading(false);
        }
    };

    const handleRemoveImage = (index: number) => {
        const newImages = images.filter((_, i) => i !== index);
        onImagesChange(newImages);
        toast({
            title: "Imagen eliminada",
            description: "La imagen ha sido removida correctamente."
        });
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFileChange(e.dataTransfer.files);
        }
    };

    return (
        <div className="space-y-4">
            {/* Zona de drop */}
            <div
                className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragActive
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    } ${uploading ? "opacity-50 pointer-events-none" : ""}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <input
                    type="file"
                    id="image-upload"
                    className="hidden"
                    accept="image/jpeg,image/png,image/webp,image/jpg"
                    multiple
                    onChange={(e) => handleFileChange(e.target.files)}
                    disabled={uploading || images.length >= maxImages}
                />

                <div className="flex flex-col items-center gap-3">
                    {uploading ? (
                        <>
                            <Loader2 className="h-12 w-12 text-primary animate-spin" />
                            <p className="text-sm text-muted-foreground">Subiendo imágenes...</p>
                        </>
                    ) : (
                        <>
                            <ImageIcon className="h-12 w-12 text-muted-foreground" />
                            <div>
                                <p className="text-sm font-medium">
                                    Arrastra imágenes aquí o{" "}
                                    <label htmlFor="image-upload" className="text-primary cursor-pointer hover:underline">
                                        selecciona archivos
                                    </label>
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    JPG, PNG o WEBP (max {maxSizeMB}MB cada una)
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {images.length}/{maxImages} imágenes
                                </p>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Preview de imágenes */}
            {images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {images.map((url, index) => (
                        <div key={index} className="relative group aspect-square rounded-lg overflow-hidden border border-border">
                            <Image
                                src={url}
                                alt={`Imagen ${index + 1}`}
                                fill
                                className="object-cover"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    onClick={() => handleRemoveImage(index)}
                                    className="rounded-full"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                            <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                                {index + 1}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
