import { Card, CardContent } from "@/components/ui/card";
import { UserCircle } from "lucide-react";

export default function FacultyProfilePage() {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Faculty Profile</h1>
            <Card className="border-border bg-card">
                <CardContent className="flex flex-col items-center justify-center min-h-[400px] text-muted-foreground p-6">
                    <UserCircle className="h-12 w-12 mb-4 opacity-50" />
                    <h2 className="text-xl font-semibold mb-2">Account Settings</h2>
                    <p>Manage your profile and teaching preferences.</p>
                </CardContent>
            </Card>
        </div>
    );
}
