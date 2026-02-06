"use client";

import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Loader2,
    Search,
    ExternalLink,
    FileText,
    BookOpen,
    Layers,
    Download,
    Eye,
    Calendar,
    User
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ResourceMeta {
    id: number;
    fileName: string;
    subject: string;
    fileSize: number;
    uploadedAt: string;
    uploadedBy: string;
}

function formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric"
    });
}

export default function StudentResourcesPage() {
    const [loading, setLoading] = useState(false);
    const [searchCode, setSearchCode] = useState("");
    const [resources, setResources] = useState<ResourceMeta[]>([]);
    const [allResources, setAllResources] = useState<ResourceMeta[]>([]);
    const [searched, setSearched] = useState(false);
    const [activeTab, setActiveTab] = useState("search");

    const fetchAllResources = useCallback(async () => {
        try {
            const res = await api.get("/faculty/resources/view/all");
            setAllResources(res.data);
        } catch (err) {
            console.error("Failed to fetch all resources:", err);
        }
    }, []);

    useEffect(() => {
        if (activeTab === "all") {
            fetchAllResources();
        }
    }, [activeTab, fetchAllResources]);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchCode.trim()) return;

        setLoading(true);
        setSearched(true);
        try {
            const res = await api.get(`/faculty/resources/subject/${searchCode.trim()}`);
            setResources(res.data);
        } catch (err) {
            console.error(err);
            setResources([]);
        } finally {
            setLoading(false);
        }
    };

    const handleViewPdf = (id: number) => {
        window.open(`http://localhost:4220/faculty/resources/view/${id}`, "_blank");
    };

    const container = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const item = {
        hidden: { opacity: 0, y: 15 },
        show: { opacity: 1, y: 0 }
    };

    const ResourceGrid = ({ data, emptyMessage }: { data: ResourceMeta[], emptyMessage: string }) => (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {data.length === 0 ? (
                <div className="col-span-full text-center py-16 opacity-60">
                    <Layers className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-lg font-medium">{emptyMessage}</p>
                    <p className="text-sm text-muted-foreground">Check later for new materials.</p>
                </div>
            ) : (
                data.map((res) => (
                    <motion.div variants={item} key={res.id}>
                        <Card className="h-full hover:shadow-lg transition-all border-border/60 hover:border-primary/40 group flex flex-col">
                            <CardHeader className="pb-3">
                                <div className="flex justify-between items-start gap-4">
                                    <div className="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center text-red-600 shrink-0">
                                        <FileText className="h-5 w-5" />
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleViewPdf(res.id)}
                                        className="h-8 w-8 rounded-full hover:bg-blue-100 hover:text-blue-600 transition-colors"
                                        title="Open PDF"
                                    >
                                        <ExternalLink className="h-4 w-4" />
                                    </Button>
                                </div>
                                <CardTitle className="leading-snug mt-3 line-clamp-2 text-base" title={res.fileName}>
                                    {res.fileName}
                                </CardTitle>
                                <CardDescription className="font-mono text-xs text-primary bg-primary/5 w-fit px-2 py-0.5 rounded mt-1">
                                    {res.subject}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="mt-auto pt-0">
                                <div className="space-y-2 text-sm text-muted-foreground mb-4">
                                    <div className="flex items-center gap-2">
                                        <User className="h-3 w-3" />
                                        <span className="truncate">{res.uploadedBy}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-3 w-3" />
                                        <span>{formatDate(res.uploadedAt)}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Layers className="h-3 w-3" />
                                        <span>{formatFileSize(res.fileSize)}</span>
                                    </div>
                                </div>
                                <Button
                                    onClick={() => handleViewPdf(res.id)}
                                    className="w-full bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-200"
                                    variant="outline"
                                >
                                    <Eye className="mr-2 h-4 w-4" />
                                    View Document
                                </Button>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))
            )}
        </div>
    );

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="max-w-6xl mx-auto space-y-8 pb-10"
        >
            <motion.div variants={item} className="flex flex-col gap-2">
                <h1 className="text-4xl font-black tracking-tight text-foreground">
                    Learning Resources<span className="text-primary">.</span>
                </h1>
                <p className="text-lg text-muted-foreground">Access study materials and PDFs shared by your faculty.</p>
            </motion.div>

            <Tabs defaultValue="search" className="w-full" onValueChange={setActiveTab}>
                <motion.div variants={item}>
                    <TabsList className="grid w-full max-w-md grid-cols-2">
                        <TabsTrigger value="search">Search by Subject</TabsTrigger>
                        <TabsTrigger value="all">Recent Uploads</TabsTrigger>
                    </TabsList>
                </motion.div>

                <TabsContent value="search" className="space-y-6 mt-6">
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

                    <AnimatePresence mode="wait">
                        {searched && !loading && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                            >
                                <ResourceGrid
                                    data={resources}
                                    emptyMessage={`No resources found for "${searchCode}"`}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </TabsContent>

                <TabsContent value="all" className="mt-6">
                    <motion.div variants={item}>
                        <ResourceGrid
                            data={allResources}
                            emptyMessage="No resources available yet."
                        />
                    </motion.div>
                </TabsContent>
            </Tabs>
        </motion.div>
    );
}
