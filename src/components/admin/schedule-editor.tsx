"use client";

import { useState } from "react";
import type { Schedule, DaySchedule, TimeSlot } from "@/core/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { isValidTimeSlot, slotsOverlap, createDefaultSchedule } from "@/lib/schedule-utils";

interface ScheduleEditorProps {
    schedule: Schedule | undefined;
    onChange: (schedule: Schedule) => void;
}

export function ScheduleEditor({ schedule, onChange }: ScheduleEditorProps) {
    const { toast } = useToast();
    const [currentSchedule, setCurrentSchedule] = useState<Schedule>(
        schedule || createDefaultSchedule()
    );

    const handleDayToggle = (dayIndex: number) => {
        const newSchedule = [...currentSchedule];
        newSchedule[dayIndex] = {
            ...newSchedule[dayIndex],
            isOpen: !newSchedule[dayIndex].isOpen,
        };
        setCurrentSchedule(newSchedule);
        onChange(newSchedule);
    };

    const handleAddSlot = (dayIndex: number) => {
        const newSchedule = [...currentSchedule];
        const lastSlot = newSchedule[dayIndex].slots[newSchedule[dayIndex].slots.length - 1];

        // Sugerir horario basado en el último slot
        const newSlot: TimeSlot = lastSlot
            ? { start: lastSlot.end, end: "18:00" }
            : { start: "08:00", end: "13:00" };

        newSchedule[dayIndex].slots.push(newSlot);
        setCurrentSchedule(newSchedule);
        onChange(newSchedule);
    };

    const handleRemoveSlot = (dayIndex: number, slotIndex: number) => {
        const newSchedule = [...currentSchedule];
        newSchedule[dayIndex].slots.splice(slotIndex, 1);
        setCurrentSchedule(newSchedule);
        onChange(newSchedule);
    };

    const handleSlotChange = (
        dayIndex: number,
        slotIndex: number,
        field: "start" | "end",
        value: string
    ) => {
        const newSchedule = [...currentSchedule];
        newSchedule[dayIndex].slots[slotIndex][field] = value;

        // Validar el slot
        const slot = newSchedule[dayIndex].slots[slotIndex];
        if (!isValidTimeSlot(slot)) {
            toast({
                variant: "destructive",
                title: "Horario inválido",
                description: "La hora de inicio debe ser menor que la hora de fin.",
            });
            return;
        }

        // Verificar solapamiento con otros slots del mismo día
        const otherSlots = newSchedule[dayIndex].slots.filter((_, i) => i !== slotIndex);
        const hasOverlap = otherSlots.some((otherSlot) => slotsOverlap(slot, otherSlot));

        if (hasOverlap) {
            toast({
                variant: "destructive",
                title: "Horarios solapados",
                description: "Los intervalos de tiempo no pueden solaparse.",
            });
            return;
        }

        setCurrentSchedule(newSchedule);
        onChange(newSchedule);
    };

    return (
        <div className="space-y-4">
            {currentSchedule.map((day, dayIndex) => (
                <Card key={day.day} className="overflow-hidden">
                    <CardContent className="p-4">
                        {/* Header del día */}
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <Label className="text-base font-semibold">{day.dayLabel}</Label>
                                <Switch
                                    checked={day.isOpen}
                                    onCheckedChange={() => handleDayToggle(dayIndex)}
                                />
                                <span className="text-sm text-muted-foreground">
                                    {day.isOpen ? "Abierto" : "Cerrado"}
                                </span>
                            </div>
                        </div>

                        {/* Slots de tiempo */}
                        {day.isOpen && (
                            <div className="space-y-2 ml-4">
                                {day.slots.length === 0 ? (
                                    <p className="text-sm text-muted-foreground italic">
                                        No hay horarios configurados para este día
                                    </p>
                                ) : (
                                    day.slots.map((slot, slotIndex) => (
                                        <div key={slotIndex} className="flex items-center gap-2">
                                            <Clock className="h-4 w-4 text-muted-foreground" />

                                            {/* Hora de inicio */}
                                            <div className="flex items-center gap-1">
                                                <Input
                                                    type="time"
                                                    value={slot.start}
                                                    onChange={(e) =>
                                                        handleSlotChange(dayIndex, slotIndex, "start", e.target.value)
                                                    }
                                                    className="w-32"
                                                />
                                            </div>

                                            <span className="text-muted-foreground">a</span>

                                            {/* Hora de fin */}
                                            <div className="flex items-center gap-1">
                                                <Input
                                                    type="time"
                                                    value={slot.end}
                                                    onChange={(e) =>
                                                        handleSlotChange(dayIndex, slotIndex, "end", e.target.value)
                                                    }
                                                    className="w-32"
                                                />
                                            </div>

                                            {/* Botón eliminar */}
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleRemoveSlot(dayIndex, slotIndex)}
                                                className="h-8 w-8"
                                            >
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </div>
                                    ))
                                )}

                                {/* Botón agregar intervalo */}
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleAddSlot(dayIndex)}
                                    className="mt-2"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Agregar intervalo
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            ))}

            {/* Información adicional */}
            <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                <p className="font-medium mb-1">ℹ️ Información:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Los horarios se calculan en zona horaria de Perú (UTC-5)</li>
                    <li>Los días feriados nacionales se consideran cerrados automáticamente</li>
                    <li>Puedes agregar múltiples intervalos por día (ej: mañana y tarde)</li>
                </ul>
            </div>
        </div>
    );
}
