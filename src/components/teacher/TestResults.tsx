
"use client";

import { useEffect, useState, useMemo } from "react";
import { Submission, Test, User } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format, parseISO } from "date-fns";
import { Loader2, Users, FileText, BarChart2, Eye, Edit, AlertTriangle } from "lucide-react";
import { Button } from "../ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "../ui/label";

const TESTS_STORAGE_KEY = "exam-hub-tests";
const SUBMISSIONS_STORAGE_KEY = "exam-hub-submissions";
const USERS_STORAGE_KEY = "exam-hub-users";

type EnrichedSubmission = Submission & {
  studentName: string;
  percentage: number;
  finalScore: number;
  isGraded: boolean;
};

type SortKey = "studentName" | "submittedAt" | "finalScore" | "isGraded";
type SortDirection = "asc" | "desc";

export default function TestResults({ testId }: { testId: string }) {
  const [test, setTest] = useState<Test | null>(null);
  const [submissions, setSubmissions] = useState<EnrichedSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortKey, setSortKey] = useState<SortKey>("finalScore");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

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
      
      setSubmissions(enriched);
    }
    
    setIsLoading(false);
  }, [testId]);
  
  const sortedSubmissions = useMemo(() => {
    return [...submissions].sort((a, b) => {
      if (sortKey === 'isGraded') {
          // False (ungraded) should come before true (graded)
          if (a.isGraded === b.isGraded) return 0;
          if (sortDirection === 'asc') {
            return a.isGraded ? 1 : -1;
          }
          return a.isGraded ? -1 : 1;
      }
      
      const aValue = a[sortKey];
      const bValue = b[sortKey];

      if (sortKey === 'submittedAt') {
        return sortDirection === 'asc' 
          ? new Date(aValue as string).getTime() - new Date(bValue as string).getTime() 
          : new Date(bValue as string).getTime() - new Date(aValue as string).getTime();
      }

      if (aValue < bValue) {
        return sortDirection === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [submissions, sortKey, sortDirection]);

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  }

  if (!test) {
    return <div className="text-center text-destructive">Test not found.</div>;
  }

  const totalPoints = test.questions.reduce((sum, q) => sum + q.points, 0);
  const averageScore = submissions.length > 0 ? submissions.reduce((sum, sub) => sum + (sub.finalScore), 0) / submissions.length : 0;
  const averagePercentage = totalPoints > 0 ? (averageScore / totalPoints) * 100 : 0;
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
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Student Leaderboard</CardTitle>
              <CardDescription>
                Results are ranked by score. MCQs are auto-graded. Short answer and essay questions require manual review.
              </CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Label htmlFor="sort-by">Sort By</Label>
                <Select value={sortKey} onValueChange={(value) => setSortKey(value as SortKey)}>
                  <SelectTrigger id="sort-by" className="w-[150px]">
                    <SelectValue placeholder="Sort by..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="finalScore">Score</SelectItem>
                    <SelectItem value="studentName">Student Name</SelectItem>
                    <SelectItem value="submittedAt">Date</SelectItem>
                    <SelectItem value="isGraded">Status</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                 <Label htmlFor="sort-dir">Order</Label>
                <Select value={sortDirection} onValueChange={(value) => setSortDirection(value as SortDirection)}>
                   <SelectTrigger id="sort-dir" className="w-[120px]">
                    <SelectValue placeholder="Order..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desc">Descending</SelectItem>
                    <SelectItem value="asc">Ascending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Rank</TableHead>
                <TableHead>Student Name</TableHead>
                <TableHead>Submitted At</TableHead>
                <TableHead>Score</TableHead>
                {needsManualGrading && <TableHead>Status</TableHead>}
                <TableHead className="text-center">Away</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedSubmissions.length > 0 ? (
                sortedSubmissions.map((sub, index) => (
                  <TableRow 
                    key={sub.id} 
                    className="animate-table-row-fade-in"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <TableCell className="font-medium">{sortKey === "finalScore" && sortDirection === "desc" ? index + 1 : "-"}</TableCell>
                    <TableCell>{sub.studentName}</TableCell>
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
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={needsManualGrading ? 7 : 6} className="h-24 text-center">
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
