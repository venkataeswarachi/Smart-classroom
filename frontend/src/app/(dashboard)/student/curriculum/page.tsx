"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Book, Code, Calculator, Beaker, FileText, Layers, Loader2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function StudentCurriculumPage() {
    const [curriculum, setCurriculum] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [profile, setProfile] = useState<any>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Get Profile to know Dept & Semester
                const profileRes = await api.get("/student/profile");
                setProfile(profileRes.data);

                // 2. Get Curriculum
                const res = await api.get(`/curriculum/student/view?dept=${profileRes.data.dept}&semester=${profileRes.data.semester}`);
                setCurriculum(res.data);
            } catch (err) {
                console.error("Failed to fetch curriculum", err);
                setError("Could not load curriculum details.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Helper for icons based on subject name
    const getSubjectIcon = (name: string) => {
        const n = name.toLowerCase();
        if (n.includes("math")) return Calculator;
        if (n.includes("data") || n.includes("programming") || n.includes("code")) return Code;
        if (n.includes("chemistry") || n.includes("physics")) return Beaker;
        if (n.includes("lab")) return FileText;
        return Book;
    };

    const container = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const item = {
        hidden: { opacity: 0, y: 15 },
        show: { opacity: 1, y: 0 }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin mb-4 text-primary" />
                <p>Loading your curriculum...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-destructive">
                <AlertCircle className="h-10 w-10 mb-4" />
                <p className="font-semibold">{error}</p>
            </div>
        );
    }

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-8 pb-10"
        >
            <motion.div variants={item} className="flex flex-col gap-2">
                <h1 className="text-4xl font-black tracking-tight text-foreground">
                    Curriculum<span className="text-primary">.</span>
                </h1>
                <p className="text-lg text-muted-foreground">
                    Overview of courses for {profile?.dept} - Semester {profile?.semester}
                </p>
            </motion.div>

            <motion.div variants={item} className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {curriculum.length === 0 ? (
                    <div className="col-span-full text-center py-12 bg-muted/20 rounded-xl border border-dashed border-border">
                        <Layers className="h-10 w-10 mx-auto text-muted-foreground mb-3 opacity-50" />
                        <h3 className="text-lg font-semibold">No Curriculum Found</h3>
                        <p className="text-muted-foreground">Ask your department admin to upload the syllabus.</p>
                    </div>
                ) : (
                    curriculum.map((subject, i) => {
                        const Icon = getSubjectIcon(subject.subjectName);
                        return (
                            <Card key={i} className="glass-card hover:shadow-lg hover:border-primary/30 transition-all duration-300 group">
                                <CardHeader className="relative pb-2">
                                    <div className="absolute top-4 right-4 h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                        <Icon className="h-5 w-5 text-primary" />
                                    </div>
                                    <Badge variant="outline" className="w-fit mb-2 font-mono text-xs border-primary/20 text-primary bg-primary/5">
                                        {subject.subjectCode}
                                    </Badge>
                                    <CardTitle className="text-xl leading-tight group-hover:text-primary transition-colors">
                                        {subject.subjectName}
                                    </CardTitle>
                                    <CardDescription>{subject.type || "Core Course"}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4 mt-2">
                                        <div className="flex items-center justify-between text-sm border-b border-border/50 pb-2">
                                            <span className="text-muted-foreground font-medium">Credits</span>
                                            <span className="font-bold text-foreground">{subject.credits || 3}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm border-b border-border/50 pb-2">
                                            <span className="text-muted-foreground font-medium">Lectures</span>
                                            <span className="font-bold text-foreground">{subject.lectureHours || 40} hrs</span>
                                        </div>
                                        <div className="pt-2">
                                            <p className="text-xs text-muted-foreground line-clamp-3">
                                                {subject.description || "Comprehensive study of fundamental concepts and practical applications required for the semester."}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })
                )}
            </motion.div>
        </motion.div>
    );
}
