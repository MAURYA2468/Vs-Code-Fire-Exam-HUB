"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useEffect, useState } from "react";
import { User, Test, Submission } from "@/lib/types";
import { useAuth } from "@/hooks/use-auth";

const USERS_STORAGE_KEY = "exam-hub-users";
const TESTS_STORAGE_KEY = "exam-hub-tests";
const SUBMISSIONS_STORAGE_KEY = "exam-hub-submissions";

type Ranking = {
  rank: number;
  name: string;
  score: number;
  level: 'Advanced' | 'Intermediate' | 'Beginner';
  avatarId: string;
};

export default function CommunityRankings() {
  const { user } = useAuth();
  const [rankings, setRankings] = useState<Ranking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      // Fetch all data
      const allUsersJson = localStorage.getItem(USERS_STORAGE_KEY);
      const allUsers: User[] = allUsersJson ? JSON.parse(allUsersJson) : [];
      const studentUsers = allUsers.filter(u => u.role === 'student');

      const allTestsJson = localStorage.getItem(TESTS_STORAGE_KEY);
      const allTests: Test[] = allTestsJson ? JSON.parse(allTestsJson) : [];
      const teacherTests = allTests.filter(t => t.teacherId === user.id);
      const teacherTestsMap = new Map(teacherTests.map(t => [t.id, t]));

      const allSubmissionsJson = localStorage.getItem(SUBMISSIONS_STORAGE_KEY);
      const allSubmissions: Submission[] = allSubmissionsJson ? JSON.parse(allSubmissionsJson) : [];
      const teacherSubmissions = allSubmissions.filter(s => teacherTestsMap.has(s.testId));

      // Calculate average score for each student
      const studentScores: { [studentId: string]: { totalPercentage: number, count: number, name: string, id: string } } = {};

      for (const student of studentUsers) {
        studentScores[student.id] = { totalPercentage: 0, count: 0, name: student.name, id: student.id };
      }
      
      for (const submission of teacherSubmissions) {
        const test = teacherTestsMap.get(submission.testId);
        if (test) {
          const finalScore = submission.gradedScore ?? submission.score ?? 0;
          const totalPoints = test.questions.reduce((sum, q) => sum + q.points, 0);
          if (totalPoints > 0) {
            const percentage = (finalScore / totalPoints) * 100;
            studentScores[submission.studentId].totalPercentage += percentage;
            studentScores[submission.studentId].count++;
          }
        }
      }

      // Create rankings
      const calculatedRankings = Object.values(studentScores)
        .filter(s => s.count > 0) // Only include students who have taken tests
        .map(s => ({
          name: s.name,
          score: s.totalPercentage / s.count,
          avatarId: s.id, // Use student id as a seed for the avatar
        }))
        .sort((a, b) => b.score - a.score) // Sort by score descending
        .slice(0, 5) // Get top 5
        .map((s, index) => {
          let level: 'Advanced' | 'Intermediate' | 'Beginner';
          if (s.score >= 90) {
            level = 'Advanced';
          } else if (s.score >= 75) {
            level = 'Intermediate';
          } else {
            level = 'Beginner';
          }
          return {
            ...s,
            rank: index + 1,
            level: level,
          };
        });

      setRankings(calculatedRankings);
      setIsLoading(false);
    }
  }, [user]);

  if (isLoading) {
      return (
          <Card className="bg-card/70 backdrop-blur-sm">
            <CardHeader>
                <CardTitle>Community Rankings</CardTitle>
                <CardDescription>See how your students are performing against each other.</CardDescription>
            </CardHeader>
            <CardContent>
                <p>Loading rankings...</p>
            </CardContent>
          </Card>
      )
  }

  return (
    <Card className="bg-card/70 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Community Rankings</CardTitle>
        <CardDescription>Top 5 students based on average test scores.</CardDescription>
      </CardHeader>
      <CardContent>
        {rankings.length > 0 ? (
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead className="w-[50px]">Rank</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Level</TableHead>
                <TableHead className="text-right">Avg. Score</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {rankings.map((student) => (
                <TableRow key={student.rank}>
                    <TableCell className="font-medium">{student.rank}</TableCell>
                    <TableCell>
                    <div className="flex items-center gap-3">
                        <Avatar>
                        <AvatarImage src={`https://picsum.photos/seed/${student.avatarId}/40/40`} />
                        <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span>{student.name}</span>
                    </div>
                    </TableCell>
                    <TableCell>
                    <Badge variant={student.level === "Advanced" ? "default" : student.level === "Intermediate" ? "secondary" : "destructive"}>
                        {student.level}
                    </Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold">{student.score.toFixed(1)}%</TableCell>
                </TableRow>
                ))}
            </TableBody>
            </Table>
        ) : (
            <div className="text-center text-muted-foreground h-24 content-center">
                No rankings to display yet. Results will appear here once students complete your tests.
            </div>
        )}
      </CardContent>
    </Card>
  )
}
