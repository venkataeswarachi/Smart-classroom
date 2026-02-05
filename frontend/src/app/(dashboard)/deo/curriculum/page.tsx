"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Loader2, Plus, Edit, Trash2, Library } from "lucide-react";

export default function DEOCurriculumPage() {
    const [courses, setCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState({
        subjectName: "",
        subjectCode: "",
        credits: 3,
        dept: "CSE",
        semester: 1,
        description: "" // Assuming description exists in model, else ignored
    });

    const fetchCourses = async () => {
        setLoading(true);
        try {
            const res = await api.get("/curriculum/all");
            setCourses(res.data);
        } catch (err) {
            console.error("Failed to fetch curriculum", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCourses();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post("/curriculum/add", formData);
            setOpen(false);
            fetchCourses();
            setFormData({ ...formData, subjectName: "", subjectCode: "" }); // Reset essential
        } catch (err) {
            console.error("Failed to add course", err);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-foreground">Curriculum Management</h1>
                    <p className="text-muted-foreground">Add and manage course syllabus.</p>
                </div>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button className="font-bold shadow-lg shadow-primary/20">
                            <Plus className="mr-2 h-4 w-4" /> Add Course
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Course</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4 py-2">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Subject Code</Label>
                                    <Input placeholder="CS101" value={formData.subjectCode} onChange={e => setFormData({ ...formData, subjectCode: e.target.value })} required />
                                </div>
                                <div className="space-y-2">
                                    <Label>Credits</Label>
                                    <Input type="number" value={formData.credits} onChange={e => setFormData({ ...formData, credits: parseInt(e.target.value) })} required />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Subject Name</Label>
                                <Input placeholder="Introduction to Programming" value={formData.subjectName} onChange={e => setFormData({ ...formData, subjectName: e.target.value })} required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Department</Label>
                                    <Select value={formData.dept} onValueChange={v => setFormData({ ...formData, dept: v })}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="CSE">CSE</SelectItem>
                                            <SelectItem value="ECE">ECE</SelectItem>
                                            <SelectItem value="EEE">EEE</SelectItem>
                                            <SelectItem value="MECH">MECH</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Semester</Label>
                                    <Select value={formData.semester.toString()} onValueChange={v => setFormData({ ...formData, semester: parseInt(v) })}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <SelectItem key={s} value={s.toString()}>Sem {s}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Description (Optional)</Label>
                                <Input placeholder="Brief course overview..." value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                            </div>
                            <Button type="submit" className="w-full mt-4">Save Course</Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card className="border-border">
                <CardHeader>
                    <CardTitle className="text-lg">All Courses</CardTitle>
                    <CardDescription>List of all registered courses across departments.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-muted/50 border-b border-border text-muted-foreground uppercase text-xs">
                                <tr>
                                    <th className="px-4 py-3 font-medium cursor-pointer">Code</th>
                                    <th className="px-4 py-3 font-medium">Course Name</th>
                                    <th className="px-4 py-3 font-medium">Dept</th>
                                    <th className="px-4 py-3 font-medium">Sem</th>
                                    <th className="px-4 py-3 font-medium text-center">Credits</th>
                                    <th className="px-4 py-3 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} className="text-center py-8 text-muted-foreground">Loading...</td>
                                    </tr>
                                ) : courses.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="text-center py-8 text-muted-foreground px-4">
                                            <div className="flex flex-col items-center gap-2">
                                                <Library className="h-8 w-8 opacity-20" />
                                                <p>No courses added yet.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    courses.map((c: any) => (
                                        <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                                            <td className="px-4 py-3 font-mono font-medium">{c.subjectCode}</td>
                                            <td className="px-4 py-3 font-medium text-foreground">{c.subjectName}</td>
                                            <td className="px-4 py-3"><div className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 w-fit px-2 py-0.5 rounded text-xs font-bold">{c.dept}</div></td>
                                            <td className="px-4 py-3">Sem {c.semester}</td>
                                            <td className="px-4 py-3 text-center">{c.credits}</td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8"><Edit className="h-4 w-4 text-muted-foreground hover:text-foreground" /></Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
