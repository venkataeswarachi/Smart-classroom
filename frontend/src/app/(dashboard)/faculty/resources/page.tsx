import { Card, CardContent } from "@/components/ui/card";
import { Hammer } from "lucide-react";

export default function FacultyResourcesPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Resources</h1>
            <Card className="border-border bg-card">
                <CardContent className="flex flex-col items-center justify-center min-h-[400px] text-muted-foreground p-6">
                    <Hammer className="h-12 w-12 mb-4 opacity-50" />
                    <h2 className="text-xl font-semibold mb-2">Coming Soon</h2>
                    <p>Upload and manage class resources and materials.</p>
                </CardContent>
            </Card>
        </div>
    );
}
