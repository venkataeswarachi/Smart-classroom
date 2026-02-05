"use client";

import { useState, useRef } from "react";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Upload, Loader2, CheckCircle, AlertCircle, FileSpreadsheet, Users, GraduationCap, School } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export default function AdminUsersPage() {
    const [file, setFile] = useState<File | null>(null);
    const [role, setRole] = useState("ROLE_STUDENT");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [dragActive, setDragActive] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) return;

        setLoading(true);
        setMessage(null);

        const formData = new FormData();
        formData.append("file", file);
        formData.append("role", role);

        try {
            await api.post("/admin/upload-users", formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setMessage({ type: 'success', text: `Successfully uploaded ${role.replace("ROLE_", "").toLowerCase()}s from ${file.name}` });
            setFile(null);
            if (inputRef.current) inputRef.current.value = "";
        } catch (err) {
            setMessage({ type: 'error', text: "Failed to upload users. Please ensure the file format matches the template." });
        } finally {
            setLoading(false);
        }
    };

    const container = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="max-w-3xl mx-auto py-8 space-y-8"
        >
            <div className="text-center space-y-2">
                <h1 className="text-4xl font-black tracking-tight text-foreground">User Management</h1>
                <p className="text-lg text-muted-foreground">Bulk onboard users to the platform.</p>
            </div>

            <Card className="border-border/60 shadow-xl bg-card/50 backdrop-blur-sm overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-orange-500" />
                <CardHeader>
                    <CardTitle>Bulk User Upload</CardTitle>
                    <CardDescription>Select the user role and upload the corresponding Excel/CSV data file.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleUpload} className="space-y-8">
                        <AnimatePresence mode="wait">
                            {message && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className={cn(
                                        "p-4 rounded-xl flex items-center gap-3 border",
                                        message.type === 'success' ? "bg-green-500/10 text-green-600 border-green-500/20" : "bg-red-500/10 text-red-600 border-red-500/20"
                                    )}
                                >
                                    <div className={cn("h-8 w-8 rounded-full flex items-center justify-center shrink-0", message.type === 'success' ? "bg-green-100" : "bg-red-100")}>
                                        {message.type === 'success' ? <CheckCircle className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                                    </div>
                                    <p className="font-medium text-sm">{message.text}</p>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="space-y-4">
                            <Label className="text-sm uppercase tracking-wider text-muted-foreground font-semibold">Step 1: Select Role</Label>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {[
                                    { value: "ROLE_STUDENT", label: "Students", icon: GraduationCap },
                                    { value: "ROLE_FACULTY", label: "Faculty", icon: Users },
                                    { value: "ROLE_DEPT_ADMIN", label: "Dept Admin", icon: School },
                                ].map((option) => (
                                    <div
                                        key={option.value}
                                        onClick={() => setRole(option.value)}
                                        className={cn(
                                            "cursor-pointer rounded-xl border-2 p-4 flex flex-col items-center gap-3 transition-all duration-200 hover:shadow-md",
                                            role === option.value
                                                ? "border-primary bg-primary/5 shadow-md scale-[1.02]"
                                                : "border-border bg-card/50 hover:border-primary/50"
                                        )}
                                    >
                                        <div className={cn("h-10 w-10 rounded-full flex items-center justify-center transition-colors", role === option.value ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
                                            <option.icon className="h-5 w-5" />
                                        </div>
                                        <span className={cn("font-bold text-sm", role === option.value ? "text-primary" : "text-foreground")}>{option.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <Label className="text-sm uppercase tracking-wider text-muted-foreground font-semibold">Step 2: Upload Data</Label>
                            <div
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                                onClick={() => inputRef.current?.click()}
                                className={cn(
                                    "relative border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center gap-4 transition-all duration-300 cursor-pointer group",
                                    dragActive ? "border-primary bg-primary/10 scale-[1.01]" : "border-border/60 hover:border-primary/50 hover:bg-muted/30",
                                    file ? "bg-green-50/50 border-green-500/30" : ""
                                )}
                            >
                                <Input
                                    ref={inputRef}
                                    type="file"
                                    accept=".xlsx,.xls,.csv"
                                    onChange={handleChange}
                                    className="hidden"
                                />

                                <div className={cn(
                                    "h-16 w-16 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110",
                                    file ? "bg-green-100 text-green-600" : "bg-primary/10 text-primary"
                                )}>
                                    {file ? <FileSpreadsheet className="h-8 w-8" /> : <Upload className="h-8 w-8" />}
                                </div>

                                <div className="text-center">
                                    {file ? (
                                        <>
                                            <p className="text-lg font-bold text-foreground">{file.name}</p>
                                            <p className="text-sm text-muted-foreground mt-1">{(file.size / 1024).toFixed(1)} KB • Ready to upload</p>
                                        </>
                                    ) : (
                                        <>
                                            <p className="text-lg font-bold text-foreground">Click to upload or drag and drop</p>
                                            <p className="text-sm text-muted-foreground mt-1">Excel (.xlsx) or CSV files supported</p>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            size="lg"
                            className="w-full h-12 text-base font-bold shadow-lg shadow-primary/20"
                            disabled={!file || loading}
                        >
                            {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Upload className="mr-2 h-5 w-5" />}
                            {loading ? "Processing..." : "Initiate Upload"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </motion.div>
    );
}
