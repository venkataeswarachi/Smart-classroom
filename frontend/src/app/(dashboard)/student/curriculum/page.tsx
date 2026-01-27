import { Card, CardContent } from "@/components/ui/card";
import { Hammer } from "lucide-react";

export default function StudentCurriculumPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Curriculum & Learning Path</h1>
            <Card className="border-border bg-card">
                <CardContent className="flex flex-col items-center justify-center min-h-[400px] text-muted-foreground p-6">
                    <Hammer className="h-12 w-12 mb-4 opacity-50" />
                    <h2 className="text-xl font-semibold mb-2">Coming Soon</h2>
                    <p>AI-driven curriculum recommendations will appear here.</p>
                </CardContent>
            </Card>
        </div>
    );
}
