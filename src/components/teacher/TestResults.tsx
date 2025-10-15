"use client";

import { useEffect, useState } from "react";
import { Submission, Test, User } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format, parseISO } from "date-fns";
import { Loader2, Users, FileText, BarChart2 } from "lucide-react";

const TESTS_STORAGE_KEY = "offline-exam-pro-tests";
const SUBMISSIONS_STORAGE_KEY = "offline-exam-pro-submissions";
const USERS_STORAGE_KEY = "offline-exam-pro-users";

type EnrichedSubmission = Submission & {
  studentName: string;
  percentage: number;
};

export default function TestResults({ testId }: { testId: string }) {
  const [test, setTest] = useState<Test | null>(null);
  const [submissions, setSubmissions] = useState<EnrichedSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

      const enriched = testSubmissions.map(sub => {
        const student = allUsers.find(u => u.id === sub.studentId);
        const percentage = totalPoints > 0 && sub.score !== undefined ? (sub.score / totalPoints) * 100 : 0;
        return {
          ...sub,
          studentName: student?.name ?? 'Unknown Student',
          percentage,
        };
      }).sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
      
      setSubmissions(enriched);
    }
    
    setIsLoading(false);
  }, [testId]);

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  }

  if (!test) {
    return <div className="text-center text-destructive">Test not found.</div>;
  }

  const totalPoints = test.questions.reduce((sum, q) => sum + q.points, 0);
  const averageScore = submissions.length > 0 ? submissions.reduce((sum, sub) => sum + (sub.score ?? 0), 0) / submissions.length : 0;
  const averagePercentage = totalPoints > 0 ? (averageScore / totalPoints) * 100 : 0;


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
                <div className="text-2xl font-bold">{submissions.length}</div>
            </CardContent>
        </Card>
        <Card className="bg-card/70">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                <BarChart2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{averageScore.toFixed(1)} / {totalPoints} ({averagePercentage.toFixed(1)}%)</div>
            </CardContent>
        </Card>
         <Card className="bg-card/70">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Questions</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{test.questions.length}</div>
            </CardContent>
        </Card>
      </div>

      <Card className="bg-card/70">
        <CardHeader>
          <CardTitle>Student Leaderboard</CardTitle>
          <CardDescription>
            Results are ranked by score. MCQs are auto-graded. Short answer and essay questions require manual review.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Rank</TableHead>
                <TableHead>Student Name</TableHead>
                <TableHead>Submitted At</TableHead>
                <TableHead className="text-right">Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {submissions.length > 0 ? (
                submissions.map((sub, index) => (
                  <TableRow key={sub.id}>
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell>{sub.studentName}</TableCell>
                    <TableCell>{format(parseISO(sub.submittedAt), "Pp")}</TableCell>
                    <TableCell className="text-right">
                        <Badge variant={sub.percentage > 75 ? "default" : sub.percentage > 50 ? "secondary" : "destructive"}>
                            {sub.score !== undefined ? `${sub.score} / ${totalPoints} (${sub.percentage.toFixed(1)}%)` : 'Not Graded'}
                        </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    No submissions yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
