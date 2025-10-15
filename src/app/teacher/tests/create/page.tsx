import TestBuilder from "@/components/teacher/TestBuilder";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function CreateTestPage() {
  return (
    <div className="container mx-auto">
        <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Create New Test</h1>
            <p className="text-muted-foreground">Build your test with a title, duration, and a set of questions.</p>
        </div>
        <Card className="bg-card/70 backdrop-blur-sm">
            <CardHeader>
                <CardTitle>Test Details & Questions</CardTitle>
                <CardDescription>Fill in the details below to create a new test for your students.</CardDescription>
            </CardHeader>
            <CardContent>
                <TestBuilder />
            </CardContent>
        </Card>
    </div>
  );
}
