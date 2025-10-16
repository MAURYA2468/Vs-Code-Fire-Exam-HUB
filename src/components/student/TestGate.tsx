
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Test, Submission } from "@/lib/types";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, Lock, BookOpen, AlertCircle, RefreshCw } from "lucide-react";
import TestTaker from "./TestTaker";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";

const TESTS_STORAGE_KEY = "exam-hub-tests";
const SUBMISSIONS_STORAGE_KEY = "exam-hub-submissions";

enum TestAccessState {
    Loading,
    RequiresCode,
    Ready,
    MaxAttemptsReached,
    Error,
}

export default function TestGate({ testId }: { testId: string }) {
    const { user } = useAuth();
    const router = useRouter();

    const [test, setTest] = useState<Test | null>(null);
    const [accessState, setAccessState] = useState<TestAccessState>(TestAccessState.Loading);
    const [enteredCode, setEnteredCode] = useState("");
    const [errorCode, setErrorCode] = useState("");
    const [pastSubmissions, setPastSubmissions] = useState<Submission[]>([]);

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
        const studentSubmissions = allSubmissions.filter(s => s.testId === testId && s.studentId === user.id);
        setPastSubmissions(studentSubmissions);

        const maxAttempts = foundTest.maxAttempts ?? 0;
        if (maxAttempts > 0 && studentSubmissions.length >= maxAttempts) {
            setAccessState(TestAccessState.MaxAttemptsReached);
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
    
    if (accessState === TestAccessState.MaxAttemptsReached) {
         return (
             <div className="flex h-screen items-center justify-center">
                <Card className="w-full max-w-md text-center">
                    <CardHeader>
                        <CardTitle>Maximum Attempts Reached</CardTitle>
                        <CardDescription>You have used all your attempts for this test.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p>You have made {pastSubmissions.length} of {test?.maxAttempts} allowed attempts.</p>
                    </CardContent>
                    <CardFooter>
                        <Button variant="outline" onClick={() => router.push('/student/dashboard')} className="w-full">Back to Dashboard</Button>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    if (accessState === TestAccessState.RequiresCode) {
        const attemptsMade = pastSubmissions.length;
        const maxAttempts = test?.maxAttempts ?? 0;
        const attemptsLeft = maxAttempts - attemptsMade;
        const attemptText = maxAttempts > 0 ? `${attemptsLeft} of ${maxAttempts} attempts remaining` : "Unlimited attempts";

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
                        <p className="text-center text-sm text-muted-foreground">{attemptText}</p>
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
    
    if (accessState === TestAccessState.Ready && test) {
        const attemptsMade = pastSubmissions.length;
        const maxAttempts = test.maxAttempts ?? 0;
        
        // This case is a pre-check before entering TestTaker if no access code is needed.
        if (maxAttempts > 0 && attemptsMade >= maxAttempts) {
             setAccessState(TestAccessState.MaxAttemptsReached);
             return null; // The component will re-render into the MaxAttemptsReached state
        }
        
        const nextAttemptNumber = attemptsMade + 1;

        // If there's no access code, show a simple start screen.
        if (!test.accessCode) {
            const attemptText = maxAttempts > 0 ? `This will be attempt ${nextAttemptNumber} of ${maxAttempts}.` : "You have unlimited attempts.";
            return (
                <div className="flex h-screen items-center justify-center">
                    <Card className="w-full max-w-md text-center">
                        <CardHeader>
                            <CardTitle>{test.title}</CardTitle>
                            <CardDescription>{test.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                               <p className="text-muted-foreground">{attemptText}</p>
                               <p>You will have {test.duration} minutes to complete the test.</p>
                            </div>
                        </CardContent>
                        <CardFooter className="flex-col gap-4">
                            <Button onClick={() => setAccessState(TestAccessState.Ready + 1)} className="w-full">
                                {attemptsMade > 0 ? <RefreshCw className="mr-2 h-4 w-4" /> : <BookOpen className="mr-2 h-4 w-4" />} 
                                {attemptsMade > 0 ? 'Retake Test' : 'Start Test'}
                            </Button>
                             <Button variant="outline" className="w-full" onClick={() => router.back()}>Cancel</Button>
                        </CardFooter>
                    </Card>
                </div>
            );
        }
    }

    if (accessState === TestAccessState.Ready || accessState === TestAccessState.Ready + 1) {
        return <TestTaker testId={testId} attemptNumber={pastSubmissions.length + 1} />;
    }
    
    return null;
}
