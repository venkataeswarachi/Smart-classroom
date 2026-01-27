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
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Faculty Dashboard</h1>
                <p className="text-gray-500">Manage your classes and attendance.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Classes Today</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{todayClasses.length}</div>
                    </CardContent>
                </Card>

                <Card className="col-span-1 md:col-span-2 bg-gradient-to-r from-primary/10 to-transparent border-0">
                    <CardContent className="h-full flex items-center justify-between p-6">
                        <div>
                            <h3 className="font-semibold text-lg text-primary mb-1">Start Attendance for Next Class</h3>
                            <p className="text-sm text-gray-600 mb-4">Generate code for 3rd Year CSE - Section A</p>
                            <Link href="/faculty/generate">
                                <Button>
                                    <QrCode className="mr-2 h-4 w-4" />
                                    Generate QR
                                </Button>
                            </Link>
                        </div>
                        {/* Visual decoration could go here */}
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Today's Schedule</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {todayClasses.length === 0 ? (
                            <p className="text-sm text-gray-500">No classes scheduled for today.</p>
                        ) : (
                            todayClasses.map((cls, i) => (
                                <div key={i} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center justify-center h-10 w-10 rounded-full bg-slate-100 text-slate-600 font-bold text-xs">
                                            {cls.startTime.substring(0, 2)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">{cls.subjectName}</p>
                                            <p className="text-xs text-gray-500">
                                                {cls.dept} - {cls.semester}th Sem - {cls.section}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right hidden sm:block">
                                            <p className="text-sm font-medium">{cls.startTime} - {cls.endTime}</p>
                                            <p className="text-xs text-gray-500 uppercase">{cls.subjectCode}</p>
                                        </div>
                                        <Link
                                            href={`/faculty/attendance?subject=${cls.subjectCode}&date=${new Date().toISOString().split('T')[0]}&start=${cls.startTime}:00`}
                                            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 rounded-md px-3"
                                        >
                                            Monitor
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
