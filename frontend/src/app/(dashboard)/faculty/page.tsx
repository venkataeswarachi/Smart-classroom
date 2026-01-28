"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Calendar, Clock, QrCode } from "lucide-react";
import Link from "next/link";

export default function FacultyDashboard() {
    const [todayClasses, setTodayClasses] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await api.get("/faculty/today");
                setTodayClasses(res.data);
            } catch (err) {
                console.error("Error fetching faculty schedule", err);
            }
        };
        fetchData();
    }, []);

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-4xl font-black tracking-tight text-foreground">Faculty Dashboard</h1>
                <p className="text-lg text-muted-foreground">Manage your classes and attendance with ease.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card className="shadow-lg shadow-blue-500/5 hover:shadow-blue-500/10 border-blue-100 transition-all">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-semibold text-muted-foreground">Classes Today</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <Calendar className="h-5 w-5 text-blue-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-foreground">{todayClasses.length}</div>
                        <p className="text-xs font-medium text-blue-600 mt-1">Active sessions</p>
                    </CardContent>
                </Card>

                <Card className="col-span-1 md:col-span-2 bg-gradient-to-r from-primary to-orange-600 border-0 shadow-lg shadow-primary/20 text-white relative overflow-hidden group">
                    <div className="absolute right-0 top-0 h-full w-1/3 bg-white/10 skew-x-12 translate-x-12 group-hover:translate-x-8 transition-transform" />
                    <CardContent className="h-full flex items-center justify-between p-8 relative z-10">
                        <div>
                            <h3 className="font-bold text-2xl mb-2">Start Attendance for Next Class</h3>
                            <p className="text-white/80 mb-6 font-medium">Generate a secure QR code for students to scan.</p>
                            <Link href="/faculty/generate">
                                <Button size="lg" className="bg-white text-primary hover:bg-white/90 shadow-xl border-0 font-bold">
                                    <QrCode className="mr-2 h-5 w-5" />
                                    Generate QR
                                </Button>
                            </Link>
                        </div>
                        <div className="hidden md:block opacity-20 transform scale-150 p-4">
                            <QrCode className="h-32 w-32 text-white" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="shadow-sm border-border/60">
                <CardHeader>
                    <CardTitle className="text-xl">Today's Schedule</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {todayClasses.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10 text-center">
                                <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center mb-4">
                                    <Calendar className="h-7 w-7 text-muted-foreground" />
                                </div>
                                <p className="text-muted-foreground font-medium text-lg">No classes scheduled for today.</p>
                            </div>
                        ) : (
                            todayClasses.map((cls, i) => (
                                <div key={i} className="flex items-center justify-between p-5 border border-border/60 rounded-xl hover:bg-muted/30 transition-all group">
                                    <div className="flex items-center gap-5">
                                        <div className="flex items-center justify-center h-14 w-14 rounded-xl bg-primary/10 text-primary font-bold text-sm border border-primary/20 group-hover:scale-105 transition-transform">
                                            {cls.startTime.substring(0, 2)}
                                        </div>
                                        <div>
                                            <p className="text-lg font-bold text-foreground mb-1">{cls.subjectName}</p>
                                            <p className="text-sm text-muted-foreground font-medium flex items-center gap-2">
                                                <span className="bg-muted px-2 py-0.5 rounded text-xs uppercase tracking-wide">{cls.dept}</span>
                                                <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
                                                <span>Sem {cls.semester}</span>
                                                <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
                                                <span>Sec {cls.section}</span>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="text-right hidden sm:block">
                                            <p className="text-sm font-semibold text-foreground">{cls.startTime} - {cls.endTime}</p>
                                            <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider">{cls.subjectCode}</p>
                                        </div>
                                        <Link
                                            href={`/faculty/attendance?subject=${cls.subjectCode}&date=${new Date().toISOString().split('T')[0]}&start=${cls.startTime}:00`}
                                        >
                                            <Button variant="outline" className="border-primary/30 hover:bg-primary/5 hover:text-primary transition-colors font-semibold">
                                                Monitor
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
