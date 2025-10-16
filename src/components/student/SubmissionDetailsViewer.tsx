
"use client";

import { useEffect, useState } from "react";
import { Submission, Test, User, Question } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, parseISO } from "date-fns";
import { Loader2, User as UserIcon, Clock, CheckCircle, XCircle, HelpCircle, AlertTriangle, RefreshCw, Lightbulb } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "../ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";

const TESTS_STORAGE_KEY = "exam-hub-tests";
const SUBMISSIONS_STORAGE_KEY = "exam-hub-submissions";
const USERS_STORAGE_KEY = "exam-hub-users";

interface SubmissionViewerProps {
    submissionId: string;
}

export default function SubmissionDetailsViewer({ submissionId }: SubmissionViewerProps) {
    const router = useRouter();
    const [test, setTest] = useState<Test | null>(null);
    const [submission, setSubmission] = useState<Submission | null>(null);
    const [student, setStudent] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [canRetake, setCanRetake] = useState(false);

    useEffect(() => {
        if (!submissionId) {
            setIsLoading(false);
            return;
        }

        const allSubmissionsJson = localStorage.getItem(SUBMISSIONS_STORAGE_KEY);
        const allSubmissions: Submission[] = allSubmissionsJson ? JSON.parse(allSubmissionsJson) : [];
        const foundSubmission = allSubmissions.find(s => s.id === submissionId);
        setSubmission(foundSubmission || null);

        if (foundSubmission) {
            const allTestsJson = localStorage.getItem(TESTS_STORAGE_KEY);
            const allTests: Test[] = allTestsJson ? JSON.parse(allTestsJson) : [];
            const foundTest = allTests.find(t => t.id === foundSubmission.testId);
            setTest(foundTest || null);
            
            const allUsersJson = localStorage.getItem(USERS_STORAGE_KEY);
            const allUsers: User[] = allUsersJson ? JSON.parse(allUsersJson) : [];
            const foundStudent = allUsers.find(u => u.id === foundSubmission.studentId);
            setStudent(foundStudent || null);

            if (foundTest && foundStudent) {
                const studentSubmissionsForTest = allSubmissions.filter(s => s.testId === foundTest.id && s.studentId === foundStudent.id);
                const maxAttempts = foundTest.maxAttempts ?? 0;
                if (maxAttempts === 0 || studentSubmissionsForTest.length < maxAttempts) {
                    setCanRetake(true);
                }
            }
        }

        setIsLoading(false);
    }, [submissionId]);

    const getStudentAnswer = (questionId: string) => {
        return submission?.answers.find(a => a.questionId === questionId);
    };

    const renderAnswer = (question: Question) => {
        const studentAnswer = getStudentAnswer(question.id);
        const studentAnswerValue = studentAnswer?.value ?? "";
        const awardedPoints = studentAnswer?.pointsAwarded;
        const isGraded = awardedPoints !== undefined;

        switch (question.type) {
            case 'mcq':
                const studentAnswerOption = question.options?.find(o => o.id === studentAnswerValue);
                const correctAnswerOption = question.options?.find(o => o.id === question.correctAnswer);
                const isCorrect = isGraded && awardedPoints !== undefined && awardedPoints > 0;

                return (
                    <div>
                        <p className="font-semibold text-muted-foreground">Your Answer:</p>
                        <div className={`mt-2 rounded-md border p-3 ${isGraded ? (isCorrect ? 'border-green-500 bg-green-500/10' : 'border-red-500 bg-red-500/10') : 'bg-muted/30'}`}>
                            <p className="flex items-center">
                                {isGraded && (isCorrect ? <CheckCircle className="mr-2 h-5 w-5 text-green-500" /> : <XCircle className="mr-2 h-5 w-5 text-red-500" />)}
                                {studentAnswerOption?.text || <span className="italic text-muted-foreground">No answer</span>}
                            </p>
                        </div>
                        {isGraded && !isCorrect && correctAnswerOption && (
                            <div className="mt-3">
                                <p className="font-semibold text-muted-foreground">Correct Answer:</p>
                                <div className="mt-2 rounded-md border border-green-500/50 bg-green-500/5 p-3">
                                    <p>{correctAnswerOption.text}</p>
                                </div>
                            </div>
                        )}
                    </div>
                );
            case 'short-answer':
            case 'essay':
                return (
                     <div>
                        <p className="font-semibold text-muted-foreground">Your Answer:</p>
                        <p className="mt-2 whitespace-pre-wrap rounded-md border bg-muted/30 p-3">{studentAnswerValue || <span className="italic text-muted-foreground">No answer</span>}</p>
                        {isGraded && (
                             <div className="mt-2 font-semibold">
                                <Badge>Points Awarded: {awardedPoints}</Badge>
                            </div>
                        )}
                    </div>
                );
            default:
                return null;
        }
    };
    
    if (isLoading) {
        return <div className="flex h-screen items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
    }

    if (!test || !submission || !student) {
        return <div className="text-center text-destructive">Could not load result details.</div>;
    }
    
    const totalPoints = test.questions.reduce((sum, q) => sum + q.points, 0);
    const finalScore = submission.gradedScore ?? 0;
    const needsGrading = submission.gradedScore === undefined;
    const attemptText = test.maxAttempts && test.maxAttempts > 0 ? `Attempt ${submission.attemptNumber} of ${test.maxAttempts}` : `Attempt ${submission.attemptNumber}`;


    return (
        <div className="container mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">Results for: <span className="font-semibold text-primary">{test.title}</span></CardTitle>
                    <CardDescription>{attemptText}</CardDescription>
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-4 text-sm text-muted-foreground">
                        <div className="flex items-center">
                            <UserIcon className="mr-2 h-4 w-4" />
                            <span>{student.name}</span>
                        </div>
                        <div className="flex items-center">
                            <Clock className="mr-2 h-4 w-4" />
                            <span>Submitted: {format(parseISO(submission.submittedAt), "MMMM d, yyyy 'at' h:mm a")}</span>
                        </div>
                         {(submission.leaveCount ?? 0) > 0 && (
                            <div className="flex items-center font-semibold text-yellow-500">
                                <AlertTriangle className="mr-2 h-4 w-4" />
                                <span>You left the test page {submission.leaveCount} time(s)</span>
                            </div>
                        )}
                    </div>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                        <Badge variant="default" className="text-base">
                            Final Score: {finalScore} / {totalPoints}
                        </Badge>
                        {needsGrading && <Badge variant="outline">Awaiting manual grade</Badge>}
                    </div>
                    {canRetake && (
                        <Button asChild>
                            <Link href={`/student/tests/${test.id}`}>
                                <RefreshCw className="mr-2 h-4 w-4" /> Retake Test
                            </Link>
                        </Button>
                    )}
                </CardFooter>
            </Card>

            <div className="mt-8 space-y-6">
                {test.questions.map((question, index) => (
                    <Card key={question.id} className="bg-card/70 backdrop-blur-sm">
                        <CardHeader>
                            <div className="flex justify-between">
                                <CardTitle>Question {index + 1}</CardTitle>
                                <Badge variant="secondary">{submission.answers.find(a => a.questionId === question.id)?.pointsAwarded ?? 'Ungraded'} / {question.points} points</Badge>
                            </div>
                            <CardDescription className="pt-2 text-base text-foreground">{question.text}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Separator className="mb-4" />
                            {renderAnswer(question)}
                             {submission.gradedScore !== undefined && question.explanation && (
                                <Alert className="mt-4 border-primary/50 bg-primary/5">
                                    <Lightbulb className="h-4 w-4 text-primary" />
                                    <AlertTitle className="text-primary">Explanation</AlertTitle>
                                    <AlertDescription>
                                        {question.explanation}
                                    </AlertDescription>
                                </Alert>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}

    