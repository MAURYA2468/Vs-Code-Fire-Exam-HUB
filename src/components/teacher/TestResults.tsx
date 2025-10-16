
"use client";

import { useEffect, useState, useMemo } from "react";
import { Submission, Test, User } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format, parseISO } from "date-fns";
import { Loader2, Users, FileText, BarChart2, Eye, Edit, AlertTriangle, RefreshCw } from "lucide-react";
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

export default function TestResults({ testId }: { testId: string }) {
  const { toast } = useToast();
  const [test, setTest] = useState<Test | null>(null);
  const [studentGroups, setStudentGroups] = useState<StudentGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [key, setKey] = useState(0); // Used to force re-render

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

      const groups: Record<string, StudentGroup> = {};

      for(const sub of testSubmissions) {
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

        const finalScore = sub.gradedScore ?? sub.score ?? 0;
        const percentage = totalPoints > 0 ? (finalScore / totalPoints) * 100 : 0;
        
        groups[sub.studentId].submissions.push({
          ...sub,
          studentName: groups[sub.studentId].student.name,
          percentage,
          finalScore,
          isGraded: sub.gradedScore !== undefined,
        });
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
  

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  }

  if (!test) {
    return <div className="text-center text-destructive">Test not found.</div>;
  }

  const totalSubmissionsCount = studentGroups.reduce((acc, group) => acc + group.submissions.length, 0);
  const totalPoints = test.questions.reduce((sum, q) => sum + q.points, 0);
  const averageScoreAll = studentGroups.length > 0 ? studentGroups.reduce((sum, group) => sum + group.averageScore, 0) / studentGroups.length : 0;
  const averagePercentageAll = totalPoints > 0 ? (averageScoreAll / totalPoints) * 100 : 0;
  const needsManualGrading = test.questions.some(q => q.type !== 'mcq');


  return (
    <div className="container mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Results for "{test.title}"</h1>
        <p className="text-muted-foreground">
          Created on: {format(parseISO(test.createdAt), "MMMM d, yyyy")}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card className="bg-card/70">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{totalSubmissionsCount}</div>
                 <p className="text-xs text-muted-foreground">from {studentGroups.length} students</p>
            </CardContent>
        </Card>
        <Card className="bg-card/70">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Class Average (Best Scores)</CardTitle>
                <BarChart2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{averageScoreAll.toFixed(1)} / {totalPoints} ({averagePercentageAll.toFixed(1)}%)</div>
                 <p className="text-xs text-muted-foreground">Based on student's average scores</p>
            </CardContent>
        </Card>
         <Card className="bg-card/70">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Questions</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{test.questions.length}</div>
                 <p className="text-xs text-muted-foreground">&nbsp;</p>
            </CardContent>
        </Card>
      </div>

      <Card className="bg-card/70">
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
                                    <div className="flex-1 text-left font-semibold">{group.student.name}</div>
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
