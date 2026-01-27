"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Loader2, CalendarCheck } from "lucide-react";

export default function StudentAttendancePage() {
    const [daily, setDaily] = useState<any[]>([]);
    const [semesterData, setSemesterData] = useState<any>(null);
    const [semester, setSemester] = useState("1");
    const [loading, setLoading] = useState(true);

    // 🔹 Fetch attendance based on semester
    useEffect(() => {
        const fetchAttendance = async () => {
            setLoading(true);
            try {
                const [dailyRes, semRes] = await Promise.all([
                    api.get("/student/attendance/daily"),
                    api.get(`/student/attendance/semester/${semester}/percentage`)
                ]);

                setDaily(dailyRes.data);
                setSemesterData(semRes.data);
            } catch (err) {
                console.error("Failed to load attendance", err);
            } finally {
                setLoading(false);
            }
        };

        fetchAttendance();
    }, [semester]); // 🔥 re-run when semester changes

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin mr-2" />
                Loading attendance...
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">
                    My Attendance
                </h1>

                {/* 🔹 Semester Selector */}
                <Select value={semester} onValueChange={setSemester}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select semester" />
                    </SelectTrigger>
                    <SelectContent>
                        {[1,2,3,4,5,6,7,8].map((s) => (
                            <SelectItem key={s} value={String(s)}>
                                Semester {s}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* 🔹 Semester Summary */}
            {semesterData && (
                <Card>
                    <CardHeader>
                        <CardTitle>
                            Semester {semesterData.semester} Summary
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-3 gap-4 text-center">
                        <div>
                            <p className="text-muted-foreground">Total Classes</p>
                            <p className="text-xl font-bold">
                                {semesterData.totalClasses}
                            </p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Present</p>
                            <p className="text-xl font-bold text-green-600">
                                {semesterData.presentClasses}
                            </p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Percentage</p>
                            <p className="text-xl font-bold">
                                {semesterData.percentage}%
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* 🔹 Today's Attendance */}
            <Card>
                <CardHeader className="flex flex-row items-center gap-2">
                    <CalendarCheck className="h-5 w-5" />
                    <CardTitle>Today’s Attendance</CardTitle>
                </CardHeader>

                <CardContent className="space-y-3">
                    {daily.length === 0 ? (
                        <p className="text-muted-foreground text-center py-6">
                            No classes today 🎉
                        </p>
                    ) : (
                        daily.map((p, i) => (
                            <div
                                key={i}
                                className="flex items-center justify-between border rounded-lg p-4"
                            >
                                <div>
                                    <p className="font-medium">
                                        {p.subjectName} ({p.subjectCode})
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {p.startTime} - {p.endTime}
                                    </p>
                                </div>

                                <span
                                    className={`px-3 py-1 rounded-full text-sm font-semibold
                                        ${
                                            p.status === "PRESENT"
                                                ? "bg-green-100 text-green-700"
                                                : p.status === "ABSENT"
                                                ? "bg-red-100 text-red-700"
                                                : p.status === "NOT_MARKED"
                                                ? "bg-yellow-100 text-yellow-700"
                                                : "bg-gray-100 text-gray-600"
                                        }
                                    `}
                                >
                                    {p.status}
                                </span>
                            </div>
                        ))
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
