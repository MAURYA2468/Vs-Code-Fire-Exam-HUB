
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/hooks/use-auth";
import { Submission, Test, User } from "@/lib/types";
import { format, parseISO } from "date-fns";
import { FileText, Users, BarChart, PlusCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const TESTS_STORAGE_KEY = "exam-hub-tests";
const SUBMISSIONS_STORAGE_KEY = "exam-hub-submissions";
const USERS_STORAGE_KEY = "exam-hub-users";

type EnrichedSubmission = Submission & {
  studentName: string;
  testTitle: string;
};

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ testCount: 0, submissionCount: 0, studentCount: 0 });
  const [recentSubmissions, setRecentSubmissions] = useState<EnrichedSubmission[]>([]);

  useEffect(() => {
    if (user) {
      // Fetch tests created by the current teacher
      const allTestsJson = localStorage.getItem(TESTS_STORAGE_KEY);
      const allTests: Test[] = allTestsJson ? JSON.parse(allTestsJson) : [];
      const teacherTests = allTests.filter(t => t.teacherId === user.id);
      const teacherTestIds = teacherTests.map(t => t.id);

      // Fetch all submissions
      const allSubmissionsJson = localStorage.getItem(SUBMISSIONS_STORAGE_KEY);
      const allSubmissions: Submission[] = allSubmissionsJson ? JSON.parse(allSubmissionsJson) : [];
      
      // Filter submissions related to the teacher's tests
      const teacherSubmissions = allSubmissions.filter(s => teacherTestIds.includes(s.testId));

      // Fetch all users
      const allUsersJson = localStorage.getItem(USERS_STORAGE_KEY);
      const allUsers: User[] = allUsersJson ? JSON.parse(allUsersJson) : [];

      // Calculate stats
      const studentIds = new Set(teacherSubmissions.map(s => s.studentId));
      setStats({
        testCount: teacherTests.length,
        submissionCount: teacherSubmissions.length,
        studentCount: studentIds.size,
      });

      // Enrich and sort recent submissions
      const enriched = teacherSubmissions
        .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
        .slice(0, 5) // Get top 5 recent
        .map(sub => {
          const student = allUsers.find(u => u.id === sub.studentId);
          const test = teacherTests.find(t => t.id === sub.testId);
          return {
            ...sub,
            studentName: student?.name ?? 'Unknown Student',
            testTitle: test?.title ?? 'Unknown Test',
          };
        });
      
      setRecentSubmissions(enriched);
    }
  }, [user]);

  return (
    <div className="container mx-auto">
      <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome, {user?.name}!</h1>
          <p className="text-muted-foreground">Here's a summary of your activity.</p>
        </div>
        <Button asChild size="lg">
          <Link href="/teacher/tests/create">
            <PlusCircle className="mr-2 h-5 w-5" />
            Create New Test
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card className="bg-card/70">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Tests</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{stats.testCount}</div>
                 <p className="text-xs text-muted-foreground">Tests created by you</p>
            </CardContent>
        </Card>
        <Card className="bg-card/70">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
                <BarChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{stats.submissionCount}</div>
                <p className="text-xs text-muted-foreground">Across all your tests</p>
            </CardContent>
        </Card>
         <Card className="bg-card/70">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Unique Students</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{stats.studentCount}</div>
                 <p className="text-xs text-muted-foreground">Have taken your tests</p>
            </CardContent>
        </Card>
      </div>

      <Card className="bg-card/70 backdrop-blur-sm">
        <CardHeader>
            <CardTitle>Recent Submissions</CardTitle>
            <CardDescription>The latest 5 submissions from your students.</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Test</TableHead>
                        <TableHead>Submitted At</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {recentSubmissions.length > 0 ? (
                        recentSubmissions.map(sub => (
                            <TableRow key={sub.id}>
                                <TableCell>{sub.studentName}</TableCell>
                                <TableCell className="font-medium">{sub.testTitle}</TableCell>
                                <TableCell>{format(parseISO(sub.submittedAt), "Pp")}</TableCell>
                                <TableCell className="text-right">
                                    <Button asChild variant="ghost" size="sm">
                                        <Link href={`/teacher/tests/${sub.testId}/results`}>
                                            View Results <ArrowRight className="ml-2 h-4 w-4" />
                                        </Link>
                                    </Button>
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
