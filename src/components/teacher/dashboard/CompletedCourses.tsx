
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, Clock } from "lucide-react"
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import { Test, Submission, User } from "@/lib/types";

const TESTS_STORAGE_KEY = "exam-hub-tests";
const SUBMISSIONS_STORAGE_KEY = "exam-hub-submissions";
const USERS_STORAGE_KEY = "exam-hub-users";

type CourseProgress = {
  name: string;
  status: "Completed" | "In Progress";
  progress: number;
};

export default function CompletedCourses() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<CourseProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const allUsersJson = localStorage.getItem(USERS_STORAGE_KEY);
      const allUsers: User[] = allUsersJson ? JSON.parse(allUsersJson) : [];
      const studentCount = allUsers.filter(u => u.role === 'student').length;
      
      const allTestsJson = localStorage.getItem(TESTS_STORAGE_KEY);
      const allTests: Test[] = allTestsJson ? JSON.parse(allTestsJson) : [];
      const teacherTests = allTests.filter(t => t.teacherId === user.id);
      
      const allSubmissionsJson = localStorage.getItem(SUBMISSIONS_STORAGE_KEY);
      const allSubmissions: Submission[] = allSubmissionsJson ? JSON.parse(allSubmissionsJson) : [];

      const courseProgress: CourseProgress[] = teacherTests.map(test => {
        const submissionsForTest = allSubmissions.filter(s => s.testId === test.id);
        const uniqueStudentSubmissions = new Set(submissionsForTest.map(s => s.studentId)).size;
        
        let progress = 0;
        if (studentCount > 0) {
            progress = (uniqueStudentSubmissions / studentCount) * 100;
        }

        return {
          name: test.title,
          status: progress === 100 ? "Completed" : "In Progress",
          progress: progress
        };
      }).slice(0, 3); // Limiting to show top 3 for brevity in dashboard

      setCourses(courseProgress);
      setIsLoading(false);
    }
  }, [user]);

  if (isLoading) {
    return (
        <Card className="bg-card/70 backdrop-blur-sm">
            <CardHeader>
                <CardTitle>Completed Courses</CardTitle>
                <CardDescription>An overview of recently finished test cycles.</CardDescription>
            </CardHeader>
            <CardContent>
                <p>Loading course progress...</p>
            </CardContent>
        </Card>
    );
  }

  return (
    <Card className="bg-card/70 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Test Completion Overview</CardTitle>
        <CardDescription>An overview of student submission progress for your tests.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {courses.length > 0 ? courses.map((course, index) => (
          <div key={index} className="flex items-center">
            {course.status === "Completed" ? (
                <CheckCircle className="h-5 w-5 text-green-500 mr-4" />
            ) : (
                <Clock className="h-5 w-5 text-yellow-500 mr-4" />
            )}
            <div className="flex-grow">
              <p className="font-medium truncate">{course.name}</p>
              <Progress value={course.progress} className="h-2 mt-1" />
            </div>
          </div>
        )) : (
            <div className="text-center text-muted-foreground h-24 content-center">
                No tests created yet.
            </div>
        )}
      </CardContent>
    </Card>
  )
}
