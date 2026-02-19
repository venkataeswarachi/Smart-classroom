"use client";

import { useState, useEffect, Suspense, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Search, RefreshCw, UserPlus, Check, X, ShieldAlert,
    Users, UserCheck, UserX, BarChart3, Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface StudentRosterEntry {
    studentEmail: string;
    studentName: string;
    rollNo: string;
    present: boolean;
}

function AttendanceMonitorContent() {
    const searchParams = useSearchParams();

    const [subjectCode, setSubjectCode] = useState(searchParams.get("subject") || "");
    const [date, setDate] = useState(searchParams.get("date") || new Date().toISOString().split("T")[0]);
    const [startTime, setStartTime] = useState(searchParams.get("start") || "");

    const [roster, setRoster] = useState<StudentRosterEntry[]>([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const [autoRefresh, setAutoRefresh] = useState(false);
    const [searchFilter, setSearchFilter] = useState("");
    const [newEmail, setNewEmail] = useState("");
    const [manualLoading, setManualLoading] = useState(false);
    const [todayClasses, setTodayClasses] = useState<any[]>([]);
    const [selectedClass, setSelectedClass] = useState<string | null>(null);

    // Normalize time to HH:mm:ss
    const normalizeTime = (time: string) => {
        if (!time) return time;
        const parts = time.split(":");
        if (parts.length === 2) return time + ":00";
        return time;
    };

    // Load today's classes for quick selection
    useEffect(() => {
        api.get("/faculty/today")
            .then(res => setTodayClasses(res.data?.filter((c: any) => !c.break) || []))
            .catch(() => { });
    }, []);

    // Fetch roster from new endpoint
    const fetchRoster = useCallback(async (silent = false) => {
        if (!subjectCode || !date || !startTime) return;
        if (!silent) setLoading(true);
        try {
            const res = await api.get(
                `/faculty/attendance/class-roster?subjectCode=${encodeURIComponent(subjectCode)}&date=${date}&startTime=${normalizeTime(startTime)}`
            );
            setRoster(Array.isArray(res.data) ? res.data : []);
            setSearched(true);
        } catch (err) {
            console.error("Failed to fetch class roster", err);
        } finally {
            if (!silent) setLoading(false);
        }
    }, [subjectCode, date, startTime]);

    // Auto-load when URL params are present
    useEffect(() => {
        if (subjectCode && date && startTime) fetchRoster();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Live sync polling
    useEffect(() => {
        if (!autoRefresh) return;
        const interval = setInterval(() => fetchRoster(true), 5000);
        return () => clearInterval(interval);
    }, [autoRefresh, fetchRoster]);

    // Toggle a student's attendance (optimistic)
    const toggleAttendance = async (email: string, currentStatus: boolean) => {
        setRoster(prev => prev.map(s => s.studentEmail === email ? { ...s, present: !currentStatus } : s));
        try {
            await api.post("/faculty/attendance/manual", {
                studentEmail: email,
                subjectCode,
                date,
                startTime: normalizeTime(startTime),
                present: !currentStatus
            });
        } catch {
            // Revert on failure
            setRoster(prev => prev.map(s => s.studentEmail === email ? { ...s, present: currentStatus } : s));
        }
    };

    // Mark a student manually by email
    const markManually = async () => {
        if (!newEmail.trim()) return;
        setManualLoading(true);
        try {
            await api.post("/faculty/attendance/manual", {
                studentEmail: newEmail.trim(),
                subjectCode,
                date,
                startTime: normalizeTime(startTime),
                present: true
            });
            setNewEmail("");
            await fetchRoster(true);
        } catch {
            /* ignore */
        } finally {
            setManualLoading(false);
        }
    };

    // Filtered roster for search
    const filteredRoster = roster.filter(s =>
        !searchFilter ||
        s.studentName?.toLowerCase().includes(searchFilter.toLowerCase()) ||
        s.rollNo?.toLowerCase().includes(searchFilter.toLowerCase()) ||
        s.studentEmail?.toLowerCase().includes(searchFilter.toLowerCase())
    );

    // Stats
    const totalEnrolled = roster.length;
    const presentCount = roster.filter(s => s.present).length;
    const absentCount = totalEnrolled - presentCount;
    const percentage = totalEnrolled > 0 ? Math.round((presentCount / totalEnrolled) * 100) : 0;

    return (
        <div className="space-y-6 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Attendance Monitor</h1>
                    <p className="text-muted-foreground mt-1">
                        View and manage full class roster attendance in real time.
                    </p>
                </div>
                <div className="flex items-center gap-2 bg-card border border-border p-1 rounded-lg shadow-sm">
                    <Button
                        variant="ghost" size="sm"
                        onClick={() => setAutoRefresh(!autoRefresh)}
                        className={cn("gap-2 text-xs font-medium transition-colors", autoRefresh && "bg-emerald-100 text-emerald-700 hover:bg-emerald-200")}
                    >
                        <RefreshCw className={cn("h-3.5 w-3.5", autoRefresh && "animate-spin")} />
                        {autoRefresh ? "Live: ON" : "Live: OFF"}
                    </Button>
                    <div className="w-px h-4 bg-border mx-1" />
                    <Button variant="ghost" size="sm" onClick={() => fetchRoster()} disabled={loading || !subjectCode || !startTime}>
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Session Controls + Stats */}
            <div className="grid gap-6 md:grid-cols-12">
                {/* Controls */}
                <Card className="md:col-span-8 shadow-md border-border/60">
                    <CardHeader className="pb-3 border-b border-border/50 bg-muted/20">
                        <CardTitle className="text-base font-semibold">Select Class Session</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-4">
                        {/* Quick select */}
                        {todayClasses.length > 0 && (
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Today's Classes</label>
                                <div className="flex flex-wrap gap-2">
                                    {todayClasses.map((cls: any, idx: number) => {
                                        const key = `${cls.subjectCode}-${cls.startTime}`;
                                        const isActive = selectedClass === key;
                                        return (
                                            <button
                                                key={idx}
                                                onClick={() => {
                                                    setSubjectCode(cls.subjectCode);
                                                    setDate(new Date().toISOString().split("T")[0]);
                                                    setStartTime(normalizeTime(cls.startTime));
                                                    setSelectedClass(key);
                                                }}
                                                className={cn(
                                                    "text-xs px-3 py-1.5 rounded-full border transition-all font-medium",
                                                    isActive
                                                        ? "bg-primary text-primary-foreground border-primary"
                                                        : "bg-muted/50 text-foreground border-border hover:bg-muted hover:border-primary/30"
                                                )}
                                            >
                                                {cls.subjectName}
                                                <span className="ml-1.5 opacity-60">
                                                    {cls.startTime?.substring(0, 5)} · {cls.dept}-{cls.section}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Subject Code</label>
                                <Input value={subjectCode} onChange={e => setSubjectCode(e.target.value)} placeholder="e.g. CS101" className="h-9" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date</label>
                                <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="h-9" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Start Time</label>
                                <div className="flex gap-2">
                                    <Input type="time" step="1" value={startTime} onChange={e => setStartTime(e.target.value)} className="h-9" />
                                    <Button size="sm" onClick={() => fetchRoster()} disabled={loading || !subjectCode || !startTime} className="px-3 shrink-0">
                                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Stats */}
                <div className="md:col-span-4 grid grid-cols-2 md:grid-cols-1 gap-3">
                    {[
                        { label: "Enrolled", value: totalEnrolled, icon: Users, color: "text-indigo-600 bg-indigo-50" },
                        { label: "Present", value: presentCount, icon: UserCheck, color: "text-green-600 bg-green-50" },
                        { label: "Absent", value: absentCount, icon: UserX, color: "text-red-600 bg-red-50" },
                        { label: "Rate", value: `${percentage}%`, icon: BarChart3, color: percentage >= 75 ? "text-emerald-600 bg-emerald-50" : "text-amber-600 bg-amber-50" },
                    ].map(stat => (
                        <Card key={stat.label} className="shadow-sm border-border/60">
                            <CardContent className="p-4 flex items-center gap-3">
                                <div className={cn("p-2 rounded-lg", stat.color)}>
                                    <stat.icon className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
                                    <p className="text-xl font-bold tabular-nums">{searched ? stat.value : "—"}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Main roster + sidebar */}
            <div className="grid gap-6 md:grid-cols-12">
                {/* Student List */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="md:col-span-8">
                    <Card className="border-border/60 shadow-md">
                        <CardHeader className="flex flex-row items-center justify-between pb-3 gap-4 border-b border-border/50">
                            <div>
                                <CardTitle className="text-base font-semibold">Class Roster</CardTitle>
                                {searched && (
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        {presentCount} of {totalEnrolled} students present
                                    </p>
                                )}
                            </div>
                            {searched && totalEnrolled > 0 && (
                                <Input
                                    placeholder="Search by name / roll / email…"
                                    value={searchFilter}
                                    onChange={e => setSearchFilter(e.target.value)}
                                    className="h-8 w-48 text-xs"
                                />
                            )}
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-border/50 max-h-[520px] overflow-y-auto">
                                {loading ? (
                                    <div className="flex items-center justify-center py-16 gap-3 text-muted-foreground">
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        <span className="text-sm">Loading class roster…</span>
                                    </div>
                                ) : !searched ? (
                                    <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
                                        <div className="bg-muted rounded-full p-4 mb-3">
                                            <Users className="h-6 w-6 opacity-40" />
                                        </div>
                                        <p className="font-medium">Select a class to load students</p>
                                        <p className="text-xs mt-1 opacity-70">Pick from today's classes above or enter details manually.</p>
                                    </div>
                                ) : filteredRoster.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
                                        <div className="bg-muted rounded-full p-4 mb-3">
                                            <Search className="h-6 w-6 opacity-40" />
                                        </div>
                                        <p className="font-medium">No students found</p>
                                        <p className="text-xs mt-1 opacity-70">No students are enrolled in this class yet.</p>
                                    </div>
                                ) : (
                                    <AnimatePresence>
                                        {filteredRoster.map((student, i) => (
                                            <motion.div
                                                key={student.studentEmail}
                                                initial={{ opacity: 0, x: -8 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, height: 0 }}
                                                transition={{ delay: i * 0.02 }}
                                                className={cn(
                                                    "flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors",
                                                    student.present ? "bg-green-50/40" : "bg-red-50/30"
                                                )}
                                            >
                                                {/* Avatar + Info */}
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className={cn(
                                                        "h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ring-2 ring-offset-1 ring-offset-background",
                                                        student.present
                                                            ? "bg-green-100 text-green-700 ring-green-400/30"
                                                            : "bg-red-100 text-red-700 ring-red-400/30"
                                                    )}>
                                                        {(student.studentName || student.studentEmail).charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-semibold text-sm text-foreground truncate">
                                                            {student.studentName || student.studentEmail}
                                                        </p>
                                                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                                            {student.rollNo && (
                                                                <span className="text-[10px] font-mono bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                                                                    {student.rollNo}
                                                                </span>
                                                            )}
                                                            <span className="text-[10px] text-muted-foreground truncate">{student.studentEmail}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Status + Toggle */}
                                                <div className="flex items-center gap-2 shrink-0 ml-2">
                                                    <Badge
                                                        variant="outline"
                                                        className={cn(
                                                            "text-[10px] font-bold uppercase tracking-wide h-5 px-2",
                                                            student.present
                                                                ? "border-green-200 bg-green-100 text-green-700"
                                                                : "border-red-200 bg-red-100 text-red-700"
                                                        )}
                                                    >
                                                        {student.present ? "Present" : "Absent"}
                                                    </Badge>
                                                    <Button
                                                        size="sm" variant="ghost"
                                                        className={cn(
                                                            "h-8 w-8 p-0 rounded-full transition-colors",
                                                            student.present
                                                                ? "hover:bg-red-100 hover:text-red-600"
                                                                : "hover:bg-green-100 hover:text-green-600"
                                                        )}
                                                        onClick={() => toggleAttendance(student.studentEmail, student.present)}
                                                        title={student.present ? "Mark Absent" : "Mark Present"}
                                                    >
                                                        {student.present ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                                                    </Button>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Manual Entry Sidebar */}
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }} className="md:col-span-4 space-y-4">
                    {/* Attendance Summary Ring */}
                    {searched && totalEnrolled > 0 && (
                        <Card className="bg-gradient-to-br from-indigo-50 to-white border-indigo-100 shadow-md">
                            <CardContent className="p-5 flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Attendance Rate</p>
                                    <motion.p
                                        key={percentage}
                                        initial={{ scale: 0.6, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        className={cn("text-4xl font-black", percentage >= 75 ? "text-indigo-600" : "text-red-500")}
                                    >
                                        {percentage}%
                                    </motion.p>
                                    <p className="text-xs text-muted-foreground">
                                        <span className="text-green-600 font-semibold">{presentCount}</span> present ·{" "}
                                        <span className="text-red-500 font-semibold">{absentCount}</span> absent
                                    </p>
                                </div>
                                <div className="relative h-20 w-20">
                                    <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                                        <path className="text-muted/20" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                                        <motion.path
                                            className={percentage >= 75 ? "text-indigo-600" : "text-red-500"}
                                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                            fill="none" stroke="currentColor" strokeWidth="4"
                                            strokeDasharray={`${percentage}, 100`}
                                            initial={{ pathLength: 0 }}
                                            animate={{ pathLength: 1 }}
                                            transition={{ duration: 1 }}
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <span className="text-[9px] font-bold text-foreground text-center leading-tight">
                                            {presentCount}/{totalEnrolled}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Manual Entry */}
                    <Card className="border-border/60 shadow-md">
                        <CardHeader className="pb-3 bg-muted/20 border-b border-border/50">
                            <CardTitle className="text-base font-semibold flex items-center gap-2">
                                <UserPlus className="h-4 w-4" />
                                Manual Entry
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-4">
                            <div className="p-3 bg-amber-50/50 border border-amber-100/50 rounded-lg flex gap-3 text-sm text-amber-800">
                                <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
                                <p className="text-xs leading-relaxed">
                                    Only add students who are physically present but unable to scan due to technical issues.
                                </p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Student Email</label>
                                <Input
                                    placeholder="student@college.edu"
                                    value={newEmail}
                                    onChange={e => setNewEmail(e.target.value)}
                                    onKeyDown={e => e.key === "Enter" && markManually()}
                                />
                            </div>
                            <Button
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20"
                                onClick={markManually}
                                disabled={!newEmail.trim() || manualLoading || !subjectCode || !startTime}
                            >
                                {manualLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <UserPlus className="h-4 w-4 mr-2" />}
                                Mark Present
                            </Button>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}

export default function FacultyAttendancePage() {
    return (
        <Suspense fallback={
            <div className="flex h-[50vh] items-center justify-center gap-3 text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin" />
                Loading…
            </div>
        }>
            <AttendanceMonitorContent />
        </Suspense>
    );
}
