
"use client";

import TestBuilder from "@/components/teacher/TestBuilder";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Test } from "@/lib/types";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";

const TESTS_STORAGE_KEY = "offline-exam-pro-tests";

export default function EditTestPage() {
    const params = useParams();
    const testId = params.id as string;
    const [test, setTest] = useState<Test | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (testId) {
            const allTestsJson = localStorage.getItem(TESTS_STORAGE_KEY);
            const allTests: Test[] = allTestsJson ? JSON.parse(allTestsJson) : [];
            const foundTest = allTests.find(t => t.id === testId);
            setTest(foundTest || null);
            setIsLoading(false);
        }
    }, [testId]);

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  }

  if (!test) {
    return <div className="text-center text-destructive">Test not found.</div>;
  }

  return (
    <div className="container mx-auto">
        <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Edit Test</h1>
            <p className="text-muted-foreground">Modify the details of your test below.</p>
        </div>
        <Card className="bg-card/70 backdrop-blur-sm">
            <CardHeader>
                <CardTitle>Test Details & Questions</CardTitle>
                <CardDescription>Update the title, duration, and questions for this test.</CardDescription>
            </CardHeader>
            <CardContent>
                <TestBuilder existingTest={test} />
            </CardContent>
        </Card>
    </div>
  );
}
