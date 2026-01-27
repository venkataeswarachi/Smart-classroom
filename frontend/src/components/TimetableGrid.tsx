"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Slot {
    id: number;
    day: string;
    startTime: string;
    endTime: string;
    subjectName: string;
    subjectCode: string;
    facultyEmail: string;
    dept: string;
    section: string;
    break: boolean;
}

interface TimetableGridProps {
    data: Slot[];
    userRole?: "STUDENT" | "FACULTY" | "ADMIN";
}

const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];

export function TimetableGrid({ data, userRole = "STUDENT" }: TimetableGridProps) {
    // 1. Extract unique start times to define columns (Periods)
    // We assume the schedule is consistent across days for column headers
    // or we just render day-by-day rows.
    // A true grid needs common columns. Let's try to derive them.

    // Sort data first
    const sortedData = [...data].sort((a, b) => a.startTime.localeCompare(b.startTime));

    // Get all unique start times to use as column headers (if we want a strict grid)
    // However, breaks might differ?? Usually breaks are standard.
    // Let's stick to a robust Row-based layout (Flexbox/Grid) per day first, 
    // but styled to LOOK like a table.

    const groupedByDay = DAYS.map(day => ({
        day,
        slots: sortedData.filter(s => s.day === day)
    }));

    // Determine standard columns from the first day that has data?
    // Or just iterate.

    return (
        <div className="space-y-8">
            {/* Header / Legend */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground p-4 bg-card rounded-lg border border-border">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-primary" />
                    <span>Theory Class</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span>Lab / Practical</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-secondary" />
                    <span>Break / Lunch</span>
                </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
                <table className="w-full text-sm text-left">
                    <thead className="bg-secondary/50 text-muted-foreground uppercase text-xs">
                        <tr>
                            <th className="px-6 py-4 font-medium w-32 border-b border-border">Day</th>
                            {/* We can't easily predict dynamic columns if days differ, 
                    so we will render the timeline horizontally in the body */}
                            <th className="px-6 py-4 font-medium border-b border-border">Schedule</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {groupedByDay.map((group) => {
                            if (group.slots.length === 0) return null;

                            return (
                                <tr key={group.day} className="hover:bg-secondary/30 transition-colors">
                                    <td className="px-6 py-6 font-semibold text-foreground align-top bg-secondary/10">
                                        {group.day.substring(0, 3)}
                                    </td>
                                    <td className="px-6 py-6">
                                        <div className="flex gap-4">
                                            {group.slots.map((slot, index) => {
                                                const isBreak = slot.break;
                                                const isLab = slot.subjectName?.toLowerCase().includes("lab");

                                                return (
                                                    <div
                                                        key={slot.id}
                                                        className={cn(
                                                            "flex-shrink-0 flex flex-col justify-between p-3 rounded-lg border min-h-[100px] w-40 transition-all hover:scale-105 hover:shadow-md",
                                                            isBreak
                                                                ? "bg-secondary/50 border-transparent text-muted-foreground items-center justify-center w-24 min-h-[100px]"
                                                                : "bg-card border-border",
                                                            isLab && !isBreak ? "border-emerald-500/20 bg-emerald-500/5" : "",
                                                            !isLab && !isBreak ? "border-primary/20 bg-primary/5" : ""
                                                        )}
                                                    >
                                                        {isBreak ? (
                                                            <div className="text-center">
                                                                <span className="text-xs font-mono mb-1 block opacity-70">
                                                                    {slot.startTime.substring(0, 5)}
                                                                </span>
                                                                <span className="font-semibold text-xs uppercase tracking-wider">
                                                                    {slot.subjectName || "Break"}
                                                                </span>
                                                                <span className="text-xs font-mono mt-1 block opacity-70">
                                                                    {slot.endTime.substring(0, 5)}
                                                                </span>
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <div className="flex justify-between items-start mb-2">
                                                                    <span className="text-xs font-mono text-muted-foreground">
                                                                        {slot.startTime.substring(0, 5)}
                                                                    </span>
                                                                    <Badge variant="outline" className={cn("text-[10px] h-5 px-1", isLab ? "border-emerald-500/30 text-emerald-500" : "border-primary/30 text-primary")}>
                                                                        {slot.subjectCode || "LEC"}
                                                                    </Badge>
                                                                </div>
                                                                <div>
                                                                    <h4 className="font-semibold text-sm line-clamp-2 leading-tight mb-1" title={slot.subjectName}>
                                                                        {slot.subjectName}
                                                                    </h4>
                                                                    <p className="text-xs text-muted-foreground truncate">
                                                                        {userRole === "STUDENT" ? slot.facultyEmail : `${slot.dept}-${slot.section}`}
                                                                    </p>
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
