"use client"

import { useAuth } from "@/hooks/use-auth"
import { Test } from "@/lib/types"
import { subDays, format, parseISO, eachDayOfInterval } from "date-fns"
import { TrendingUp } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

const TESTS_STORAGE_KEY = "exam-hub-tests";

const chartConfig = {
  tests: {
    label: "Tests",
    color: "hsl(var(--primary))",
  },
}

export default function ActivitiesChart() {
  const { user } = useAuth();
  const [chartData, setChartData] = useState<{ day: string, tests: number }[]>([]);

  useEffect(() => {
    if (user) {
      const allTestsJson = localStorage.getItem(TESTS_STORAGE_KEY);
      const allTests: Test[] = allTestsJson ? JSON.parse(allTestsJson) : [];
      const teacherTests = allTests.filter(t => t.teacherId === user.id);

      const endDate = new Date();
      const startDate = subDays(endDate, 6);
      const dateRange = eachDayOfInterval({ start: startDate, end: endDate });

      const activityByDay = dateRange.map(date => {
        const formattedDay = format(date, 'yyyy-MM-dd');
        const testsOnDay = teacherTests.filter(test => format(parseISO(test.createdAt), 'yyyy-MM-dd') === formattedDay).length;
        
        return {
          day: format(date, 'eee'),
          tests: testsOnDay,
        };
      });

      setChartData(activityByDay);
    }
  }, [user]);

  const totalTests = useMemo(() => chartData.reduce((sum, item) => sum + item.tests, 0), [chartData]);


  return (
    <Card className="bg-card/70 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Activities</CardTitle>
        <CardDescription>
          Showing tests created in the last 7 days.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis
                dataKey="tests"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                allowDecimals={false}
             />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Line
              dataKey="tests"
              type="natural"
              stroke="var(--color-tests)"
              strokeWidth={2}
              dot={true}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 font-medium leading-none">
              You created {totalTests} test(s) in the last 7 days.
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}
