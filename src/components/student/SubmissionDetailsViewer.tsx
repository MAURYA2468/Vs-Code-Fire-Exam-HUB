
"use client";

import { useEffect, useState } from "react";
import { Submission, Test, User, Question } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, parseISO } from "date-fns";
import { Loader2, User as UserIcon, Clock, CheckCircle, XCircle, HelpCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const TESTS_STORAGE_KEY = "exam-hub-tests";
const SUBMISSIONS_STORAGE_KEY = "exam-hub-submissions";
const USERS_STORAGE_KEY = "exam-hub-users";

interface SubmissionViewerProps {
    submissionId: string;
}

export default function SubmissionDetailsViewer({ submissionId }: SubmissionViewerProps) {
    const [test, setTest] = useState<Test | null>(null);
    const [submission, setSubmission] = useState<Submission | null>(null);
    const [student, setStudent] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

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

        switch (question.type) {
            case 'mcq':
                const studentAnswerOption = question.options?.find(o => o.id === studentAnswerValue);
                const correctAnswerOption = question.options?.find(o => o.id === question.correctAnswer);
                const isCorrect = studentAnswerValue === question.correctAnswer;

                return (
                    <div>
                        <p className="font-semibold text-muted-foreground">Your Answer:</p>
                        <div className={`mt-2 rounded-md border p-3 ${isCorrect ? 'border-green-500 bg-green-500/10' : 'border-red-500 bg-red-500/10'}`}>
                            <p className="flex items-center">
                                {isCorrect ? <CheckCircle className="mr-2 h-5 w-5 text-green-500" /> : <XCircle className="mr-2 h-5 w-5 text-red-500" />}
                                {studentAnswerOption?.text || <span className="italic text-muted-foreground">No answer</span>}
                            </p>
                        </div>
                        {!isCorrect && correctAnswerOption && (
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
                        {awardedPoints !== undefined && (
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
    const finalScore = submission.gradedScore ?? submission.score ?? 0;
    const needsGrading = submission.gradedScore === undefined && test.questions.some(q => q.type !== 'mcq');

    return (
        <div className="container mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">Results for: <span className="font-semibold text-primary">{test.title}</span></CardTitle>
                    <CardDescription>Review of your submission.</CardDescription>
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-4 text-sm text-muted-foreground">
                        <div className="flex items-center">
                            <UserIcon className="mr-2 h-4 w-4" />
                            <span>{student.name}</span>
                        </div>
                        <div className="flex items-center">
                            <Clock className="mr-2 h-4 w-4" />
                            <span>Submitted: {format(parseISO(submission.submittedAt), "MMMM d, yyyy 'at' h:mm a")}</span>
                        </div>
                    </div>
                </CardHeader>
                <CardFooter>
                    <div className="flex items-center gap-4">
                        <Badge variant="default" className="text-base">
                            Final Score: {finalScore} / {totalPoints}
                        </Badge>
                        {needsGrading && <Badge variant="outline">Awaiting manual grade</Badge>}
                    </div>
                </CardFooter>
            </Card>

            <div className="mt-8 space-y-6">
                {test.questions.map((question, index) => (
                    <Card key={question.id} className="bg-card/70 backdrop-blur-sm">
                        <CardHeader>
                            <div className="flex justify-between">
                                <CardTitle>Question {index + 1}</CardTitle>
                                <Badge variant="secondary">{submission.answers.find(a => a.questionId === question.id)?.pointsAwarded ?? (question.type === 'mcq' ? (getStudentAnswer(question.id)?.value === question.correctAnswer ? question.points : 0) : 'Ungraded')} / {question.points} points</Badge>
                            </div>
                            <CardDescription className="pt-2 text-base text-foreground">{question.text}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Separator className="mb-4" />
                            {renderAnswer(question)}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
