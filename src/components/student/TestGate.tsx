
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Test, Submission } from "@/lib/types";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, Lock, BookOpen, AlertCircle } from "lucide-react";
import TestTaker from "./TestTaker";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";

const TESTS_STORAGE_KEY = "exam-hub-tests";
const SUBMISSIONS_STORAGE_KEY = "exam-hub-submissions";

enum TestAccessState {
    Loading,
    RequiresCode,
    Ready,
    AlreadyTaken,
    Error,
}

export default function TestGate({ testId }: { testId: string }) {
    const { user } = useAuth();
    const router = useRouter();

    const [test, setTest] = useState<Test | null>(null);
    const [accessState, setAccessState] = useState<TestAccessState>(TestAccessState.Loading);
    const [enteredCode, setEnteredCode] = useState("");
    const [errorCode, setErrorCode] = useState("");

    useEffect(() => {
        if (!user) return;

        const allTestsJson = localStorage.getItem(TESTS_STORAGE_KEY);
        const allTests: Test[] = allTestsJson ? JSON.parse(allTestsJson) : [];
        const foundTest = allTests.find(t => t.id === testId);
        setTest(foundTest || null);

        if (!foundTest) {
            setAccessState(TestAccessState.Error);
            return;
        }

        const allSubmissionsJson = localStorage.getItem(SUBMISSIONS_STORAGE_KEY);
        const allSubmissions: Submission[] = allSubmissionsJson ? JSON.parse(allSubmissionsJson) : [];
        const hasSubmitted = allSubmissions.some(s => s.testId === testId && s.studentId === user.id);

        if (hasSubmitted && !foundTest.allowRetakes) {
            setAccessState(TestAccessState.AlreadyTaken);
            return;
        }

        if (foundTest.accessCode) {
            setAccessState(TestAccessState.RequiresCode);
        } else {
            setAccessState(TestAccessState.Ready);
        }
    }, [testId, user]);

    const handleCodeSubmit = () => {
        if (test && enteredCode === test.accessCode) {
            setAccessState(TestAccessState.Ready);
        } else {
            setErrorCode("The access code you entered is incorrect.");
        }
    };
    
    if (accessState === TestAccessState.Loading) {
        return <div className="flex h-screen items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
    }

    if (accessState === TestAccessState.Error) {
        return (
             <div className="flex h-screen items-center justify-center">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle className="text-destructive">Test Not Found</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>The test you are trying to access does not exist or has been removed.</p>
                    </CardContent>
                    <CardFooter>
                        <Button variant="outline" onClick={() => router.back()}>Go Back</Button>
                    </CardFooter>
                </Card>
            </div>
        );
    }
    
    if (accessState === TestAccessState.AlreadyTaken) {
         return (
             <div className="flex h-screen items-center justify-center">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle>Test Already Completed</CardTitle>
                        <CardDescription>You have already submitted an attempt for this test.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p>Retakes are not allowed for this test. Your previous submission has been recorded.</p>
                    </CardContent>
                    <CardFooter>
                        <Button variant="outline" onClick={() => router.push('/student/dashboard')}>Back to Dashboard</Button>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    if (accessState === TestAccessState.RequiresCode) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Card className="w-full max-w-sm">
                    <CardHeader className="text-center">
                        <Lock className="mx-auto h-12 w-12 text-primary" />
                        <CardTitle className="mt-4 text-2xl">Access Required</CardTitle>
                        <CardDescription>This test requires an access code to begin.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                             <Input
                                type="text"
                                placeholder="Enter access code"
                                value={enteredCode}
                                onChange={(e) => {
                                    setEnteredCode(e.target.value);
                                    setErrorCode("");
                                }}
                                onKeyDown={(e) => e.key === 'Enter' && handleCodeSubmit()}
                            />
                        </div>
                        {errorCode && (
                             <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Error</AlertTitle>
                                <AlertDescription>{errorCode}</AlertDescription>
                            </Alert>
                        )}
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4">
                        <Button className="w-full" onClick={handleCodeSubmit}>
                            <BookOpen className="mr-2 h-4 w-4" /> Start Test
                        </Button>
                         <Button variant="outline" className="w-full" onClick={() => router.back()}>Cancel</Button>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    if (accessState === TestAccessState.Ready) {
        return <TestTaker testId={testId} />;
    }
    
    return null;
}
