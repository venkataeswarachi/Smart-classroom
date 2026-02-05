"use client";

import { useState } from "react";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Search, ExternalLink, FileText, BookOpen, Layers } from "lucide-react";
import { motion } from "framer-motion";

export default function StudentResourcesPage() {
    const [loading, setLoading] = useState(false);
    const [searchCode, setSearchCode] = useState("");
    const [resources, setResources] = useState<any[]>([]);
    const [searched, setSearched] = useState(false);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchCode.trim()) return;

        setLoading(true);
        setSearched(true);
        try {
            const res = await api.get(`/resource/subject/${searchCode.trim()}`);
            setResources(res.data);
        } catch (err) {
            console.error(err);
            setResources([]);
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
            className="max-w-5xl mx-auto space-y-8 pb-10"
        >
            <motion.div variants={item} className="flex flex-col gap-2">
                <h1 className="text-4xl font-black tracking-tight text-foreground">
                    Learning Resources<span className="text-primary">.</span>
                </h1>
                <p className="text-lg text-muted-foreground">Access study materials shared by your faculty.</p>
            </motion.div>

            <motion.div variants={item}>
                <Card className="border-0 shadow-md bg-white">
                    <CardContent className="p-6">
                        <form onSubmit={handleSearch} className="flex gap-4 items-end">
                            <div className="flex-1 space-y-2">
                                <Label>Subject Code</Label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Enter Subject Code (e.g. CS302)"
                                        value={searchCode}
                                        onChange={e => setSearchCode(e.target.value)}
                                        className="pl-9 font-mono uppercase"
                                    />
                                </div>
                            </div>
                            <Button type="submit" className="font-bold min-w-[120px]" disabled={loading}>
                                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Find Resources"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </motion.div>

            <motion.div variants={item}>
                {searched && resources.length === 0 && !loading && (
                    <div className="text-center py-16 opacity-60">
                        <Layers className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                        <p className="text-lg font-medium">No resources found for "{searchCode}"</p>
                        <p className="text-sm text-muted-foreground">Check the subject code or ask your faculty to upload materials.</p>
                    </div>
                )}

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {resources.map((res: any, idx) => (
                        <motion.div variants={item} key={res.id || idx}>
                            <Card className="h-full hover:shadow-lg transition-all border-border/60 hover:border-primary/40 group">
                                <CardHeader className="pb-3">
                                    <div className="flex justify-between items-start gap-4">
                                        <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                                            <FileText className="h-5 w-5" />
                                        </div>
                                        <a
                                            href={res.url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            <ExternalLink className="h-4 w-4" />
                                        </a>
                                    </div>
                                    <CardTitle className="leading-snug mt-3 line-clamp-2" title={res.title}>{res.title}</CardTitle>
                                    <CardDescription className="font-mono text-xs text-primary bg-primary/5 w-fit px-2 py-0.5 rounded mt-1">
                                        {res.subjectCode}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground line-clamp-3 mb-4 min-h-[40px]">
                                        {res.description || "No description provided."}
                                    </p>
                                    <div className="text-xs text-muted-foreground border-t pt-3 flex items-center gap-2">
                                        <div className="h-4 w-4 rounded-full bg-muted flex items-center justify-center text-[8px] font-bold">F</div>
                                        <span className="truncate">{res.facultyEmail?.split('@')[0]}</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </motion.div>
    );
}
