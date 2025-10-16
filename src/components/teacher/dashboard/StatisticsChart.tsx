"use client"

import * as React from "react"
import { Pie, PieChart } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

const chartData = [
  { stat: "passed", value: 82, fill: "var(--color-passed)" },
  { stat: "failed", value: 18, fill: "var(--color-failed)" },
]

const chartConfig = {
  passed: {
    label: "Passed",
    color: "hsl(var(--primary))",
  },
  failed: {
    label: "Failed",
    color: "hsl(var(--accent))",
  },
}

export default function StatisticsChart() {
  const totalValue = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.value, 0)
  }, [])

  return (
    <Card className="flex flex-col bg-card/70 backdrop-blur-sm">
      <CardHeader className="items-center pb-0">
        <CardTitle>Statistics</CardTitle>
        <CardDescription>Pass/Fail rate for recent tests</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
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
            >
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <div className="flex-1 p-6 pt-0 text-center text-sm text-muted-foreground">
        Showing total pass/fail rates for all students.
      </div>
    </Card>
  )
}
