/**
 * Hook para obtener disponibilidad en tiempo real
 */

import { useState, useEffect } from 'react';
import type { Schedule } from '@/core/types';
import { isOpenAt, getNextOpenTime, getPeruTime } from '@/lib/schedule-utils';
import { getHolidayName } from '@/lib/peru-holidays';

export interface AvailabilityStatus {
    isOpen: boolean;
    nextOpenTime: Date | null;
    isHoliday: boolean;
    holidayName: string | null;
    currentTime: Date;
}

/**
 * Hook para obtener disponibilidad automática basada en horarios
 * Se actualiza cada minuto automáticamente
 */
export function useAvailability(
    schedule?: Schedule,
    autoAvailability?: boolean
): AvailabilityStatus {
    const [status, setStatus] = useState<AvailabilityStatus>(() => {
        const now = getPeruTime();
        return {
            isOpen: autoAvailability && schedule ? isOpenAt(schedule, now) : false,
            nextOpenTime: schedule ? getNextOpenTime(schedule, now) : null,
            isHoliday: false,
            holidayName: getHolidayName(now),
            currentTime: now,
        };
    });

    useEffect(() => {
        if (!autoAvailability || !schedule) {
            return;
        }

        const checkAvailability = () => {
            const now = getPeruTime();
            const holidayName = getHolidayName(now);

            setStatus({
                isOpen: isOpenAt(schedule, now),
                nextOpenTime: getNextOpenTime(schedule, now),
                isHoliday: holidayName !== null,
                holidayName,
                currentTime: now,
            });
        };

        // Verificar inmediatamente
        checkAvailability();

        // Verificar cada minuto
        const interval = setInterval(checkAvailability, 60000);

        return () => clearInterval(interval);
    }, [schedule, autoAvailability]);

    return status;
}
