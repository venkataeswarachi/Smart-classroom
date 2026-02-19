"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { motion } from "framer-motion";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, getDay } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ChevronLeft, ChevronRight, CheckCircle2, XCircle, TrendingUp, Calendar as CalendarIcon, PieChart, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface SemesterAttendanceDTO {
    semester: number;
    totalClasses: number;
    presentClasses: number;
    percentage: number;
}

interface MonthlyAttendanceDTO {
    date: string;
    subjectCode: string;
    present: boolean;
}

export default function StudentAttendancePage() {
    const [stats, setStats] = useState<SemesterAttendanceDTO | null>(null);
    const [monthlyData, setMonthlyData] = useState<MonthlyAttendanceDTO[]>([]);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [profileLoading, setProfileLoading] = useState(true);
    const [calendarLoading, setCalendarLoading] = useState(false);
    const [semester, setSemester] = useState<number | null>(null);
    const [error, setError] = useState("");

    const container = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.08 } }
    };
    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    // Step 1: Fetch profile & semester stats
    useEffect(() => {
        const fetchProfile = async () => {
            setProfileLoading(true);
            try {
                const profileRes = await api.get("/student/profile");
                const sem: number = profileRes.data?.semester ?? 1;
                setSemester(sem);
                const statsRes = await api.get(`/student/semester/${sem}/percentage`);
                setStats(statsRes.data);
            } catch (err) {
                console.error("Failed to fetch attendance profile", err);
                setError("Could not load attendance data. Please make sure you are logged in.");
            } finally {
                setProfileLoading(false);
            }
        };
        fetchProfile();
    }, []);

    // Step 2: Fetch calendar month data once semester is known
    useEffect(() => {
        if (semester === null) return;
        const fetchMonthly = async () => {
            setCalendarLoading(true);
            try {
                const year = currentDate.getFullYear();
                const month = currentDate.getMonth() + 1;
                const res = await api.get(`/student/month-attendance?year=${year}&month=${month}`);
                setMonthlyData(Array.isArray(res.data) ? res.data : []);
            } catch (err) {
                console.error("Failed to fetch monthly data", err);
                setMonthlyData([]);
            } finally {
                setCalendarLoading(false);
            }
        };
        fetchMonthly();
    }, [currentDate, semester]);

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
    const startDayOfWeek = getDay(monthStart);

    const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

    const getDayStatus = (day: Date) => {
        const records = monthlyData.filter(d => {
            try { return isSameDay(new Date(d.date), day); } catch { return false; }
        });
        if (records.length === 0) return "none";
        if (records.every(r => r.present)) return "present";
        if (records.every(r => !r.present)) return "absent";
        return "partial";
    };

    // ---- Loading skeleton ----
    if (profileLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-4 text-muted-foreground">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="font-medium">Loading your attendance data…</p>
            </div>
        );
    }

    // ---- Error state ----
    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
                    <AlertCircle className="h-8 w-8 text-red-500" />
                </div>
                <h2 className="text-xl font-bold text-foreground">Failed to Load</h2>
                <p className="text-muted-foreground text-sm max-w-sm text-center">{error}</p>
                <Button onClick={() => window.location.reload()} variant="outline">Try Again</Button>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-10">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
                        Attendance Overview
                    </h1>
                    <p className="text-muted-foreground mt-2 text-lg">
                        Track your academic presence and performance.
                    </p>
                </div>
                <div className="glass-card px-4 py-2 rounded-full border border-orange-500/20 bg-orange-500/5 text-orange-600 font-medium text-sm flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500" />
                    </span>
                    Live Updates
                </div>
            </div>

            <motion.div variants={container} initial="hidden" animate="show" className="grid gap-6 md:grid-cols-3">
                {/* Overall % */}
                <motion.div variants={item}>
                    <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 hover:border-primary/20 group">
                        <CardContent className="p-6 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground mb-1">Overall Attendance</p>
                                <h3 className="text-4xl font-bold tracking-tight group-hover:text-primary transition-colors">
                                    {stats ? `${stats.percentage.toFixed(1)}%` : "0%"}
                                </h3>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Semester {semester}
                                </p>
                            </div>
                            <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-primary/20 to-orange-100 flex items-center justify-center">
                                <PieChart className="h-8 w-8 text-primary" />
                            </div>
                        </CardContent>
                        {stats && (
                            <div className="h-1.5 w-full bg-secondary overflow-hidden rounded-b-xl">
                                <motion.div
                                    className={cn("h-full", stats.percentage >= 75 ? "bg-primary" : "bg-red-500")}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min(stats.percentage, 100)}%` }}
                                    transition={{ duration: 1, delay: 0.5 }}
                                />
                            </div>
                        )}
                    </Card>
                </motion.div>

                {/* Classes Attended */}
                <motion.div variants={item}>
                    <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all">
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className="p-3 bg-green-500/10 rounded-xl">
                                <CheckCircle2 className="h-8 w-8 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Classes Attended</p>
                                <div className="flex items-baseline gap-2">
                                    <h3 className="text-3xl font-bold">{stats?.presentClasses ?? 0}</h3>
                                    <span className="text-sm text-muted-foreground">/ {stats?.totalClasses ?? 0}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Classes Missed */}
                <motion.div variants={item}>
                    <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all">
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className={cn("p-3 rounded-xl", stats && (stats.totalClasses - stats.presentClasses) > 0 ? "bg-red-500/10" : "bg-green-500/10")}>
                                <XCircle className={cn("h-8 w-8", stats && (stats.totalClasses - stats.presentClasses) > 0 ? "text-red-600" : "text-green-600")} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Classes Missed</p>
                                <div className="flex items-baseline gap-2">
                                    <h3 className="text-3xl font-bold">
                                        {stats ? (stats.totalClasses - stats.presentClasses) : 0}
                                    </h3>
                                    <span className="text-sm text-muted-foreground">sessions</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Attendance Warning */}
                {stats && stats.percentage < 75 && (
                    <motion.div variants={item} className="md:col-span-3">
                        <div className="flex items-start gap-3 p-4 rounded-xl border border-red-200 bg-red-50 text-red-800">
                            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5 text-red-500" />
                            <div>
                                <p className="font-semibold text-sm">Low Attendance Warning</p>
                                <p className="text-xs mt-0.5 opacity-80">
                                    Your attendance is below 75%. You need to attend at least{" "}
                                    <strong>{Math.ceil(0.75 * (stats.totalClasses ?? 0) - (stats.presentClasses ?? 0))}</strong> more classes to reach the required threshold.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Calendar */}
                <motion.div variants={item} className="md:col-span-3">
                    <Card className="border-border shadow-md overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-border/50 bg-muted/20">
                            <div className="flex items-center gap-2">
                                <CalendarIcon className="h-5 w-5 text-muted-foreground" />
                                <CardTitle className="text-lg font-semibold">Monthly Breakdown</CardTitle>
                                {calendarLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground ml-2" />}
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground mr-4">
                                    <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-green-500" /> Present</div>
                                    <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-red-500" /> Absent</div>
                                    <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-yellow-500" /> Partial</div>
                                </div>
                                <div className="flex items-center gap-1 bg-background rounded-md border shadow-sm p-1">
                                    <Button variant="ghost" size="icon" onClick={prevMonth} className="h-7 w-7">
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                    <span className="min-w-[100px] text-center font-medium text-sm">
                                        {format(currentDate, "MMMM yyyy")}
                                    </span>
                                    <Button variant="ghost" size="icon" onClick={nextMonth} className="h-7 w-7">
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6">
                            {/* Day headers */}
                            <div className="grid grid-cols-7 mb-2 text-center">
                                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                    <div key={day} className="text-xs font-semibold text-muted-foreground uppercase tracking-wider py-2">
                                        {day}
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-7 gap-1.5">
                                {/* Offset blanks */}
                                {Array.from({ length: startDayOfWeek }).map((_, i) => (
                                    <div key={`empty-${i}`} className="h-20 md:h-28 rounded-lg" />
                                ))}

                                {daysInMonth.map((day, i) => {
                                    const status = getDayStatus(day);
                                    const isToday = isSameDay(day, new Date());
                                    const dayRecords = monthlyData.filter(d => {
                                        try { return isSameDay(new Date(d.date), day); } catch { return false; }
                                    });

                                    return (
                                        <motion.div
                                            key={day.toISOString()}
                                            initial={{ opacity: 0, scale: 0.92 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: i * 0.008 }}
                                            className={cn(
                                                "relative h-20 md:h-28 rounded-lg border p-2 transition-all duration-200 flex flex-col justify-between group overflow-hidden",
                                                isToday ? "ring-2 ring-primary ring-offset-2 border-primary/50" : "border-border/40 bg-card",
                                                status === 'present' && "bg-green-500/5 border-green-200/60",
                                                status === 'absent' && "bg-red-500/5 border-red-200/60",
                                                status === 'partial' && "bg-yellow-500/5 border-yellow-200/60"
                                            )}
                                        >
                                            <span className={cn(
                                                "text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full",
                                                isToday ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                                            )}>
                                                {format(day, "d")}
                                            </span>

                                            <div className="flex flex-col gap-0.5 overflow-y-auto max-h-[calc(100%-2rem)]">
                                                {dayRecords.slice(0, 3).map((rec, idx) => (
                                                    <div key={idx} className={cn(
                                                        "flex items-center gap-1 px-1.5 py-0.5 rounded-sm text-[9px] sm:text-[10px] truncate font-medium",
                                                        rec.present
                                                            ? "bg-green-100 text-green-700"
                                                            : "bg-red-100 text-red-700"
                                                    )}>
                                                        <div className={cn("w-1 h-1 rounded-full shrink-0", rec.present ? "bg-green-500" : "bg-red-500")} />
                                                        <span className="truncate">{rec.subjectCode}</span>
                                                    </div>
                                                ))}
                                                {dayRecords.length > 3 && (
                                                    <span className="text-[9px] text-muted-foreground pl-1">+{dayRecords.length - 3} more</span>
                                                )}
                                            </div>

                                            {/* Bottom status bar */}
                                            <div className={cn(
                                                "absolute bottom-0 left-0 h-0.5 w-full",
                                                status === 'present' && "bg-green-500",
                                                status === 'absent' && "bg-red-500",
                                                status === 'partial' && "bg-yellow-500"
                                            )} />
                                        </motion.div>
                                    );
                                })}
                            </div>

                            {!calendarLoading && monthlyData.length === 0 && (
                                <div className="text-center py-8 text-muted-foreground text-sm">
                                    <TrendingUp className="h-8 w-8 mx-auto mb-2 opacity-30" />
                                    No attendance records for {format(currentDate, "MMMM yyyy")}.
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            </motion.div>
        </div>
    );
}
