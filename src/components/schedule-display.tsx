"use client";

import type { Schedule } from "@/core/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar } from "lucide-react";
import { useAvailability } from "@/hooks/use-availability";
import { formatTimeSlot, getPeruTime } from "@/lib/schedule-utils";

interface ScheduleDisplayProps {
    schedule: Schedule | undefined;
    autoAvailability?: boolean;
    showStatus?: boolean;
}

export function ScheduleDisplay({
    schedule,
    autoAvailability = false,
    showStatus = true
}: ScheduleDisplayProps) {
    const { isOpen, nextOpenTime, isHoliday, holidayName } = useAvailability(
        schedule,
        autoAvailability
    );

    if (!schedule || schedule.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Horarios de Atención
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        No hay horarios configurados
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Horarios de Atención
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Badge de estado */}
                {showStatus && autoAvailability && (
                    <div className="flex flex-col gap-2">
                        {isHoliday ? (
                            <Badge variant="secondary" className="w-fit">
                                <Calendar className="h-3 w-3 mr-1" />
                                Feriado: {holidayName}
                            </Badge>
                        ) : isOpen ? (
                            <Badge variant="default" className="w-fit bg-green-600 hover:bg-green-700">
                                🟢 Abierto ahora
                            </Badge>
                        ) : (
                            <Badge variant="secondary" className="w-fit">
                                🔴 Cerrado
                            </Badge>
                        )}

                        {/* Próxima apertura */}
                        {!isOpen && nextOpenTime && (
                            <p className="text-sm text-muted-foreground">
                                Próxima apertura:{" "}
                                <span className="font-medium text-foreground">
                                    {formatNextOpenTime(nextOpenTime)}
                                </span>
                            </p>
                        )}
                    </div>
                )}

                {/* Lista de horarios */}
                <div className="space-y-2">
                    {schedule.map((day) => (
                        <div
                            key={day.day}
                            className="flex justify-between items-start py-1 border-b border-border/50 last:border-0"
                        >
                            <span className="font-medium text-sm">{day.dayLabel}</span>
                            <div className="text-sm text-right">
                                {!day.isOpen ? (
                                    <span className="text-muted-foreground italic">Cerrado</span>
                                ) : day.slots.length === 0 ? (
                                    <span className="text-muted-foreground italic">Sin horarios</span>
                                ) : (
                                    <div className="space-y-0.5">
                                        {day.slots.map((slot, index) => (
                                            <div key={index} className="text-foreground">
                                                {formatTimeSlot(slot)}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Nota sobre feriados */}
                <p className="text-xs text-muted-foreground italic">
                    * Los días feriados nacionales permanecen cerrados
                </p>
            </CardContent>
        </Card>
    );
}

/**
 * Formatea la próxima fecha de apertura de forma amigable
 */
function formatNextOpenTime(date: Date): string {
    const now = getPeruTime();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const openDate = new Date(date);
    openDate.setHours(0, 0, 0, 0);

    // Si es hoy
    if (openDate.getTime() === new Date(now.setHours(0, 0, 0, 0)).getTime()) {
        const hours = date.getHours();
        const minutes = date.getMinutes();
        return `Hoy a las ${hours}:${minutes.toString().padStart(2, "0")}`;
    }

    // Si es mañana
    if (openDate.getTime() === tomorrow.getTime()) {
        const hours = date.getHours();
        const minutes = date.getMinutes();
        return `Mañana a las ${hours}:${minutes.toString().padStart(2, "0")}`;
    }

    // Otro día
    const dayNames = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
    const dayName = dayNames[date.getDay()];
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return `${dayName} a las ${hours}:${minutes.toString().padStart(2, "0")}`;
}
