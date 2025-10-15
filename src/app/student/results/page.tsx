
"use client";

import { useAuth } from "@/hooks/use-auth";
import { Submission, Test } from "@/lib/types";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Trophy, Clock, ListOrdered, Percent, ArrowRight } from "lucide-react";
import { format, parseISO } from "date-fns";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const TESTS_STORAGE_KEY = "exam-hub-tests";
const SUBMISSIONS_STORAGE_KEY = "exam-hub-submissions";

type EnrichedSubmission = Submission & {
  test: Test | null;
  percentage: number | null;
  finalScore: number;
};

export default function StudentResultsPage() {
  const { user } = useAuth();
  const [results, setResults] = useState<EnrichedSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const allSubmissionsJson = localStorage.getItem(SUBMISSIONS_STORAGE_KEY);
      const allSubmissions: Submission[] = allSubmissionsJson ? JSON.parse(allSubmissionsJson) : [];
      const studentSubmissions = allSubmissions.filter(s => s.studentId === user.id);

      const allTestsJson = localStorage.getItem(TESTS_STORAGE_KEY);
      const allTests: Test[] = allTestsJson ? JSON.parse(allTestsJson) : [];

      const enrichedSubmissions = studentSubmissions.map(submission => {
        const test = allTests.find(t => t.id === submission.testId) ?? null;
        let percentage: number | null = null;
        const finalScore = submission.gradedScore ?? submission.score ?? 0;
        
        if (test) {
          const totalPoints = test.questions.reduce((sum, q) => sum + q.points, 0);
          percentage = totalPoints > 0 ? (finalScore / totalPoints) * 100 : 0;
        }
        return { ...submission, test, percentage, finalScore };
      }).sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());

      setResults(enrichedSubmissions);
      setIsLoading(false);
    }
  }, [user]);

  if (isLoading) {
    return <p>Loading results...</p>;
  }

  return (
    <div className="container mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">My Results</h1>
        <p className="text-muted-foreground">Review your performance on past tests.</p>
      </div>

      {results.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/30 bg-card/50 py-24 text-center">
            <Trophy className="mb-4 h-16 w-16 text-muted-foreground" />
            <h2 className="text-2xl font-semibold">No Results Yet</h2>
            <p className="mt-2 text-muted-foreground">
                Your results will appear here after you complete a test.
            </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {results.map(result => (
            <Card key={result.id} className="flex flex-col bg-card/70 backdrop-blur-sm transition-shadow hover:shadow-lg hover:scale-105">
                <CardHeader>
                    <CardTitle className="line-clamp-2">{result.test?.title ?? "Test not found"}</CardTitle>
                    <CardDescription>Submitted on: {format(parseISO(result.submittedAt), "MMMM d, yyyy 'at' h:mm a")}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow space-y-3">
                    {result.test && (
                    <>
                        <div className="flex items-center text-sm text-muted-foreground">
                        <ListOrdered className="mr-2 h-4 w-4" />
                        <span>{result.test.questions.length} questions</span>
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="mr-2 h-4 w-4" />
                        <span>{result.test.duration} minutes duration</span>
                        </div>
                    </>
                    )}
                    {result.test && (
                    <div className="flex items-center text-sm font-semibold text-primary">
                        <Percent className="mr-2 h-4 w-4" />
                        <span>Score: {result.finalScore} / {result.test.questions.reduce((sum, q) => sum + q.points, 0)} ({result.percentage?.toFixed(1)}%)</span>
                    </div>
                    )}
                    {result.gradedScore === undefined && result.test?.questions.some(q => q.type !== 'mcq') &&
                        <Badge variant="outline">Awaiting manual grade</Badge>
                    }
                </CardContent>
                <CardFooter>
                    <Button asChild className="w-full">
                        <Link href={`/student/results/${result.id}`}>
                            View Details <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
