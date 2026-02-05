"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Loader2, Plus, Edit, Trash2, Library, BookOpen, Layers } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

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
        description: ""
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
            setFormData({ ...formData, subjectName: "", subjectCode: "" });
        } catch (err) {
            console.error("Failed to add course", err);
        }
    };

    const container = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const item = {
        hidden: { opacity: 0, y: 15 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-8 pb-10"
        >
            <motion.div variants={item} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex flex-col gap-2">
                    <h1 className="text-4xl font-black tracking-tight text-foreground">
                        Curriculum<span className="text-primary">.</span>
                    </h1>
                    <p className="text-lg text-muted-foreground">Manage academic syllabus and course requirements.</p>
                </div>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button className="font-bold shadow-lg shadow-primary/20 transition-all hover:scale-105">
                            <Plus className="mr-2 h-4 w-4" /> Add Course
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>Add New Course</DialogTitle>
                            <DialogDescription>Define a new subject for the curriculum.</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Subject Code</Label>
                                    <Input placeholder="CS101" value={formData.subjectCode} onChange={e => setFormData({ ...formData, subjectCode: e.target.value })} required className="font-mono bg-muted/50" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Credits</Label>
                                    <Input type="number" value={formData.credits} onChange={e => setFormData({ ...formData, credits: parseInt(e.target.value) })} required className="bg-muted/50" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Subject Name</Label>
                                <Input placeholder="Introduction to Programming" value={formData.subjectName} onChange={e => setFormData({ ...formData, subjectName: e.target.value })} required className="bg-muted/50" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Department</Label>
                                    <Select value={formData.dept} onValueChange={v => setFormData({ ...formData, dept: v })}>
                                        <SelectTrigger className="bg-muted/50"><SelectValue /></SelectTrigger>
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
                                        <SelectTrigger className="bg-muted/50"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <SelectItem key={s} value={s.toString()}>Sem {s}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <Button type="submit" className="w-full font-bold">Save Course</Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </motion.div>

            <motion.div variants={item}>
                <Card className="border-0 shadow-xl bg-card/50 backdrop-blur-sm ring-1 ring-black/5">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <BookOpen className="h-5 w-5 text-primary" />
                            All Courses
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-muted/30 text-muted-foreground uppercase text-[10px] tracking-wider font-bold">
                                    <tr>
                                        <th className="px-6 py-4">Code</th>
                                        <th className="px-6 py-4">Course Name</th>
                                        <th className="px-6 py-4">Dept</th>
                                        <th className="px-6 py-4">Sem</th>
                                        <th className="px-6 py-4 text-center">Credits</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/40">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={6} className="text-center py-12 text-muted-foreground animate-pulse">Loading curriculum data...</td>
                                        </tr>
                                    ) : courses.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="text-center py-16 text-muted-foreground px-4">
                                                <div className="flex flex-col items-center gap-3 opacity-60">
                                                    <Layers className="h-10 w-10 text-muted-foreground" />
                                                    <p>No courses found in the catalogue.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        courses.map((c: any) => (
                                            <tr key={c.id} className="hover:bg-muted/40 transition-colors group">
                                                <td className="px-6 py-4 font-mono font-medium text-primary">{c.subjectCode}</td>
                                                <td className="px-6 py-4 font-medium text-foreground">{c.subjectName}</td>
                                                <td className="px-6 py-4"><span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-700">{c.dept}</span></td>
                                                <td className="px-6 py-4 text-muted-foreground">Semester {c.semester}</td>
                                                <td className="px-6 py-4 text-center font-mono font-bold text-foreground/80">{c.credits}</td>
                                                <td className="px-6 py-4 text-right">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </motion.div>
    );
}
