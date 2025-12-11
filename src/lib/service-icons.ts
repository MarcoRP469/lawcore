/**
 * Utilidad para obtener el icono apropiado para un servicio notarial
 * basándose en la categoría del servicio
 */

// Mapeo directo de categorías a iconos
const CATEGORY_ICON_MAP: Record<string, string> = {
    // Categorías principales
    "Derecho Inmobiliario": '/images/service-icons/inmobiliario.svg',
    "Derecho Corporativo": '/images/service-icons/corporativo.svg',
    "Testamentos": '/images/service-icons/testamento.svg',
    "Contratos": '/images/service-icons/contrato.svg',
    "Asesoría Legal": '/images/service-icons/legal.svg',
    "Protocolización de escrituras": '/images/service-icons/legal.svg',
    "Autenticación de firmas": '/images/service-icons/documento-firma.svg',
    "Actas notariales": '/images/service-icons/legal.svg',
    "Poderes": '/images/service-icons/documento-firma.svg',
};

// Icono por defecto (balanza de justicia)
const DEFAULT_ICON = '/images/default-service.svg';

/**
 * Obtiene el icono apropiado para un servicio basándose en su categoría
 * @param category - Categoría del servicio (ej: "Derecho Inmobiliario")
 * @returns Ruta al icono SVG
 */
export function getServiceIcon(category?: string): string {
    if (!category) {
        return DEFAULT_ICON;
    }

    // Buscar el icono correspondiente a la categoría
    return CATEGORY_ICON_MAP[category] || DEFAULT_ICON;
}

/**
 * Obtiene la imagen a mostrar para un servicio
 * Prioridad: imagen personalizada > icono de categoría > imagen por defecto
 */
export function getServiceImage(
    images: string[] | undefined,
    category?: string
): string {
    // Si hay imagen personalizada, usarla
    if (images && images.length > 0 && images[0].trim() !== '') {
        return images[0];
    }

    // Si no, usar icono de la categoría
    return getServiceIcon(category);
}
