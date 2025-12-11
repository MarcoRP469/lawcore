"use client";

import { useState, useEffect } from 'react';
import { AdCard } from '@/components/ads/AdCard';
import { Ad } from '@/types/ad';
import { Button } from '@/components/ui/button';
import { PlusCircle, Search } from 'lucide-react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

export default function AnunciosPage() {
    const [ads, setAds] = useState<Ad[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState<string>("todos");
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchAds();
    }, [filterType]);

    const fetchAds = async () => {
        setLoading(true);
        try {
            let url = `${process.env.NEXT_PUBLIC_API_URL}/anuncios`;
            if (filterType && filterType !== "todos") {
                url += `?type=${filterType}`;
            }

            const res = await fetch(url);
            if (!res.ok) throw new Error('Error al cargar anuncios');
            const data = await res.json();
            setAds(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const filteredAds = ads.filter(ad =>
        ad.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ad.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="container mx-auto py-8 text-black">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Anuncios y Ofertas</h1>
                    <p className="text-muted-foreground mt-2">
                        Encuentra oportunidades o publica tus necesidades legales y notariales.
                    </p>
                </div>
                <Button asChild className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                    <Link href="/anuncios/crear">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Publicar Anuncio
                    </Link>
                </Button>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border mb-8 flex flex-col md:flex-row gap-4">
                <div className="relative flex-grow">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                        placeholder="Buscar anuncios..."
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="w-full md:w-[200px]">
                    <Select value={filterType} onValueChange={setFilterType}>
                        <SelectTrigger>
                            <SelectValue placeholder="Filtrar por tipo" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="todos">Todos</SelectItem>
                            <SelectItem value="oferta">Ofertas</SelectItem>
                            <SelectItem value="demanda">Demandas</SelectItem>
                            <SelectItem value="promocion">Promociones</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="h-[350px] bg-gray-100 animate-pulse rounded-lg"></div>
                    ))}
                </div>
            ) : filteredAds.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredAds.map((ad) => (
                        <AdCard key={ad.id} ad={ad} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-gray-50 rounded-lg border border-dashed">
                    <h3 className="text-lg font-medium text-gray-900">No hay anuncios disponibles</h3>
                    <p className="text-gray-500 mt-1">Sé el primero en publicar una oferta o demanda.</p>
                    <Button variant="outline" className="mt-4" asChild>
                        <Link href="/anuncios/crear">Publicar ahora</Link>
                    </Button>
                </div>
            )}
        </div>
    );
}
