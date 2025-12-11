export interface Ad {
    id: number;
    usuario_id: string;
    titulo: string;
    descripcion: string;
    precio?: number;
    tipo: 'oferta' | 'demanda' | 'promocion';
    imagen_url?: string;
    contacto?: string;
    creado_en: string; // ISO date string

    // Datos enriquecidos
    userDisplayName?: string;
    userPhotoURL?: string;
}

export type AdCreate = Omit<Ad, 'id' | 'creado_en' | 'userDisplayName' | 'userPhotoURL'>;
