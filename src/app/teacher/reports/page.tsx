
"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Submission, Test, User } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

const TESTS_STORAGE_KEY = "exam-hub-tests";
const SUBMISSIONS_STORAGE_KEY = "exam-hub-submissions";
const USERS_STORAGE_KEY = "exam-hub-users";

type StudentReportItem = {
  id: string;
  name: string;
  registerNumber: string;
  testsTaken: number;
  averageScore: number;
};
type SortKey = 'name' | 'registerNumber' | 'testsTaken' | 'averageScore';
type SortDirection = 'asc' | 'desc';

export default function ReportsPage() {
  const { user } = useAuth();
  const [students, setStudents] = useState<StudentReportItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  useEffect(() => {
    if (user) {
      // Fetch all users to get student details
      const allUsersJson = localStorage.getItem(USERS_STORAGE_KEY);
      const allUsers: User[] = allUsersJson ? JSON.parse(allUsersJson) : [];
      const studentUsers = allUsers.filter(u => u.role === 'student');

      // Fetch tests created by the current teacher
      const allTestsJson = localStorage.getItem(TESTS_STORAGE_KEY);
      const allTests: Test[] = allTestsJson ? JSON.parse(allTestsJson) : [];
      const teacherTests = allTests.filter(t => t.teacherId === user.id);
      const teacherTestsMap = new Map(teacherTests.map(t => [t.id, t]));

      // Fetch all submissions
      const allSubmissionsJson = localStorage.getItem(SUBMISSIONS_STORAGE_KEY);
      const allSubmissions: Submission[] = allSubmissionsJson ? JSON.parse(allSubmissionsJson) : [];
      const teacherSubmissions = allSubmissions.filter(s => teacherTestsMap.has(s.testId));

      const reportMap = new Map<string, StudentReportItem>();

      for (const student of studentUsers) {
        reportMap.set(student.id, {
          id: student.id,
          name: student.name,
          registerNumber: student.registerNumber || 'N/A',
          testsTaken: 0,
          averageScore: 0,
        });
      }

      const scoreTotals: { [studentId: string]: { totalPercentage: number; count: number } } = {};

      for (const submission of teacherSubmissions) {
        if (!scoreTotals[submission.studentId]) {
          scoreTotals[submission.studentId] = { totalPercentage: 0, count: 0 };
        }

        const test = teacherTestsMap.get(submission.testId);
        if (test) {
          const finalScore = submission.gradedScore ?? submission.score ?? 0;
          const totalPoints = test.questions.reduce((sum, q) => sum + q.points, 0);
          const percentage = totalPoints > 0 ? (finalScore / totalPoints) * 100 : 0;
          
          scoreTotals[submission.studentId].totalPercentage += percentage;
          scoreTotals[submission.studentId].count += 1;
        }
      }

      Object.keys(scoreTotals).forEach(studentId => {
        const studentReport = reportMap.get(studentId);
        if (studentReport) {
          const { totalPercentage, count } = scoreTotals[studentId];
          studentReport.testsTaken = count;
          studentReport.averageScore = totalPercentage / count;
        }
      });
      
      const reportingStudents = Array.from(reportMap.values()).filter(s => s.testsTaken > 0);

      setStudents(reportingStudents);
      setIsLoading(false);
    }
  }, [user]);

  const sortedAndFilteredStudents = useMemo(() => {
    return students
      .filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.registerNumber?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => {
        const aValue = a[sortKey] || '';
        const bValue = b[sortKey] || '';
        
        let comparison = 0;
        if (aValue > bValue) {
          comparison = 1;
        } else if (aValue < bValue) {
          comparison = -1;
        }
        
        return sortDirection === 'asc' ? comparison : -comparison;
      });
  }, [students, searchTerm, sortKey, sortDirection]);

  return (
    <div className="container mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Student Reports</h1>
        <p className="text-muted-foreground">A list of all students who have completed your tests.</p>
      </div>

      <Card className="bg-card/70 backdrop-blur-sm">
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>All Students</CardTitle>
              <CardDescription>Search and sort through students who have taken your tests.</CardDescription>
            </div>
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <Input 
                placeholder="Search by name or number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Label htmlFor="sort-by">Sort By</Label>
                  <Select value={sortKey} onValueChange={(value) => setSortKey(value as SortKey)}>
                    <SelectTrigger id="sort-by" className="w-[180px]">
                      <SelectValue placeholder="Sort by..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">Student Name</SelectItem>
                      <SelectItem value="registerNumber">Register Number</SelectItem>
                      <SelectItem value="testsTaken">Tests Taken</SelectItem>
                      <SelectItem value="averageScore">Average Score</SelectItem>
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
                      <SelectItem value="asc">Ascending</SelectItem>
                      <SelectItem value="desc">Descending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-48">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Register Number</TableHead>
                  <TableHead>Student Name</TableHead>
                  <TableHead className="text-center">Tests Taken</TableHead>
                  <TableHead className="text-center">Average Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedAndFilteredStudents.length > 0 ? (
                  sortedAndFilteredStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-mono">{student.registerNumber}</TableCell>
                      <TableCell className="font-medium">{student.name}</TableCell>
                      <TableCell className="text-center">{student.testsTaken}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant={student.averageScore > 75 ? "default" : student.averageScore > 50 ? "secondary" : "destructive"}>
                            {student.averageScore.toFixed(1)}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      {students.length === 0 ? "No students have taken your tests yet." : "No students found."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
