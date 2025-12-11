/**
 * Días feriados de Perú
 * Fuente: Gobierno del Perú - Días feriados nacionales
 */

export type Holiday = {
    date: string; // Formato "YYYY-MM-DD"
    name: string;
    type: 'national' | 'regional';
};

// Feriados de Perú 2024-2026
export const PERU_HOLIDAYS: Holiday[] = [
    // 2024
    { date: '2024-01-01', name: 'Año Nuevo', type: 'national' },
    { date: '2024-03-28', name: 'Jueves Santo', type: 'national' },
    { date: '2024-03-29', name: 'Viernes Santo', type: 'national' },
    { date: '2024-05-01', name: 'Día del Trabajo', type: 'national' },
    { date: '2024-06-29', name: 'San Pedro y San Pablo', type: 'national' },
    { date: '2024-07-28', name: 'Día de la Independencia', type: 'national' },
    { date: '2024-07-29', name: 'Fiestas Patrias', type: 'national' },
    { date: '2024-08-30', name: 'Santa Rosa de Lima', type: 'national' },
    { date: '2024-10-08', name: 'Combate de Angamos', type: 'national' },
    { date: '2024-11-01', name: 'Día de Todos los Santos', type: 'national' },
    { date: '2024-12-08', name: 'Inmaculada Concepción', type: 'national' },
    { date: '2024-12-25', name: 'Navidad', type: 'national' },

    // 2025
    { date: '2025-01-01', name: 'Año Nuevo', type: 'national' },
    { date: '2025-04-17', name: 'Jueves Santo', type: 'national' },
    { date: '2025-04-18', name: 'Viernes Santo', type: 'national' },
    { date: '2025-05-01', name: 'Día del Trabajo', type: 'national' },
    { date: '2025-06-29', name: 'San Pedro y San Pablo', type: 'national' },
    { date: '2025-07-28', name: 'Día de la Independencia', type: 'national' },
    { date: '2025-07-29', name: 'Fiestas Patrias', type: 'national' },
    { date: '2025-08-30', name: 'Santa Rosa de Lima', type: 'national' },
    { date: '2025-10-08', name: 'Combate de Angamos', type: 'national' },
    { date: '2025-11-01', name: 'Día de Todos los Santos', type: 'national' },
    { date: '2025-12-08', name: 'Inmaculada Concepción', type: 'national' },
    { date: '2025-12-25', name: 'Navidad', type: 'national' },

    // 2026
    { date: '2026-01-01', name: 'Año Nuevo', type: 'national' },
    { date: '2026-04-02', name: 'Jueves Santo', type: 'national' },
    { date: '2026-04-03', name: 'Viernes Santo', type: 'national' },
    { date: '2026-05-01', name: 'Día del Trabajo', type: 'national' },
    { date: '2026-06-29', name: 'San Pedro y San Pablo', type: 'national' },
    { date: '2026-07-28', name: 'Día de la Independencia', type: 'national' },
    { date: '2026-07-29', name: 'Fiestas Patrias', type: 'national' },
    { date: '2026-08-30', name: 'Santa Rosa de Lima', type: 'national' },
    { date: '2026-10-08', name: 'Combate de Angamos', type: 'national' },
    { date: '2026-11-01', name: 'Día de Todos los Santos', type: 'national' },
    { date: '2026-12-08', name: 'Inmaculada Concepción', type: 'national' },
    { date: '2026-12-25', name: 'Navidad', type: 'national' },
];

/**
 * Verifica si una fecha es feriado en Perú
 * @param date - Fecha a verificar
 * @returns true si es feriado, false si no
 */
export function isPeruHoliday(date: Date): boolean {
    const dateString = formatDateForHoliday(date);
    return PERU_HOLIDAYS.some(holiday => holiday.date === dateString);
}

/**
 * Obtiene el nombre del feriado si la fecha es feriado
 * @param date - Fecha a verificar
 * @returns Nombre del feriado o null si no es feriado
 */
export function getHolidayName(date: Date): string | null {
    const dateString = formatDateForHoliday(date);
    const holiday = PERU_HOLIDAYS.find(h => h.date === dateString);
    return holiday ? holiday.name : null;
}

/**
 * Formatea una fecha para comparar con la lista de feriados
 */
function formatDateForHoliday(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}
