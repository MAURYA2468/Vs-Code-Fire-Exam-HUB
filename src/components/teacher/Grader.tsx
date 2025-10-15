"use client";

import { useEffect, useState } from "react";
import { Submission, Test, User, Question } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, parseISO } from "date-fns";
import { Loader2, User as UserIcon, Clock, CheckCircle, XCircle, Save } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

const TESTS_STORAGE_KEY = "offline-exam-pro-tests";
const SUBMISSIONS_STORAGE_KEY = "offline-exam-pro-submissions";
const USERS_STORAGE_KEY = "offline-exam-pro-users";

const answerSchema = z.object({
    questionId: z.string(),
    pointsAwarded: z.coerce.number().optional(),
});

const gradingSchema = z.object({
  answers: z.array(answerSchema),
});

type GradingFormData = z.infer<typeof gradingSchema>;

interface GraderProps {
    testId: string;
    submissionId: string;
}

export default function Grader({ testId, submissionId }: GraderProps) {
    const { toast } = useToast();
    const router = useRouter();

    const [test, setTest] = useState<Test | null>(null);
    const [submission, setSubmission] = useState<Submission | null>(null);
    const [student, setStudent] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const form = useForm<GradingFormData>({
        resolver: zodResolver(gradingSchema),
        defaultValues: {
            answers: [],
        },
    });
    
    const { fields } = useFieldArray({
        control: form.control,
        name: "answers",
    });

    useEffect(() => {
        if (!testId || !submissionId) {
            setIsLoading(false);
            return;
        }

        const allTestsJson = localStorage.getItem(TESTS_STORAGE_KEY);
        const allTests: Test[] = allTestsJson ? JSON.parse(allTestsJson) : [];
        const foundTest = allTests.find(t => t.id === testId);
        setTest(foundTest || null);

        const allSubmissionsJson = localStorage.getItem(SUBMISSIONS_STORAGE_KEY);
        const allSubmissions: Submission[] = allSubmissionsJson ? JSON.parse(allSubmissionsJson) : [];
        const foundSubmission = allSubmissions.find(s => s.id === submissionId);
        setSubmission(foundSubmission || null);

        if (foundSubmission) {
            const allUsersJson = localStorage.getItem(USERS_STORAGE_KEY);
            const allUsers: User[] = allUsersJson ? JSON.parse(allUsersJson) : [];
            const foundStudent = allUsers.find(u => u.id === foundSubmission.studentId);
            setStudent(foundStudent || null);

            // Initialize form with existing submission data
            const answerFields = foundTest?.questions.map(q => {
                const answer = foundSubmission.answers.find(a => a.questionId === q.id);
                return {
                    questionId: q.id,
                    pointsAwarded: answer?.pointsAwarded ?? (q.type === 'mcq' && answer?.value === q.correctAnswer ? q.points : 0),
                }
            })
            form.reset({ answers: answerFields });
        }

        setIsLoading(false);
    }, [testId, submissionId, form]);

    const getStudentAnswerValue = (questionId: string) => {
        return submission?.answers.find(a => a.questionId === questionId)?.value ?? "";
    };
    
    const onSubmit = (data: GradingFormData) => {
        const allSubmissionsJson = localStorage.getItem(SUBMISSIONS_STORAGE_KEY);
        let allSubmissions: Submission[] = allSubmissionsJson ? JSON.parse(allSubmissionsJson) : [];
        const submissionIndex = allSubmissions.findIndex(s => s.id === submissionId);

        if (submissionIndex === -1 || !test) return;

        let totalGradedScore = 0;
        const updatedAnswers = submission!.answers.map(originalAnswer => {
            const gradedAnswer = data.answers.find(a => a.questionId === originalAnswer.questionId);
            const points = gradedAnswer?.pointsAwarded ?? 0;
            totalGradedScore += points;
            return {
                ...originalAnswer,
                pointsAwarded: points,
            };
        });

        allSubmissions[submissionIndex].answers = updatedAnswers;
        allSubmissions[submissionIndex].gradedScore = totalGradedScore;
        
        localStorage.setItem(SUBMISSIONS_STORAGE_KEY, JSON.stringify(allSubmissions));

        toast({
            title: "Grades Saved!",
            description: `The scores for ${student?.name} have been updated.`,
        });
        router.push(`/teacher/tests/${testId}/results`);
        router.refresh(); // To reflect changes on the results page
    };

    const renderGrader = (question: Question, index: number) => {
        const studentAnswerValue = getStudentAnswerValue(question.id);
        const isMCQ = question.type === 'mcq';

        if (isMCQ) {
            const studentAnswerOption = question.options?.find(o => o.id === studentAnswerValue);
            const isCorrect = studentAnswerValue === question.correctAnswer;
            return (
                <div>
                    <p className="font-semibold text-muted-foreground">Student's Answer:</p>
                    <div className={`mt-2 rounded-md border p-3 ${isCorrect ? 'border-green-500 bg-green-500/10' : 'border-red-500 bg-red-500/10'}`}>
                        <p className="flex items-center">
                            {isCorrect ? <CheckCircle className="mr-2 h-5 w-5 text-green-500" /> : <XCircle className="mr-2 h-5 w-5 text-red-500" />}
                            {studentAnswerOption?.text || <span className="italic text-muted-foreground">No answer</span>}
                        </p>
                    </div>
                </div>
            )
        }

        return (
            <div>
                <p className="font-semibold text-muted-foreground">Student's Answer:</p>
                <p className="mt-2 whitespace-pre-wrap rounded-md border bg-muted/30 p-3">{studentAnswerValue || <span className="italic text-muted-foreground">No answer</span>}</p>
                <FormField
                    control={form.control}
                    name={`answers.${index}.pointsAwarded`}
                    render={({ field }) => (
                        <FormItem className="mt-4">
                            <FormLabel>Awarded Points</FormLabel>
                            <FormControl>
                                <Input type="number" {...field} max={question.points} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
        );
    };

    if (isLoading) {
        return <div className="flex h-screen items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
    }

    if (!test || !submission || !student) {
        return <div className="text-center text-destructive">Could not load submission details for grading.</div>;
    }

    const totalPoints = test.questions.reduce((sum, q) => sum + q.points, 0);

    return (
        <div className="container mx-auto">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-2xl">Grade Submission</CardTitle>
                            <CardDescription>Reviewing submission for test: <span className="font-semibold text-primary">{test.title}</span></CardDescription>
                            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-4 text-sm text-muted-foreground">
                                <div className="flex items-center">
                                    <UserIcon className="mr-2 h-4 w-4" />
                                    <span>Student: <span className="font-bold text-foreground">{student.name}</span> ({student.email})</span>
                                </div>
                                <div className="flex items-center">
                                    <Clock className="mr-2 h-4 w-4" />
                                    <span>Submitted: {format(parseISO(submission.submittedAt), "MMMM d, yyyy 'at' h:mm a")}</span>
                                </div>
                            </div>
                        </CardHeader>
                        <CardFooter className="flex justify-between items-center">
                             <Badge variant="secondary">
                                Final Score: {form.watch('answers').reduce((sum, a) => sum + (a.pointsAwarded || 0), 0)} / {totalPoints}
                            </Badge>
                             <Button type="submit" disabled={form.formState.isSubmitting}>
                                <Save className="mr-2 h-4 w-4" />
                                {form.formState.isSubmitting ? "Saving..." : "Save Grades"}
                            </Button>
                        </CardFooter>
                    </Card>

                    <div className="mt-8 space-y-6">
                        {test.questions.map((question, index) => (
                            <Card key={question.id} className="bg-card/70 backdrop-blur-sm">
                                <CardHeader>
                                    <div className="flex justify-between">
                                        <CardTitle>Question {index + 1}</CardTitle>
                                        <Badge variant="outline">{question.points} {question.points === 1 ? 'point' : 'points'}</Badge>
                                    </div>
                                    <CardDescription className="pt-2 text-base text-foreground">{question.text}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Separator className="mb-4" />
                                    {renderGrader(question, index)}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </form>
            </Form>
        </div>
    );
}
