"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Submission, Test, User } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Users } from "lucide-react";
import { Input } from "@/components/ui/input";

const TESTS_STORAGE_KEY = "exam-hub-tests";
const SUBMISSIONS_STORAGE_KEY = "exam-hub-submissions";
const USERS_STORAGE_KEY = "exam-hub-users";

type StudentReportItem = Pick<User, 'id' | 'name' | 'registerNumber'>;

export default function ReportsPage() {
  const { user } = useAuth();
  const [students, setStudents] = useState<StudentReportItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

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

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.registerNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Student Reports</h1>
        <p className="text-muted-foreground">A list of all students who have completed your tests.</p>
      </div>

      <Card className="bg-card/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>All Students</CardTitle>
          <CardDescription>Search for students by name or registration number.</CardDescription>
            <div className="pt-4">
                <Input 
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                />
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
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-mono">{student.registerNumber}</TableCell>
                      <TableCell className="font-medium">{student.name}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={2} className="h-24 text-center">
                      {students.length === 0 ? "No students have taken your tests yet." : "No students found with that search term."}
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