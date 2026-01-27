"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { TimetableGrid } from "@/components/TimetableGrid";
import { Loader2 } from "lucide-react";

export default function StudentTimeTablePage() {
    const [timetable, setTimetable] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTimetable = async () => {
            try {
                const res = await api.get("/student/timetable");
                setTimetable(res.data);
            } catch (err) {
                console.error("Failed to fetch timetable", err);
            } finally {
                setLoading(false);
            }
        };
        fetchTimetable();
    }, []);

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin mr-2" />
                Loading schedule...
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Prototype-style Header */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-primary to-purple-600 p-8 shadow-2xl">
                <div className="relative z-10">
                    <h1 className="text-3xl font-bold text-white mb-2">Class Schedule</h1>
                    <p className="text-blue-100 max-w-xl text-lg">
                        View your full weekly academic plan, including breaks, labs, and theory sessions.
                    </p>
                </div>
                {/* Decorative glow */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-40 w-40 rounded-full bg-white/10 blur-3xl"></div>
            </div>

            {timetable.length === 0 ? (
                <div className="p-12 text-center border-2 border-dashed border-border rounded-lg text-muted-foreground">
                    No timetable assigned yet.
                </div>
            ) : (
                <TimetableGrid data={timetable} userRole="STUDENT" />
            )}
        </div>
    );
}
