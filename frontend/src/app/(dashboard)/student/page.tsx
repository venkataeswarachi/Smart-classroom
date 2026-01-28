"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, CheckCircle2, Clock, BookOpen, AlertCircle, QrCode } from "lucide-react";
import Link from "next/link";

export default function StudentDashboard() {
    const [todayClasses, setTodayClasses] = useState<any[]>([]);
    const [stats, setStats] = useState({
        attendancePercentage: 0,
        classesAttended: 0,
        totalClasses: 0
    });

    useEffect(() => {
        // Fetch dashboard data
        const fetchData = async () => {
            try {
                const [todayRes, profileRes] = await Promise.all([
                    api.get("/student/today"),
                    api.get("/student/profile") // Just to ensure we're logged in/get some data
                ]);
                setTodayClasses(todayRes.data);

                // Mock stats for now since we don't have a single aggregate endpoint
                // You might want to create one in backend or fetch multiple
                // For demonstration, let's just use dummy or calculate if possible
                setStats({
                    attendancePercentage: 75,
                    classesAttended: 24,
                    totalClasses: 32
                })

            } catch (err) {
                console.error("Failed to fetch dashboard data", err);
            }
        };
        fetchData();
    }, []);

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-4xl font-black tracking-tight text-foreground">
                    Welcome back<span className="text-primary">.</span>
                </h1>
                <p className="text-lg text-muted-foreground">Here's your academic overview for today.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="shadow-lg shadow-emerald-500/5 hover:shadow-emerald-500/10 border-emerald-100 transition-all">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-semibold text-muted-foreground">Overall Attendance</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center">
                            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-foreground">{stats.attendancePercentage}%</div>
                        <p className="text-xs font-medium text-emerald-600 mt-1">
                            {stats.classesAttended} / {stats.totalClasses} sessions
                        </p>
                    </CardContent>
                </Card>
                <Card className="shadow-lg shadow-blue-500/5 hover:shadow-blue-500/10 border-blue-100 transition-all">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-semibold text-muted-foreground">Today's Classes</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <CalendarDays className="h-5 w-5 text-blue-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-foreground">{todayClasses.length}</div>
                        <p className="text-xs font-medium text-blue-600 mt-1">Scheduled sessions</p>
                    </CardContent>
                </Card>
                <Card className="shadow-lg shadow-orange-500/5 hover:shadow-orange-500/10 border-orange-100 transition-all bg-orange-50/30">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-semibold text-muted-foreground">Next Class</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center">
                            <Clock className="h-5 w-5 text-orange-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold truncate text-foreground">
                            {todayClasses.length > 0 ? todayClasses[0].subjectName : "No classes"}
                        </div>
                        <p className="text-xs font-medium text-orange-600 mt-1">
                            {todayClasses.length > 0 ? todayClasses[0].startTime : "--:--"}
                        </p>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-lg shadow-primary/20 bg-gradient-to-br from-primary to-orange-600 text-white relative overflow-hidden group">
                    <CardContent className="pt-6 h-full flex flex-col justify-center relative z-10">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <QrCode className="h-24 w-24" />
                        </div>
                        <Link href="/student/scan" className="w-full">
                            <Button variant="ghost" className="w-full h-auto py-2 text-white hover:bg-white/10 hover:text-white border border-white/20 flex flex-col gap-2 rounded-xl">
                                <QrCode className="h-8 w-8" />
                                <span className="font-semibold">Scan Attendance</span>
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4 shadow-sm border-border/60">
                    <CardHeader>
                        <CardTitle className="text-xl">Today's Schedule</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {todayClasses.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-8 text-center">
                                    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
                                        <CalendarDays className="h-6 w-6 text-muted-foreground" />
                                    </div>
                                    <p className="text-muted-foreground font-medium">No classes scheduled for today.</p>
                                </div>
                            ) : (
                                todayClasses.map((cls, i) => (
                                    <div key={i} className="flex items-center p-4 border border-border/60 rounded-xl bg-card hover:bg-muted/30 transition-colors group">
                                        <div className="flex items-center justify-center h-12 w-12 bg-primary/10 rounded-lg border border-primary/20 mr-4 group-hover:scale-105 transition-transform">
                                            <BookOpen className="h-6 w-6 text-primary" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-base font-bold text-foreground leading-none mb-1">{cls.subjectName}</p>
                                            <p className="text-sm text-muted-foreground font-medium flex items-center gap-1.5">
                                                <Clock className="h-3 w-3" />
                                                {cls.startTime.substring(0, 5)} - {cls.endTime.substring(0, 5)}
                                            </p>
                                        </div>
                                        <div className="ml-auto">
                                            <span className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs font-semibold text-muted-foreground ring-1 ring-inset ring-gray-500/10">
                                                {cls.subjectCode}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-3 shadow-sm border-border/60">
                    <CardHeader>
                        <CardTitle className="text-xl">Notifications</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex gap-4 items-start p-4 bg-amber-50/50 border border-amber-100 rounded-xl">
                                <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                                    <AlertCircle className="h-5 w-5 text-amber-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-amber-900">Exam Schedule Released</p>
                                    <p className="text-xs text-amber-700 mt-1 leading-relaxed">Mid-term exams start next week. Check your timetable for detailed slots.</p>
                                </div>
                            </div>
                            {/* Empty state for notifications if needed */}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
