"use client";

import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";
import { API_BASE_URL } from "@/lib/constants";
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
    uploadedAt: string | number[];
    uploadedBy: string;
}

function formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

function formatDate(dateInput: string | number[]): string {
    if (!dateInput) return "Unknown Date";

    // Handle Java LocalDateTime serialized as array [yyyy, MM, dd, HH, mm, ss]
    if (Array.isArray(dateInput)) {
        const [year, month, day, hour = 0, minute = 0] = dateInput;
        return new Date(year, month - 1, day, hour, minute).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric"
        });
    }

    return new Date(dateInput).toLocaleDateString("en-US", {
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

    const handleViewPdf = async (id: number) => {
        try {
            setLoading(true); // Show loading indicator while fetching
            const response = await api.get(`/faculty/resources/view/${id}`, {
                responseType: 'blob'
            });
            const file = new Blob([response.data], { type: 'application/pdf' });
            const fileURL = URL.createObjectURL(file);
            window.open(fileURL, "_blank");
        } catch (error) {
            console.error("Error viewing PDF:", error);
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

    const ResourceList = ({ data, emptyMessage }: { data: ResourceMeta[], emptyMessage: string }) => (
        <Card className="border-0 shadow-lg bg-card/60 backdrop-blur-sm ring-1 ring-border/50">
            <CardContent className="pt-6">
                {data.length === 0 ? (
                    <div className="text-center py-12 opacity-60">
                        <Layers className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                        <p className="text-lg font-medium">{emptyMessage}</p>
                        <p className="text-sm text-muted-foreground">Check later for new materials.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {data.map((res, idx) => (
                            <motion.div
                                key={res.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                onClick={() => handleViewPdf(res.id)}
                                className="flex items-center justify-between p-4 rounded-xl border border-border/50 hover:border-primary/30 hover:bg-muted/30 transition-all group cursor-pointer"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
                                        <FileText className="h-5 w-5 text-red-600" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-semibold text-foreground truncate" title={res.fileName}>
                                            {res.fileName}
                                        </p>
                                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                            <span className="font-mono bg-primary/10 text-primary px-2 py-0.5 rounded">
                                                {res.subject}
                                            </span>
                                            <span>{formatFileSize(res.fileSize)}</span>
                                            <span>Uploaded by {res.uploadedBy}</span>
                                            <span>{formatDate(res.uploadedAt)}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleViewPdf(res.id);
                                        }}
                                        className="hover:bg-blue-100 hover:text-blue-600"
                                        title="View PDF"
                                    >
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
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
                                <ResourceList
                                    data={resources}
                                    emptyMessage={`No resources found for "${searchCode}"`}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </TabsContent>

                <TabsContent value="all" className="mt-6">
                    <motion.div variants={item}>
                        <ResourceList
                            data={allResources}
                            emptyMessage="No resources available yet."
                        />
                    </motion.div>
                </TabsContent>
            </Tabs>
        </motion.div>
    );
}
