"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Folder, FileText, Download, ArrowLeft } from "lucide-react";

export default function StudentResourcesPage() {
    const [subjects, setSubjects] = useState<string[]>([]);
    const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
    const [resources, setResources] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // 1. Fetch Subjects (derived from timetable for now)
    useEffect(() => {
        const fetchSubjects = async () => {
            try {
                // Ideally backend provides "my-subjects", but we use timetable unique subjects
                const res = await api.get("/student/timetable");
                const unique = Array.from(new Set(res.data.map((t: any) => t.subjectCode).filter(Boolean))) as string[];
                setSubjects(unique);
            } catch (err) {
                console.error(err);
            }
        };
        fetchSubjects();
    }, []);

    // 2. Fetch Resources when subject selected
    useEffect(() => {
        if (!selectedSubject) return;
        const fetchResources = async () => {
            setLoading(true);
            try {
                const res = await api.get(`/resource/subject/${selectedSubject}`);
                setResources(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchResources();
    }, [selectedSubject]);

    if (selectedSubject) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm" onClick={() => setSelectedSubject(null)}>
                        <ArrowLeft className="h-4 w-4 mr-2" /> Back
                    </Button>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">{selectedSubject} Resources</h1>
                </div>

                {loading ? (
                    <div className="text-muted-foreground">Loading resources...</div>
                ) : resources.length === 0 ? (
                    <div className="p-12 text-center border bg-card rounded-lg text-muted-foreground">
                        No resources uploaded for this subject yet.
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {resources.map((res: any) => (
                            <Card key={res.id} className="hover:border-primary transition-colors cursor-pointer bg-card" onClick={() => window.open(res.url, '_blank')}>
                                <CardContent className="pt-6 flex items-start gap-4">
                                    <div className="p-2 bg-primary/10 rounded-lg">
                                        <FileText className="h-6 w-6 text-primary" />
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                        <h3 className="font-semibold truncate text-foreground">{res.title}</h3>
                                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{res.description || "No description"}</p>
                                    </div>
                                    <Download className="h-4 w-4 text-muted-foreground" />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Course Material</h1>
            <p className="text-muted-foreground">Select a subject to view available learning resources.</p>

            {subjects.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground">No subjects found in your schedule.</div>
            ) : (
                <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
                    {subjects.map((sub) => (
                        <Card key={sub} className="hover:bg-secondary/50 transition-colors cursor-pointer bg-card" onClick={() => setSelectedSubject(sub)}>
                            <CardContent className="flex flex-col items-center justify-center p-8 gap-4">
                                <Folder className="h-12 w-12 text-primary/80" />
                                <span className="font-semibold text-lg text-foreground">{sub}</span>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
