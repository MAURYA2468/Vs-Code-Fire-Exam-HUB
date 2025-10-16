
"use client";

import { useAuth } from "@/hooks/use-auth";
import { Submission, Test } from "@/lib/types";
import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Trophy, Clock, ListOrdered, Percent, ArrowRight, Star, TrendingUp } from "lucide-react";
import { format, parseISO } from "date-fns";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";


const TESTS_STORAGE_KEY = "exam-hub-tests";
const SUBMISSIONS_STORAGE_KEY = "exam-hub-submissions";

type GroupedResults = {
  test: Test;
  submissions: (Submission & { percentage: number | null, finalScore: number })[];
  bestSubmission: (Submission & { percentage: number | null, finalScore: number }) | null;
};

const chartConfig = {
  score: {
    label: "Score",
    color: "hsl(var(--primary))",
  },
};

const StudentProgressChart = ({ results }: { results: GroupedResults[] }) => {
    const chartData = useMemo(() => {
        if (!results || results.length === 0) return [];
        
        const dataPoints = results
            .filter(r => r.bestSubmission)
            .map(r => ({
                date: parseISO(r.bestSubmission!.submittedAt),
                testTitle: r.test.title,
                score: r.bestSubmission!.percentage ?? 0
            }));
            
        return dataPoints.sort((a,b) => a.date.getTime() - b.date.getTime());
    }, [results]);

    if (chartData.length === 0) return null;

    return (
         <Card className="bg-card/70 backdrop-blur-sm">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><TrendingUp /> Progress Over Time</CardTitle>
                <CardDescription>Your best percentage score on each test you've taken.</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="h-[250px] w-full">
                    <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                            dataKey="date" 
                            tickFormatter={(tick) => format(tick, 'MMM d')}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis 
                            tickFormatter={(tick) => `${tick}%`}
                             tickLine={false}
                            axisLine={false}
                        />
                        <ChartTooltip
                            content={({ active, payload, label }) =>
                                active && payload && payload.length ? (
                                <div className="rounded-lg border bg-background p-2 shadow-sm">
                                    <div className="grid grid-cols-1 gap-1.5">
                                        <span className="text-sm text-muted-foreground">{format(label, "PPP")}</span>
                                        {payload.map((item, index) => (
                                        <div key={index} className="flex items-center gap-2">
                                            <div className="flex flex-col">
                                                <span className="font-semibold">{item.payload.testTitle}</span>
                                                <span className="font-semibold text-primary">{item.value?.toFixed(1)}%</span>
                                            </div>
                                        </div>
                                        ))}
                                    </div>
                                </div>
                                ) : null
                            }
                            />
                        <Line type="monotone" dataKey="score" stroke="var(--color-score)" strokeWidth={2} dot={true} />
                    </LineChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}


export default function StudentResultsPage() {
  const { user } = useAuth();
  const [groupedResults, setGroupedResults] = useState<GroupedResults[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const allSubmissionsJson = localStorage.getItem(SUBMISSIONS_STORAGE_KEY);
      const allSubmissions: Submission[] = allSubmissionsJson ? JSON.parse(allSubmissionsJson) : [];
      const studentSubmissions = allSubmissions.filter(s => s.studentId === user.id);

      const allTestsJson = localStorage.getItem(TESTS_STORAGE_KEY);
      const allTests: Test[] = allTestsJson ? JSON.parse(allTestsJson) : [];
      
      const resultsByTest = new Map<string, GroupedResults>();

      for (const submission of studentSubmissions) {
          const test = allTests.find(t => t.id === submission.testId);
          if (!test) continue;

          let percentage: number | null = null;
          const finalScore = submission.gradedScore ?? submission.score ?? 0;
          const totalPoints = test.questions.reduce((sum, q) => sum + q.points, 0);
          percentage = totalPoints > 0 ? (finalScore / totalPoints) * 100 : 0;
          
          const enrichedSubmission = { ...submission, percentage, finalScore };

          if (!resultsByTest.has(test.id)) {
              resultsByTest.set(test.id, {
                  test: test,
                  submissions: [],
                  bestSubmission: null
              });
          }
          const group = resultsByTest.get(test.id)!;
          group.submissions.push(enrichedSubmission);
          
          if (!group.bestSubmission || enrichedSubmission.finalScore > group.bestSubmission.finalScore) {
              group.bestSubmission = enrichedSubmission;
          }
      }
      
      const sortedGroupedResults = Array.from(resultsByTest.values()).sort((a,b) => {
          const latestSubA = new Date(Math.max(...a.submissions.map(s => parseISO(s.submittedAt).getTime()))).getTime();
          const latestSubB = new Date(Math.max(...b.submissions.map(s => parseISO(s.submittedAt).getTime()))).getTime();
          return latestSubB - latestSubA;
      });

      setGroupedResults(sortedGroupedResults);
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
        <p className="text-muted-foreground">Review your performance on past tests. Your best attempt for each test is highlighted.</p>
      </div>

      {groupedResults.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/30 bg-card/50 py-24 text-center">
            <Trophy className="mb-4 h-16 w-16 text-muted-foreground" />
            <h2 className="text-2xl font-semibold">No Results Yet</h2>
            <p className="mt-2 text-muted-foreground">
                Your results will appear here after you complete a test.
            </p>
        </div>
      ) : (
        <div className="space-y-8">
          <StudentProgressChart results={groupedResults} />

          {groupedResults.map(({test, submissions, bestSubmission}) => (
            <Card key={test.id} className="bg-card/70 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="text-2xl">{test.title}</CardTitle>
                    <CardDescription>{test.description}</CardDescription>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-4">
                        {submissions.sort((a, b) => b.attemptNumber - a.attemptNumber).map(sub => (
                             <li key={sub.id} className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-lg border transition-all ${sub.id === bestSubmission?.id ? 'bg-primary/10 border-primary' : 'bg-background/50'}`}>
                                <div className="flex-1">
                                    <div className="flex items-center gap-3">
                                        <h3 className="font-semibold">Attempt #{sub.attemptNumber}</h3>
                                        {sub.id === bestSubmission?.id && (
                                            <Badge variant="default" className="gap-1"><Star className="h-3 w-3" /> Best</Badge>
                                        )}
                                        {sub.gradedScore === undefined && test.questions.some(q => q.type !== 'mcq') &&
                                            <Badge variant="outline">Awaiting manual grade</Badge>
                                        }
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-1">Submitted on: {format(parseISO(sub.submittedAt), "MMMM d, yyyy 'at' h:mm a")}</p>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="text-right">
                                        <p className="font-bold text-lg">{sub.finalScore} / {test.questions.reduce((sum, q) => sum + q.points, 0)}</p>
                                        <p className="text-sm text-muted-foreground">({sub.percentage?.toFixed(1)}%)</p>
                                    </div>
                                    <Button asChild size="sm">
                                        <Link href={`/student/results/${sub.id}`}>
                                            View Details <ArrowRight className="ml-2 h-4 w-4" />
                                        </Link>
                                    </Button>
                                </div>
                             </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
