"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AutoCarouselProps {
    images: string[];
    alt: string;
    interval?: number; // en milisegundos
}

export function AutoCarousel({ images, alt, interval = 4000 }: AutoCarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0);

    // Auto-avanzar el carrusel
    useEffect(() => {
        if (images.length <= 1) return;

        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % images.length);
        }, interval);

        return () => clearInterval(timer);
    }, [images.length, interval]);

    const goToPrevious = () => {
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    const goToNext = () => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
    };

    if (images.length === 0) {
        return (
            <div className="relative w-full aspect-video bg-muted flex items-center justify-center rounded-lg">
                <p className="text-muted-foreground">No hay imágenes disponibles</p>
            </div>
        );
    }

    if (images.length === 1) {
        return (
            <div className="relative w-full aspect-video rounded-lg overflow-hidden">
                <Image
                    src={images[0]}
                    alt={alt}
                    fill
                    className="object-cover"
                />
            </div>
        );
    }

    return (
        <div className="relative w-full aspect-video rounded-lg overflow-hidden group">
            {/* Imagen actual */}
            <Image
                src={images[currentIndex]}
                alt={`${alt} - Imagen ${currentIndex + 1}`}
                fill
                className="object-cover transition-opacity duration-500"
            />

            {/* Botones de navegación */}
            <Button
                variant="ghost"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={goToPrevious}
            >
                <ChevronLeft className="h-6 w-6" />
            </Button>

            <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={goToNext}
            >
                <ChevronRight className="h-6 w-6" />
            </Button>

            {/* Indicadores */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {images.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        className={`w-2 h-2 rounded-full transition-all ${index === currentIndex
                                ? "bg-white w-6"
                                : "bg-white/50 hover:bg-white/75"
                            }`}
                        aria-label={`Ir a imagen ${index + 1}`}
                    />
                ))}
            </div>

            {/* Contador */}
            <div className="absolute top-4 right-4 bg-black/70 text-white text-sm px-3 py-1 rounded-full">
                {currentIndex + 1} / {images.length}
            </div>
        </div>
    );
}
