import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import Link from "next/link"

interface DashboardHeaderProps {
    userName: string;
}

export default function DashboardHeader({ userName }: DashboardHeaderProps) {
  return (
    <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, {userName}!</h1>
          <p className="text-muted-foreground">Here's a summary of your activity.</p>
        </div>
        <Button asChild size="lg">
          <Link href="/teacher/tests/create">
            <PlusCircle className="mr-2 h-5 w-5" />
            Create New Test
          </Link>
        </Button>
      </div>
  )
}
