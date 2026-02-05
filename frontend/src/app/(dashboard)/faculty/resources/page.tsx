"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Upload, FileText, Download, Link as LinkIcon, ExternalLink } from "lucide-react";

export default function FacultyResourcesPage() {
    // Mocking existing resources for MVP as we might not have files yet
    const [resources, setResources] = useState<any[]>([]);
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        subjectCode: "",
        url: "", // Using Link for now as file upload requires backend storage setup
        description: "" // Optional
    });

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        // MVP: Send link as resource
        const payload = {
            ...formData,
            // type: "LINK", // Backend doesn't have type field in model shown, assuming string url is enough
        };

        try {
            await api.post("/resource/upload", payload);
            setOpen(false);
            setResources(prev => [payload, ...prev]);
            setFormData({ title: "", subjectCode: "", url: "", description: "" });
        } catch (err) {
            console.error("Upload failed", err);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-foreground">Resource Center</h1>
                    <p className="text-muted-foreground">Share study materials and references.</p>
                </div>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button className="font-bold shadow-lg shadow-blue-500/20 bg-blue-600 hover:bg-blue-700">
                            <Upload className="mr-2 h-4 w-4" /> Share Resource
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Share New Resource</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleUpload} className="space-y-4 py-2">
                            <div className="space-y-2">
                                <Label>Title</Label>
                                <Input placeholder="Unit 1 Notes" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required />
                            </div>
                            <div className="space-y-2">
                                <Label>Subject Code</Label>
                                <Input placeholder="CS101" value={formData.subjectCode} onChange={e => setFormData({ ...formData, subjectCode: e.target.value })} required />
                            </div>
                            <div className="space-y-2">
                                <Label>Resource Link (URL)</Label>
                                <Input placeholder="https://drive.google.com/..." value={formData.url} onChange={e => setFormData({ ...formData, url: e.target.value })} required />
                            </div>
                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Input placeholder="Optional context..." value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                            </div>
                            <Button type="submit" className="w-full mt-4">Post Resource</Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Card for Empty State if no resources */}
                {resources.length === 0 && (
                    <div className="col-span-full py-16 text-center bg-muted/20 border border-dashed border-border rounded-xl">
                        <FileText className="h-12 w-12 mx-auto text-muted-foreground opacity-30 mb-3" />
                        <p className="text-lg font-medium text-foreground">No resources uploaded yet.</p>
                        <p className="text-sm text-muted-foreground">Click "Share Resource" to get started.</p>
                    </div>
                )}

                {resources.map((res, i) => (
                    <Card key={i} className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                            <div className="flex justify-between items-start">
                                <Badge variant="secondary" className="font-mono text-xs">{res.subjectCode}</Badge>
                                <ExternalLink className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <CardTitle className="text-lg mt-2">{res.title}</CardTitle>
                            <CardDescription className="line-clamp-2">{res.description || "No description provided."}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button
                                variant="outline"
                                className="w-full gap-2 text-blue-600 hover:text-blue-700 border-blue-200 hover:bg-blue-50"
                                onClick={() => window.open(res.url, '_blank')}
                            >
                                <LinkIcon className="h-4 w-4" /> Open Resource
                            </Button>
                        </CardContent>
                    </Card>
                ))}

                {/* Example Static Card for Demo */}
                <Card className="hover:shadow-md transition-shadow bg-card/50">
                    <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                            <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded">CS304</span>
                            <Download className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <CardTitle className="text-lg mt-2">Database design_v2.pdf</CardTitle>
                        <CardDescription>Lecture slides for Normalization module.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button variant="outline" className="w-full" disabled>
                            <Download className="mr-2 h-4 w-4" /> Download
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function Badge({ children, className, variant }: any) {
    return <span className={`px-2 py-0.5 rounded text-xs font-semibold ${className} ${variant === 'secondary' ? 'bg-secondary text-secondary-foreground' : 'bg-primary text-primary-foreground'}`}>{children}</span>;
}
