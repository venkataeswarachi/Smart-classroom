"use client";

import { useState } from "react";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle, UserCheck } from "lucide-react";

export default function DEOStudentsPage() {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const [form, setForm] = useState({
        email: "",
        section: "A",
        dept: "CSE"
    });

    const handleAssign = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            await api.post("/deo/assign-section", form);
            setMessage({ type: 'success', text: `Successfully assigned ${form.email} to ${form.section}` });
        } catch (err) {
            setMessage({ type: 'error', text: "Failed to assign student. Verify email." });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Student Management</h1>
                <p className="text-muted-foreground">Assign sections and manage student placement.</p>
            </div>

            <Card className="border-border bg-card">
                <CardHeader>
                    <CardTitle>Assign Section</CardTitle>
                    <CardDescription>Move a student to a specific department section.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleAssign} className="space-y-6">
                        {message && (
                            <div className={`p-4 rounded-md flex items-center gap-2 ${message.type === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                <CheckCircle className="h-4 w-4" />
                                {message.text}
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label>Student Email</Label>
                            <Input
                                type="email"
                                placeholder="student@example.com"
                                value={form.email}
                                onChange={e => setForm({ ...form, email: e.target.value })}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Department</Label>
                                <Input value={form.dept} onChange={e => setForm({ ...form, dept: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label>Section</Label>
                                <Input value={form.section} onChange={e => setForm({ ...form, section: e.target.value })} />
                            </div>
                        </div>

                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserCheck className="mr-2 h-4 w-4" />}
                            Assign Section
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
