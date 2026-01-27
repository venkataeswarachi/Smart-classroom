"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

function AttendanceMonitorContent() {
    const searchParams = useSearchParams();

    const [subjectCode, setSubjectCode] = useState(searchParams.get("subject") || "");
    const [date, setDate] = useState(searchParams.get("date") || new Date().toISOString().split("T")[0]);
    const [startTime, setStartTime] = useState(searchParams.get("start") || "");

    const [students, setStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchAttendance = async () => {
        if (!subjectCode || !date || !startTime) return;
        setLoading(true);
        try {
            const res = await api.get(`/faculty/attendance/monitor?subjectCode=${subjectCode}&date=${date}&startTime=${startTime}`);
            setStudents(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (subjectCode && date && startTime) {
            fetchAttendance();
        }
    }, []);

    const toggleAttendance = async (studentEmail: string, currentStatus: boolean) => {
        await api.post("/faculty/attendance/manual", {
            studentEmail,
            subjectCode,
            date,
            startTime,
            present: !currentStatus
        });
        fetchAttendance();
    };

    const [newEmail, setNewEmail] = useState("");
    const markNewStudent = async () => {
        if (!newEmail) return;
        await api.post("/faculty/attendance/manual", {
            studentEmail: newEmail,
            subjectCode,
            date,
            startTime,
            present: true
        });
        setNewEmail("");
        fetchAttendance();
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Attendance Monitor</h1>
                    <p className="text-gray-500">View and manually update attendance records.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={fetchAttendance} disabled={loading}>
                        Refresh
                    </Button>
                </div>
            </div>

            <Card>
                <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div>
                        <label className="text-sm font-medium mb-1 block">Subject Code</label>
                        <Input value={subjectCode} onChange={e => setSubjectCode(e.target.value)} placeholder="SUB101" />
                    </div>
                    <div>
                        <label className="text-sm font-medium mb-1 block">Date</label>
                        <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
                    </div>
                    <div>
                        <label className="text-sm font-medium mb-1 block">Start Time</label>
                        <Input type="time" step="1" value={startTime} onChange={e => setStartTime(e.target.value)} />
                    </div>
                    <Button onClick={fetchAttendance} disabled={loading}>
                        <Search className="h-4 w-4 mr-2" /> Load
                    </Button>
                </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-3">
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Marked Students ({students.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {students.length === 0 ? (
                                <p className="text-center text-gray-500 py-8">No attendance records found for this slot yet.</p>
                            ) : (
                                students.map((att, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 border rounded-md bg-white">
                                        <div>
                                            <p className="font-medium">{att.studentEmail}</p>
                                            <p className="text-xs text-gray-400">Marked at {att.id} (ID)</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${att.present ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {att.present ? 'PRESENT' : 'ABSENT'}
                                            </span>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => toggleAttendance(att.studentEmail, att.present)}
                                            >
                                                Change
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Manual Entry</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-gray-500">
                            Student not on the list? Add them manually ensuring they are enrolled in this section.
                        </p>
                        <Input
                            placeholder="Student Email"
                            value={newEmail}
                            onChange={e => setNewEmail(e.target.value)}
                        />
                        <Button className="w-full" onClick={markNewStudent} disabled={!newEmail}>
                            Mark Present
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default function FacultyAttendancePage() {
    return (
        <Suspense fallback={<div className="p-8 text-center">Loading monitor...</div>}>
            <AttendanceMonitorContent />
        </Suspense>
    );
}
