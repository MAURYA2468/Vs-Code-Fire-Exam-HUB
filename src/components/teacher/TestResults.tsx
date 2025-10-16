
"use client";

import { useEffect, useState, useMemo } from "react";
import { Submission, Test, User, Question } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format, parseISO } from "date-fns";
import { Loader2, Users, FileText, BarChart2, Eye, Edit, AlertTriangle, RefreshCw, ChevronsUp, ChevronsDown, CheckCircle, XCircle } from "lucide-react";
import { Button } from "../ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "../ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { useToast } from "@/hooks/use-toast";


const TESTS_STORAGE_KEY = "exam-hub-tests";
const SUBMISSIONS_STORAGE_KEY = "exam-hub-submissions";
const USERS_STORAGE_KEY = "exam-hub-users";

type EnrichedSubmission = Submission & {
  studentName: string;
  percentage: number;
  finalScore: number;
  isGraded: boolean;
};

type StudentGroup = {
  student: User;
  submissions: EnrichedSubmission[];
  bestScore: number;
  latestScore: number;
  averageScore: number;
}

type QuestionStats = {
  question: Question;
  correct: number;
  incorrect: number;
  unanswered: number;
  accuracy: number;
}

const QuestionAnalytics = ({ test, submissions }: { test: Test, submissions: EnrichedSubmission[] }) => {
    const questionStats: QuestionStats[] = useMemo(() => {
        if (!test || submissions.length === 0) return [];

        return test.questions.map(q => {
            let correct = 0;
            let incorrect = 0;
            let unanswered = 0;

            submissions.forEach(sub => {
                const answer = sub.answers.find(a => a.questionId === q.id);
                if (!answer || !answer.value) {
                    unanswered++;
                } else if (q.type === 'mcq') {
                    if (answer.value === q.correctAnswer) {
                        correct++;
                    } else {
                        incorrect++;
                    }
                }
                // For other types, we can't auto-determine correctness here.
            });
            const totalAnswered = correct + incorrect;
            const accuracy = totalAnswered > 0 ? (correct / totalAnswered) * 100 : 0;
            return { question: q, correct, incorrect, unanswered, accuracy };
        });
    }, [test, submissions]);

    return (
        <Card className="bg-card/70">
            <CardHeader>
                <CardTitle>Question-wise Analysis</CardTitle>
                <CardDescription>Performance breakdown for each question across all submissions.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Question</TableHead>
                            <TableHead className="text-center">Accuracy</TableHead>
                            <TableHead className="text-center">Correct</TableHead>
                            <TableHead className="text-center">Incorrect</TableHead>
                            <TableHead className="text-center">Unanswered</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {questionStats.map(stat => (
                            <TableRow key={stat.question.id}>
                                <TableCell className="max-w-xs truncate">{stat.question.text}</TableCell>
                                <TableCell className="text-center">
                                    <Badge variant={stat.accuracy > 75 ? "default" : stat.accuracy > 50 ? "secondary" : "destructive"}>
                                        {stat.question.type === 'mcq' ? `${stat.accuracy.toFixed(1)}%` : 'N/A'}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-center font-medium text-green-600">{stat.correct}</TableCell>
                                <TableCell className="text-center font-medium text-red-600">{stat.incorrect}</TableCell>
                                <TableCell className="text-center font-medium text-muted-foreground">{stat.unanswered}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
};


export default function TestResults({ testId }: { testId: string }) {
  const { toast } = useToast();
  const [test, setTest] = useState<Test | null>(null);
  const [studentGroups, setStudentGroups] = useState<StudentGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [key, setKey] = useState(0); // Used to force re-render
  const [allSubmissions, setAllSubmissions] = useState<EnrichedSubmission[]>([]);


  useEffect(() => {
    if (!testId) {
        setIsLoading(false);
        return;
    };
    const allTestsJson = localStorage.getItem(TESTS_STORAGE_KEY);
    const allTests: Test[] = allTestsJson ? JSON.parse(allTestsJson) : [];
    const foundTest = allTests.find(t => t.id === testId);
    setTest(foundTest || null);

    if (foundTest) {
      const allSubmissionsJson = localStorage.getItem(SUBMISSIONS_STORAGE_KEY);
      const allSubmissions: Submission[] = allSubmissionsJson ? JSON.parse(allSubmissionsJson) : [];
      const testSubmissions = allSubmissions.filter(s => s.testId === testId);
      
      const allUsersJson = localStorage.getItem(USERS_STORAGE_KEY);
      const allUsers: User[] = allUsersJson ? JSON.parse(allUsersJson) : [];

      const totalPoints = foundTest.questions.reduce((sum, q) => sum + q.points, 0);
      
      const enrichedSubs: EnrichedSubmission[] = testSubmissions.map(sub => {
          const student = allUsers.find(u => u.id === sub.studentId);
          const finalScore = sub.gradedScore ?? sub.score ?? 0;
          const percentage = totalPoints > 0 ? (finalScore / totalPoints) * 100 : 0;
          return {
              ...sub,
              studentName: student?.name ?? 'Unknown Student',
              percentage,
              finalScore,
              isGraded: sub.gradedScore !== undefined,
          };
      });
      setAllSubmissions(enrichedSubs);

      const groups: Record<string, StudentGroup> = {};

      for(const sub of enrichedSubs) {
        if (!groups[sub.studentId]) {
          const student = allUsers.find(u => u.id === sub.studentId);
          if (!student) continue;

          groups[sub.studentId] = {
            student,
            submissions: [],
            bestScore: 0,
            latestScore: 0,
            averageScore: 0
          }
        }
        groups[sub.studentId].submissions.push(sub);
      }

      Object.values(groups).forEach(group => {
        group.submissions.sort((a,b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
        group.bestScore = Math.max(...group.submissions.map(s => s.finalScore));
        group.latestScore = group.submissions[0]?.finalScore ?? 0;
        group.averageScore = group.submissions.reduce((acc, s) => acc + s.finalScore, 0) / group.submissions.length;
      });
      
      setStudentGroups(Object.values(groups));
    }
    
    setIsLoading(false);
  }, [testId, key]);

  const resetStudentAttempts = (studentId: string) => {
    const allSubmissionsJson = localStorage.getItem(SUBMISSIONS_STORAGE_KEY);
    let allSubmissions: Submission[] = allSubmissionsJson ? JSON.parse(allSubmissionsJson) : [];
    
    const submissionsToKeep = allSubmissions.filter(s => !(s.studentId === studentId && s.testId === testId));
    
    localStorage.setItem(SUBMISSIONS_STORAGE_KEY, JSON.stringify(submissionsToKeep));

    const studentName = studentGroups.find(g => g.student.id === studentId)?.student.name;
    toast({
        title: "Attempts Reset",
        description: `All attempts for ${studentName} on this test have been deleted.`,
    });
    setKey(prev => prev + 1); // Force re-render
  };
  

  const analytics = useMemo(() => {
    if (studentGroups.length === 0) {
      return {
        totalSubmissionsCount: 0,
        averageScoreAll: 0,
        averagePercentageAll: 0,
        highestScore: 0,
        lowestScore: 0,
      };
    }
    
    const totalPoints = test?.questions.reduce((sum, q) => sum + q.points, 0) ?? 0;
    const allBestScores = studentGroups.map(g => g.bestScore);
    const averageScoreAll = studentGroups.reduce((sum, group) => sum + group.averageScore, 0) / studentGroups.length;
    const averagePercentageAll = totalPoints > 0 ? (averageScoreAll / totalPoints) * 100 : 0;
    const highestScore = Math.max(...allBestScores);
    const lowestScore = Math.min(...allBestScores);

    return {
      totalSubmissionsCount: allSubmissions.length,
      averageScoreAll: averageScoreAll,
      averagePercentageAll,
      highestScore,
      lowestScore,
    }
  }, [studentGroups, test, allSubmissions]);


  if (isLoading) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  }

  if (!test) {
    return <div className="text-center text-destructive">Test not found.</div>;
  }

  const totalPoints = test.questions.reduce((sum, q) => sum + q.points, 0);
  const needsManualGrading = test.questions.some(q => q.type !== 'mcq');


  return (
    <div className="container mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Results for "{test.title}"</h1>
        <p className="text-muted-foreground">
          Created on: {format(parseISO(test.createdAt), "MMMM d, yyyy")}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card className="bg-card/70">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{analytics.totalSubmissionsCount}</div>
                 <p className="text-xs text-muted-foreground">from {studentGroups.length} students</p>
            </CardContent>
        </Card>
        <Card className="bg-card/70">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Class Average (Best Scores)</CardTitle>
                <BarChart2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{analytics.averageScoreAll.toFixed(1)} / {totalPoints} ({analytics.averagePercentageAll.toFixed(1)}%)</div>
                 <p className="text-xs text-muted-foreground">Based on student's average scores</p>
            </CardContent>
        </Card>
        <Card className="bg-card/70">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Highest Score</CardTitle>
                <ChevronsUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{analytics.highestScore.toFixed(1)} / {totalPoints}</div>
                 <p className="text-xs text-muted-foreground">&nbsp;</p>
            </CardContent>
        </Card>
         <Card className="bg-card/70">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Lowest Score</CardTitle>
                <ChevronsDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{analytics.lowestScore.toFixed(1)} / {totalPoints}</div>
                 <p className="text-xs text-muted-foreground">&nbsp;</p>
            </CardContent>
        </Card>
      </div>

       {allSubmissions.length > 0 && <QuestionAnalytics test={test} submissions={allSubmissions} />}

      <Card className="bg-card/70 mt-8">
        <CardHeader>
            <CardTitle>Student Submissions</CardTitle>
            <CardDescription>
                Review submissions from all students. Expand to see attempt history.
            </CardDescription>
        </CardHeader>
        <CardContent>
            {studentGroups.length === 0 ? (
                 <div className="h-24 text-center content-center text-muted-foreground">No submissions yet.</div>
            ) : (
                <Accordion type="single" collapsible className="w-full">
                    {studentGroups.sort((a,b) => b.bestScore - a.bestScore).map((group) => (
                        <AccordionItem value={group.student.id} key={group.student.id}>
                            <AccordionTrigger className="hover:no-underline">
                                <div className="flex w-full items-center justify-between pr-4">
                                    <div className="flex-1 text-left font-semibold">
                                        {group.student.name}
                                        {group.student.registerNumber && <span className="ml-2 font-mono text-xs text-muted-foreground">({group.student.registerNumber})</span>}
                                    </div>
                                    <div className="flex-1 text-center hidden sm:block"><Badge variant="secondary">{group.submissions.length} {group.submissions.length === 1 ? "attempt" : "attempts"}</Badge></div>
                                    <div className="flex-1 text-center hidden md:block">Best: <Badge>{group.bestScore.toFixed(1)} / {totalPoints}</Badge></div>
                                    <div className="flex-1 text-right">Latest: <Badge variant="outline">{group.latestScore.toFixed(1)} / {totalPoints}</Badge></div>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>
                                <div className="p-2 bg-muted/20 rounded-md">
                                    <div className="flex justify-end mb-4">
                                        <Button size="sm" variant="destructive" onClick={() => resetStudentAttempts(group.student.id)}>
                                            <RefreshCw className="mr-2 h-4 w-4"/> Reset All Attempts
                                        </Button>
                                    </div>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Attempt</TableHead>
                                                <TableHead>Submitted At</TableHead>
                                                <TableHead>Score</TableHead>
                                                {needsManualGrading && <TableHead>Status</TableHead>}
                                                <TableHead className="text-center">Away</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {group.submissions.map(sub => (
                                                <TableRow key={sub.id}>
                                                    <TableCell className="font-medium">#{sub.attemptNumber}</TableCell>
                                                    <TableCell>{format(parseISO(sub.submittedAt), "Pp")}</TableCell>
                                                    <TableCell>
                                                        <Badge variant={sub.percentage > 75 ? "default" : sub.percentage > 50 ? "secondary" : "destructive"}>
                                                            {`${sub.finalScore} / ${totalPoints} (${sub.percentage.toFixed(1)}%)`}
                                                        </Badge>
                                                    </TableCell>
                                                     {needsManualGrading &&
                                                        <TableCell>
                                                            {!sub.isGraded ? (
                                                                <Badge variant="outline">Ungraded</Badge>
                                                            ) : (
                                                                <Badge variant="secondary">Graded</Badge>
                                                            )}
                                                        </TableCell>
                                                    }
                                                    <TableCell className="text-center font-medium">
                                                        {(sub.leaveCount ?? 0) > 0 ? (
                                                            <div className="flex items-center justify-center gap-1 text-yellow-500">
                                                            <AlertTriangle className="h-4 w-4" />
                                                            {sub.leaveCount}
                                                            </div>
                                                        ) : (
                                                            <span>0</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-right space-x-2">
                                                        <Button asChild variant="outline" size="sm">
                                                            <Link href={`/teacher/tests/${testId}/submissions/${sub.id}`}>
                                                                <Eye className="mr-2 h-4 w-4" /> View
                                                            </Link>
                                                        </Button>
                                                        {needsManualGrading &&
                                                            <Button asChild size="sm">
                                                                <Link href={`/teacher/tests/${testId}/grade/${sub.id}`}>
                                                                    <Edit className="mr-2 h-4 w-4" /> Grade
                                                                </Link>
                                                            </Button>
                                                        }
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
