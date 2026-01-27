"use client";

import { useState } from "react";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Upload, Loader2, CheckCircle, AlertCircle } from "lucide-react";

export default function AdminUsersPage() {
    const [file, setFile] = useState<File | null>(null);
    const [role, setRole] = useState("ROLE_STUDENT");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

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
            setMessage({ type: 'success', text: "Users uploaded successfully!" });
        } catch (err) {
            setMessage({ type: 'error', text: "Failed to upload users. Check file format." });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-8 space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Manage Users</h1>
                <p className="text-muted-foreground">Bulk upload users via Excel/CSV.</p>
            </div>

            <Card className="border-border bg-card">
                <CardHeader>
                    <CardTitle>Bulk Upload</CardTitle>
                    <CardDescription>Select a role and upload the student/faculty data file.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleUpload} className="space-y-6">
                        {message && (
                            <div className={`p-4 rounded-md flex items-center gap-2 ${message.type === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                {message.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                                {message.text}
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label>User Role</Label>
                            <div className="relative">
                                <select
                                    className="flex h-10 w-full rounded-md border border-input bg-secondary/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                >
                                    <option value="ROLE_STUDENT">Student</option>
                                    <option value="ROLE_FACULTY">Faculty</option>
                                    <option value="ROLE_DEPT_ADMIN">Dept Admin</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Data File (.xlsx, .csv)</Label>
                            <Input
                                type="file"
                                accept=".xlsx,.xls,.form-data"
                                onChange={(e) => setFile(e.target.files?.[0] || null)}
                                className="cursor-pointer file:text-foreground"
                            />
                        </div>

                        <Button type="submit" className="w-full" disabled={!file || loading}>
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                            {loading ? "Uploading..." : "Upload Users"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
