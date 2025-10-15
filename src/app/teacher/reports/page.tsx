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

const TESTS_STORAGE_KEY = "exam-hub-tests";
const SUBMISSIONS_STORAGE_KEY = "exam-hub-submissions";
const USERS_STORAGE_KEY = "exam-hub-users";

type StudentReportItem = Pick<User, 'id' | 'name' | 'registerNumber'>;
type SortKey = 'name' | 'registerNumber';
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
      const teacherTestIds = new Set(teacherTests.map(t => t.id));

      // Fetch all submissions
      const allSubmissionsJson = localStorage.getItem(SUBMISSIONS_STORAGE_KEY);
      const allSubmissions: Submission[] = allSubmissionsJson ? JSON.parse(allSubmissionsJson) : [];

      // Find unique student IDs who submitted to this teacher's tests
      const studentIdsWhoSubmitted = new Set(
        allSubmissions
          .filter(s => teacherTestIds.has(s.testId))
          .map(s => s.studentId)
      );

      // Filter the student list to only those who have submitted
      const reportingStudents = studentUsers
        .filter(student => studentIdsWhoSubmitted.has(student.id))
        .map(({ id, name, registerNumber }) => ({ id, name, registerNumber: registerNumber || 'N/A' }));

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
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedAndFilteredStudents.length > 0 ? (
                  sortedAndFilteredStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-mono">{student.registerNumber}</TableCell>
                      <TableCell className="font-medium">{student.name}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={2} className="h-24 text-center">
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