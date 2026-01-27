import { Card, CardContent } from "@/components/ui/card";
import { UserCircle } from "lucide-react";

export default function StudentProfilePage() {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">My Profile</h1>
            <Card className="border-border bg-card">
                <CardContent className="flex flex-col items-center justify-center min-h-[400px] text-muted-foreground p-6">
                    <UserCircle className="h-12 w-12 mb-4 opacity-50" />
                    <h2 className="text-xl font-semibold mb-2">Profile Management</h2>
                    <p>Manage your account settings and preferences.</p>
                </CardContent>
            </Card>
        </div>
    );
}
