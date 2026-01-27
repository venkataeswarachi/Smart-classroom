"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Loader2, CheckCircle, Upload, Plus, Pencil } from "lucide-react";

const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];

export default function DEOTimetablePage() {
    const [step, setStep] = useState<"config" | "editor">("config");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [facultyList, setFacultyList] = useState<any[]>([]);

    // Configuration State
    const [config, setConfig] = useState({
        dept: "CSE",
        section: "A",
        year: 2,
        semester: 3,
        collegeStartTime: "08:30",
        periodDurationMinutes: 50,
        morningBreakAfter: 2,
        morningBreakMinutes: 10,
        lunchBreakAfter: 4,
        lunchBreakMinutes: 60
    });

    // Grid State: map of Day -> PeriodIndex -> Slot Data
    // We initialize empty 7 periods (1-7) for 6 days
    const [gridData, setGridData] = useState<Record<string, Record<number, any>>>({
        "MONDAY": {}, "TUESDAY": {}, "WEDNESDAY": {}, "THURSDAY": {}, "FRIDAY": {}, "SATURDAY": {}
    });

    // Editor Modal State
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingCell, setEditingCell] = useState<{ day: string, period: number } | null>(null);
    const [cellForm, setCellForm] = useState({
        subjectName: "",
        subjectCode: "",
        facultyEmail: ""
    });

    useEffect(() => {
        // Fetch Faculty list for editor
        const fetchFaculty = async () => {
            try {
                const res = await api.get("/deo/faculty-list");
                setFacultyList(res.data);
            } catch (e) {
                console.error("Failed to fetch faculty", e);
            }
        };
        fetchFaculty();
    }, []);

    const handleCreateGrid = (e: React.FormEvent) => {
        e.preventDefault();
        setStep("editor");
    };

    const openEditModal = (day: string, period: number) => {
        const existing = gridData[day]?.[period] || {};
        setEditingCell({ day, period });
        setCellForm({
            subjectName: existing.subjectName || "",
            subjectCode: existing.subjectCode || "",
            facultyEmail: existing.facultyEmail || ""
        });
        setIsEditOpen(true);
    };

    const saveCell = () => {
        if (!editingCell) return;
        setGridData(prev => ({
            ...prev,
            [editingCell.day]: {
                ...prev[editingCell.day],
                [editingCell.period]: { ...cellForm }
            }
        }));
        setIsEditOpen(false);
    };

    const handlePublish = async () => {
        setLoading(true);
        setMessage(null);

        // Transform frontend gridData to Backend DTO Structure
        // Backend expects: Map<String, DayGridDTO> where DayGridDTO has periods map
        const daysPayload: any = {};

        DAYS.forEach(day => {
            const periodsData: any = {};
            // Loop 1 to 7
            for (let p = 1; p <= 7; p++) {
                const cell = gridData[day]?.[p];
                if (cell && cell.subjectName) {
                    periodsData[p] = cell; // Cell matches PeriodCellDTO: subjectName, subjectCode, facultyEmail
                }
            }
            daysPayload[day] = { periods: periodsData };
        });

        const payload = {
            ...config,
            days: daysPayload
        };

        try {
            await api.post("/deo/post-timetable", payload);
            setMessage({ type: 'success', text: "Timetable Published Successfully!" });
            // Optionally redirect or reset?
            setTimeout(() => setStep("config"), 2000);
        } catch (err) {
            setMessage({ type: 'error', text: "Failed to publish timetable." });
        } finally {
            setLoading(false);
        }
    };

    if (step === "config") {
        return (
            <div className="max-w-3xl mx-auto space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Create Timetable</h1>
                    <p className="text-muted-foreground">Step 1: Define academic configuration and timing.</p>
                </div>
                <Card className="border-border bg-card">
                    <CardHeader>
                        <CardTitle>Configuration</CardTitle>
                        <CardDescription>Setup the structure for {config.dept} - {config.section}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleCreateGrid} className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2"><Label>Department</Label><Input value={config.dept} onChange={e => setConfig({ ...config, dept: e.target.value })} /></div>
                                <div className="space-y-2"><Label>Section</Label><Input value={config.section} onChange={e => setConfig({ ...config, section: e.target.value })} /></div>
                                <div className="space-y-2"><Label>Semester</Label><Input type="number" value={config.semester} onChange={e => setConfig({ ...config, semester: parseInt(e.target.value) })} /></div>
                                <div className="space-y-2"><Label>Year</Label><Input type="number" value={config.year} onChange={e => setConfig({ ...config, year: parseInt(e.target.value) })} /></div>
                            </div>
                            <div className="border-t border-border pt-4">
                                <h3 className="font-semibold mb-4">Timing & Breaks</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2"><Label>College Start Time</Label><Input type="time" value={config.collegeStartTime} onChange={e => setConfig({ ...config, collegeStartTime: e.target.value })} /></div>
                                    <div className="space-y-2"><Label>Period Duration (min)</Label><Input type="number" value={config.periodDurationMinutes} onChange={e => setConfig({ ...config, periodDurationMinutes: parseInt(e.target.value) })} /></div>
                                    <div className="space-y-2"><Label>Morning Break After (Period)</Label><Input type="number" value={config.morningBreakAfter} onChange={e => setConfig({ ...config, morningBreakAfter: parseInt(e.target.value) })} /></div>
                                    <div className="space-y-2"><Label>Lunch Break After (Period)</Label><Input type="number" value={config.lunchBreakAfter} onChange={e => setConfig({ ...config, lunchBreakAfter: parseInt(e.target.value) })} /></div>
                                </div>
                            </div>
                            <Button type="submit" className="w-full">Next: Edit Schedule</Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // EDITOR VIEW
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Edit Schedule</h1>
                    <p className="text-muted-foreground">{config.dept} - {config.section} (Sem {config.semester})</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setStep("config")}>Back to Config</Button>
                    <Button onClick={handlePublish} disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Publish Timetable
                    </Button>
                </div>
            </div>

            {message && (
                <div className={`p-4 rounded-md flex items-center gap-2 ${message.type === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                    <CheckCircle className="h-4 w-4" />
                    {message.text}
                </div>
            )}

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-secondary/50 text-left border-b border-border">
                            <th className="p-4 font-medium w-32">Day</th>
                            {[1, 2, 3, 4, 5, 6, 7].map(p => {
                                const isBreak = p === config.morningBreakAfter + 1 || p === config.lunchBreakAfter + 1; // Visual hint? Actually break adds extra time, but we index by period.
                                // NOTE: Backend logic inserts break *after* the period index. So Period 1..2 (Break) 3..4 (Lunch)
                                return (
                                    <th key={p} className="p-4 font-medium min-w-[140px]">
                                        Period {p}
                                        {p === config.morningBreakAfter && <span className="block text-[10px] text-muted-foreground text-center bg-secondary rounded mt-1">Break After This</span>}
                                        {p === config.lunchBreakAfter && <span className="block text-[10px] text-muted-foreground text-center bg-secondary rounded mt-1">Lunch After This</span>}
                                    </th>
                                );
                            })}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {DAYS.map(day => (
                            <tr key={day} className="hover:bg-muted/30">
                                <td className="p-4 font-semibold">{day.substring(0, 3)}</td>
                                {[1, 2, 3, 4, 5, 6, 7].map(period => {
                                    const cell = gridData[day]?.[period];
                                    return (
                                        <td key={period} className="p-2 border-l border-border first:border-0 relative group">
                                            <div
                                                onClick={() => openEditModal(day, period)}
                                                className={`min-h-[80px] p-2 rounded-md cursor-pointer transition-all hover:ring-2 hover:ring-primary/20 ${cell?.subjectName ? "bg-primary/10 border border-primary/20" : "bg-secondary/20 border border-dashed border-border hover:bg-secondary/40"}`}
                                            >
                                                {cell?.subjectName ? (
                                                    <div className="text-xs space-y-1">
                                                        <div className="font-semibold truncate" title={cell.subjectName}>{cell.subjectName}</div>
                                                        <div className="text-primary truncate">{cell.subjectCode}</div>
                                                        <div className="text-muted-foreground truncate italic">{cell.facultyEmail?.split('@')[0]}</div>
                                                    </div>
                                                ) : (
                                                    <div className="h-full flex items-center justify-center text-muted-foreground/30 group-hover:text-primary">
                                                        <Plus className="h-6 w-6" />
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Edit Slot Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Slot: {editingCell?.day} - Period {editingCell?.period}</DialogTitle>
                        <DialogDescription>Assign a subject and faculty to this period.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Subject Name</Label>
                            <Input placeholder="e.g. Data Structures" value={cellForm.subjectName} onChange={e => setCellForm({ ...cellForm, subjectName: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label>Subject Code</Label>
                            <Input placeholder="e.g. CS301" value={cellForm.subjectCode} onChange={e => setCellForm({ ...cellForm, subjectCode: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label>Faculty</Label>
                            <Select value={cellForm.facultyEmail} onValueChange={(val) => setCellForm({ ...cellForm, facultyEmail: val })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Faculty" />
                                </SelectTrigger>
                                <SelectContent>
                                    {facultyList.length > 0 ? facultyList.map((f: any) => (
                                        <SelectItem key={f.email} value={f.email}>{f.name} ({f.email})</SelectItem>
                                    )) : (
                                        <SelectItem value="manual">No Faculty Found (Type manually)</SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                            {/* Fallback Input if Select is empty or custom needed? 
                                For now, if list empty, user is stuck unless we allow custom.
                                Let's add a condition if list is empty, show input.
                            */}
                            {facultyList.length === 0 && (
                                <Input
                                    placeholder="Or type faculty email manually"
                                    value={cellForm.facultyEmail}
                                    onChange={e => setCellForm({ ...cellForm, facultyEmail: e.target.value })}
                                    className="mt-2"
                                />
                            )}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
                        <Button onClick={saveCell}>Save Slot</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
