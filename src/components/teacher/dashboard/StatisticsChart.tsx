"use client"

import * as React from "react"
import { Pie, PieChart } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { useAuth } from "@/hooks/use-auth"
import { Test, Submission } from "@/lib/types"
import { useEffect, useState } from "react"

const TESTS_STORAGE_KEY = "exam-hub-tests";
const SUBMISSIONS_STORAGE_KEY = "exam-hub-submissions";
const PASSING_PERCENTAGE = 50; 

const chartConfig = {
  passed: {
    label: "Passed",
    color: "hsl(var(--primary))",
  },
  failed: {
    label: "Failed",
    color: "hsl(var(--destructive))",
  },
}

export default function StatisticsChart() {
  const { user } = useAuth();
  const [chartData, setChartData] = useState<{ stat: 'passed' | 'failed', value: number, fill: string }[]>([]);
  const [passedCount, setPassedCount] = useState(0);
  const [totalSubmissions, setTotalSubmissions] = useState(0);
  
  useEffect(() => {
    if (user) {
        const allTestsJson = localStorage.getItem(TESTS_STORAGE_KEY);
        const allTests: Test[] = allTestsJson ? JSON.parse(allTestsJson) : [];
        const teacherTests = allTests.filter(t => t.teacherId === user.id);
        const teacherTestIds = new Set(teacherTests.map(t => t.id));

        const allSubmissionsJson = localStorage.getItem(SUBMISSIONS_STORAGE_KEY);
        const allSubmissions: Submission[] = allSubmissionsJson ? JSON.parse(allSubmissionsJson) : [];
        const relevantSubmissions = allSubmissions.filter(s => teacherTestIds.has(s.testId));

        let passed = 0;
        
        relevantSubmissions.forEach(sub => {
            const test = teacherTests.find(t => t.id === sub.testId);
            if (!test) return;

            const totalPoints = test.questions.reduce((sum, q) => sum + q.points, 0);
            if (totalPoints === 0) return;

            const finalScore = sub.gradedScore ?? sub.score ?? 0;
            const percentage = (finalScore / totalPoints) * 100;

            if (percentage >= PASSING_PERCENTAGE) {
                passed++;
            }
        });

        const failed = relevantSubmissions.length - passed;
        setPassedCount(passed);
        setTotalSubmissions(relevantSubmissions.length);

        setChartData([
            { stat: "passed", value: passed, fill: "var(--color-passed)" },
            { stat: "failed", value: failed, fill: "var(--color-failed)" },
        ]);
    }
  }, [user]);

  const passedPercentage = totalSubmissions > 0 ? (passedCount / totalSubmissions) * 100 : 0;

  return (
    <Card className="flex flex-col bg-card/70 backdrop-blur-sm">
      <CardHeader className="items-center pb-0">
        <CardTitle>Statistics</CardTitle>
        <CardDescription>Pass/Fail rate for recent tests</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        {totalSubmissions > 0 ? (
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square max-h-[250px]"
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="stat"
                innerRadius={60}
                strokeWidth={5}
                startAngle={90}
                endAngle={450}
              >
              </Pie>
               <ChartLegend
                  content={<ChartLegendContent nameKey="stat" />}
                  className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/2 [&>*]:justify-center"
              />
            </PieChart>
          </ChartContainer>
        ) : (
          <div className="flex h-[250px] items-center justify-center text-muted-foreground">
            No data available yet.
          </div>
        )}
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        {totalSubmissions > 0 ? (
           <>
            <div className="flex items-center gap-2 font-medium leading-none">
                {passedPercentage.toFixed(0)}% of submissions passed their assessments.
            </div>
            <div className="leading-none text-muted-foreground">
                Based on {totalSubmissions} submission(s) across all your tests.
            </div>
           </>
        ) : (
            <div className="text-muted-foreground">Results will appear here once students complete your tests.</div>
        )}
      </CardFooter>
    </Card>
  )
}
