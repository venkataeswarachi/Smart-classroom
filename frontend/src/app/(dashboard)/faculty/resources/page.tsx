"use client";

import { useState } from "react";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea"; // Assuming this exists or I use Input
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Upload, Link as LinkIcon, CheckCircle, BookOpen } from "lucide-react";
import { motion } from "framer-motion";

export default function FacultyResourcesPage() {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const [form, setForm] = useState({
        title: "",
        subjectCode: "",
        url: "",
        description: ""
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            await api.post("/resource/upload", form);
            setMessage({ type: 'success', text: "Resource shared successfully!" });
            setForm({ title: "", subjectCode: "", url: "", description: "" });
        } catch (err) {
            console.error(err);
            setMessage({ type: 'error', text: "Failed to share resource. Please try again." });
        } finally {
            setLoading(false);
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
            className="max-w-3xl mx-auto space-y-8 pb-10"
        >
            <motion.div variants={item} className="flex flex-col gap-2">
                <h1 className="text-4xl font-black tracking-tight text-foreground">
                    Share Resources<span className="text-primary">.</span>
                </h1>
                <p className="text-lg text-muted-foreground">Upload study materials and reference links for students.</p>
            </motion.div>

            <motion.div variants={item}>
                <Card className="border-0 shadow-lg bg-card/60 backdrop-blur-sm ring-1 ring-border/50">
                    <CardHeader className="pb-4 border-b border-border/50">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <Upload className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <CardTitle>Upload Material</CardTitle>
                                <CardDescription>Add a new resource link to the library.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {message && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    className={`p-4 rounded-lg flex items-center gap-3 text-sm font-medium ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-red-500/10 text-red-600 border border-red-500/20'}`}
                                >
                                    <CheckCircle className="h-4 w-4 shrink-0" />
                                    {message.text}
                                </motion.div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label>Resource Title</Label>
                                    <Input
                                        placeholder="e.g. Chapter 4 Notes"
                                        value={form.title}
                                        onChange={e => setForm({ ...form, title: e.target.value })}
                                        required
                                        className="bg-background/50"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Subject Code</Label>
                                    <Input
                                        placeholder="e.g. CS302"
                                        value={form.subjectCode}
                                        onChange={e => setForm({ ...form, subjectCode: e.target.value })}
                                        required
                                        className="bg-background/50 font-mono"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Resource Link (URL)</Label>
                                <div className="relative">
                                    <LinkIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="https://drive.google.com/..."
                                        value={form.url}
                                        onChange={e => setForm({ ...form, url: e.target.value })}
                                        required
                                        className="pl-9 bg-background/50 font-mono text-sm"
                                    />
                                </div>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-bold pl-1">
                                    Supports Drive, Dropbox, YouTube, or external docs
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label>Description</Label>
                                <textarea
                                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    placeholder="Brief details about this resource..."
                                    value={form.description}
                                    onChange={e => setForm({ ...form, description: e.target.value })}
                                />
                            </div>

                            <Button type="submit" className="w-full font-bold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600" disabled={loading}>
                                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                                Share Resource
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </motion.div>
        </motion.div>
    );
}
