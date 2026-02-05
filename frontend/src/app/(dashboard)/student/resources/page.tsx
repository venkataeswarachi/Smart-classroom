"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, FileText, Archive, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

export default function StudentResourcesPage() {
    const [search, setSearch] = useState("");
    const [resources, setResources] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const handleSearch = async () => {
        if (!search) return;
        setLoading(true);
        try {
            const res = await api.get(`/resource/subject/${search}`);
            setResources(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-4xl font-black tracking-tight text-foreground">
                    Study Materials<span className="text-primary">.</span>
                </h1>
                <p className="text-lg text-muted-foreground">Search by Subject Code (e.g., CS101) to find resources.</p>
            </div>

            <div className="relative max-w-md flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Enter Subject Code..."
                        className="pl-10 bg-background/50 h-10 border-primary/20 focus-visible:ring-primary/20"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSearch()}
                    />
                </div>
                <Button onClick={handleSearch} disabled={loading}>{loading ? "Searching..." : "Search"}</Button>
            </div>

            <div className="grid gap-4 md:grid-cols-1">
                {resources.length === 0 && !loading && (
                    <p className="text-muted-foreground">No resources found. Try searching for a subject code.</p>
                )}
                {resources.map((res, i) => (
                    <motion.div
                        key={res.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                    >
                        <Card className="hover:bg-muted/30 transition-colors group border-border/60">
                            <CardContent className="p-4 flex items-center gap-4">
                                <div className="h-12 w-12 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
                                    <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">{res.title}</h3>
                                        <span className="text-[10px] font-bold px-1.5 py-0.5 bg-muted rounded uppercase tracking-wide text-muted-foreground">LINK</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground space-x-2">
                                        <span className="font-medium text-foreground/80">{res.subjectCode}</span>
                                        <span>•</span>
                                        <span className="truncate max-w-[200px]">{res.description}</span>
                                    </p>
                                </div>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="shrink-0 gap-2 border-primary/20 hover:bg-primary/5 hover:text-primary"
                                    onClick={() => window.open(res.url, '_blank')}
                                >
                                    View <ExternalLink className="h-3 w-3" />
                                </Button>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
