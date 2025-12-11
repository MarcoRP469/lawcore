/**
 * Utilidades para trabajar con horarios de atención
 * Zona horaria: America/Lima (UTC-5)
 */

import type { Schedule, DaySchedule, TimeSlot } from '@/core/types';
import { isPeruHoliday, getHolidayName } from './peru-holidays';

// Mapeo de días en inglés a español
const DAY_NAMES: Record<string, string> = {
    monday: 'Lunes',
    tuesday: 'Martes',
    wednesday: 'Miércoles',
    thursday: 'Jueves',
    friday: 'Viernes',
    saturday: 'Sábado',
    sunday: 'Domingo',
};

// Mapeo de índice de día (0=domingo) a nombre en inglés
const DAY_INDEX_TO_NAME: Record<number, string> = {
    0: 'sunday',
    1: 'monday',
    2: 'tuesday',
    3: 'wednesday',
    4: 'thursday',
    5: 'friday',
    6: 'saturday',
};

/**
 * Obtiene la fecha/hora actual en zona horaria de Perú
 */
export function getPeruTime(): Date {
    // Crear fecha en zona horaria de Perú (UTC-5)
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const peruTime = new Date(utc + (3600000 * -5)); // UTC-5
    return peruTime;
}

/**
 * Verifica si está abierto en un momento dado
 * @param schedule - Horario de la notaría
 * @param date - Fecha/hora a verificar (default: ahora en Perú)
 * @param respectHolidays - Si true, considera feriados como cerrado
 * @returns true si está abierto, false si no
 */
export function isOpenAt(
    schedule: Schedule | undefined,
    date: Date = getPeruTime(),
    respectHolidays: boolean = true
): boolean {
    if (!schedule || schedule.length === 0) {
        return false;
    }

    // Verificar si es feriado
    if (respectHolidays && isPeruHoliday(date)) {
        return false;
    }

    // Obtener día de la semana (0=domingo, 6=sábado)
    const dayIndex = date.getDay();
    const dayName = DAY_INDEX_TO_NAME[dayIndex];

    // Buscar horario de ese día
    const daySchedule = schedule.find(d => d.day === dayName);

    if (!daySchedule || !daySchedule.isOpen) {
        return false;
    }

    // Obtener hora actual en formato HH:mm
    const currentTime = formatTime(date);

    // Verificar si está en algún intervalo
    return daySchedule.slots.some(slot => {
        return currentTime >= slot.start && currentTime <= slot.end;
    });
}

/**
 * Obtiene el próximo horario de apertura
 * @param schedule - Horario de la notaría
 * @param date - Fecha/hora desde la cual buscar
 * @returns Fecha de próxima apertura o null si no hay
 */
export function getNextOpenTime(
    schedule: Schedule | undefined,
    date: Date = getPeruTime()
): Date | null {
    if (!schedule || schedule.length === 0) {
        return null;
    }

    // Buscar en los próximos 14 días
    for (let i = 0; i < 14; i++) {
        const checkDate = new Date(date);
        checkDate.setDate(checkDate.getDate() + i);

        // Si es el mismo día, buscar desde la hora actual
        // Si es otro día, buscar desde las 00:00
        if (i > 0) {
            checkDate.setHours(0, 0, 0, 0);
        }

        const dayIndex = checkDate.getDay();
        const dayName = DAY_INDEX_TO_NAME[dayIndex];
        const daySchedule = schedule.find(d => d.day === dayName);

        if (!daySchedule || !daySchedule.isOpen) {
            continue;
        }

        // Verificar si es feriado
        if (isPeruHoliday(checkDate)) {
            continue;
        }

        // Buscar primer slot disponible
        for (const slot of daySchedule.slots) {
            const [hours, minutes] = slot.start.split(':').map(Number);
            const openTime = new Date(checkDate);
            openTime.setHours(hours, minutes, 0, 0);

            // Si es el mismo día, verificar que sea en el futuro
            if (i === 0 && openTime <= date) {
                continue;
            }

            return openTime;
        }
    }

    return null;
}

/**
 * Obtiene el horario de hoy
 * @param schedule - Horario de la notaría
 * @param date - Fecha a consultar (default: hoy en Perú)
 * @returns Horario del día o null si no hay
 */
export function getTodaySchedule(
    schedule: Schedule | undefined,
    date: Date = getPeruTime()
): DaySchedule | null {
    if (!schedule || schedule.length === 0) {
        return null;
    }

    const dayIndex = date.getDay();
    const dayName = DAY_INDEX_TO_NAME[dayIndex];

    return schedule.find(d => d.day === dayName) || null;
}

/**
 * Formatea el horario completo para mostrar
 * @param schedule - Horario de la notaría
 * @returns String formateado con el horario
 */
export function formatSchedule(schedule: Schedule | undefined): string {
    if (!schedule || schedule.length === 0) {
        return 'No hay horarios configurados';
    }

    return schedule
        .map(day => {
            const dayLabel = DAY_NAMES[day.day] || day.day;
            if (!day.isOpen) {
                return `${dayLabel}: Cerrado`;
            }
            const slots = day.slots.map(slot => `${slot.start} - ${slot.end}`).join(', ');
            return `${dayLabel}: ${slots}`;
        })
        .join('\n');
}

/**
 * Formatea un slot de tiempo para mostrar
 * @param slot - Slot de tiempo
 * @returns String formateado (ej: "8:00 AM - 1:00 PM")
 */
export function formatTimeSlot(slot: TimeSlot): string {
    return `${formatTimeDisplay(slot.start)} - ${formatTimeDisplay(slot.end)}`;
}

/**
 * Formatea una hora para mostrar (convierte 24h a 12h con AM/PM)
 * @param time - Hora en formato HH:mm
 * @returns Hora formateada (ej: "8:00 AM")
 */
export function formatTimeDisplay(time: string): string {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

/**
 * Formatea una fecha como hora (HH:mm)
 */
function formatTime(date: Date): string {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
}

/**
 * Valida un slot de tiempo
 * @param slot - Slot a validar
 * @returns true si es válido, false si no
 */
export function isValidTimeSlot(slot: TimeSlot): boolean {
    // Validar formato
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(slot.start) || !timeRegex.test(slot.end)) {
        return false;
    }

    // Validar que inicio < fin
    return slot.start < slot.end;
}

/**
 * Verifica si dos slots se solapan
 * @param slot1 - Primer slot
 * @param slot2 - Segundo slot
 * @returns true si se solapan, false si no
 */
export function slotsOverlap(slot1: TimeSlot, slot2: TimeSlot): boolean {
    return (
        (slot1.start >= slot2.start && slot1.start < slot2.end) ||
        (slot1.end > slot2.start && slot1.end <= slot2.end) ||
        (slot1.start <= slot2.start && slot1.end >= slot2.end)
    );
}

/**
 * Crea un horario por defecto (Lunes-Viernes 8:00-18:00)
 */
export function createDefaultSchedule(): Schedule {
    const weekdaySlots: TimeSlot[] = [
        { start: '08:00', end: '13:00' },
        { start: '14:00', end: '18:00' },
    ];

    return [
        { day: 'monday', dayLabel: 'Lunes', isOpen: true, slots: weekdaySlots },
        { day: 'tuesday', dayLabel: 'Martes', isOpen: true, slots: weekdaySlots },
        { day: 'wednesday', dayLabel: 'Miércoles', isOpen: true, slots: weekdaySlots },
        { day: 'thursday', dayLabel: 'Jueves', isOpen: true, slots: weekdaySlots },
        { day: 'friday', dayLabel: 'Viernes', isOpen: true, slots: weekdaySlots },
        { day: 'saturday', dayLabel: 'Sábado', isOpen: false, slots: [] },
        { day: 'sunday', dayLabel: 'Domingo', isOpen: false, slots: [] },
    ];
}
