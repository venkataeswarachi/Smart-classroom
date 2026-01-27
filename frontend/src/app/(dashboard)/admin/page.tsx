"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Upload, FileUp } from "lucide-react";
import Link from "next/link";

export default function AdminDashboard() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Admin Dashboard</h1>
                <p className="text-muted-foreground">Manage institution users and configuration.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card className="bg-card border-border">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-foreground">--</div>
                        <p className="text-xs text-muted-foreground">Registered in system</p>
                    </CardContent>
                </Card>

                <Card className="bg-card border-border col-span-1 md:col-span-2">
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                        <Link href="/admin/users">
                            <Button variant="outline" className="w-full h-24 flex flex-col gap-2 border-border bg-card hover:bg-secondary">
                                <Upload className="h-6 w-6 text-primary" />
                                <span>Upload User Data (Excel)</span>
                            </Button>
                        </Link>
                        {/* System Status Overview */}
                        <Button variant="outline" className="w-full h-24 flex flex-col gap-2 border-border bg-card hover:bg-secondary opacity-50 cursor-not-allowed">
                            <FileUp className="h-6 w-6" />
                            <span>Manage Departments (Soon)</span>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
