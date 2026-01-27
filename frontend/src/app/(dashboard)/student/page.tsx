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
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Welcome back!</h1>
                <p className="text-gray-500 dark:text-gray-400">Here's your academic overview for today.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Overall Attendance</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.attendancePercentage}%</div>
                        <p className="text-xs text-gray-500">
                            {stats.classesAttended} / {stats.totalClasses} sessions
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Today's Classes</CardTitle>
                        <CalendarDays className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{todayClasses.length}</div>
                        <p className="text-xs text-gray-500">Scheduled sessions</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Next Class</CardTitle>
                        <Clock className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold truncate">
                            {todayClasses.length > 0 ? todayClasses[0].subjectName : "No classes"}
                        </div>
                        <p className="text-xs text-gray-500">
                            {todayClasses.length > 0 ? todayClasses[0].startTime : "--:--"}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <Link href="/student/scan">
                            <Button className="w-full h-auto py-4 flex flex-col gap-2">
                                <QrCode className="h-8 w-8" />
                                <span>Scan Attendance</span>
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Today's Schedule</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {todayClasses.length === 0 ? (
                                <p className="text-sm text-gray-500">No classes scheduled for today.</p>
                            ) : (
                                todayClasses.map((cls, i) => (
                                    <div key={i} className="flex items-center p-4 border rounded-lg bg-slate-50 dark:bg-slate-900/50">
                                        <div className="flex bg-white dark:bg-slate-800 p-2 rounded-md border mr-4">
                                            <BookOpen className="h-5 w-5 text-primary" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium leading-none">{cls.subjectName}</p>
                                            <p className="text-xs text-gray-500 mt-1">{cls.startTime} - {cls.endTime}</p>
                                        </div>
                                        <div className="ml-auto font-medium text-xs text-gray-500">
                                            {cls.subjectCode}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Notifications</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex gap-4 items-start p-3 bg-yellow-50 dark:bg-yellow-900/10 border-l-4 border-yellow-500 rounded-r-md">
                                <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Exam Schedule Released</p>
                                    <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">Mid-term exams start next week. Check your timetable.</p>
                                </div>
                            </div>
                            {/* Notifications Area */}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
