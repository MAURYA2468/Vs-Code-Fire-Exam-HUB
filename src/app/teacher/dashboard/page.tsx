"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TeacherDashboard() {
  const { user } = useAuth();

  return (
    <div className="container mx-auto">
      <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome, {user?.name}!</h1>
          <p className="text-muted-foreground">Ready to build the next one?</p>
        </div>
        <Button asChild size="lg">
          <Link href="/teacher/tests/create">
            <PlusCircle className="mr-2 h-5 w-5" />
            Create New Test
          </Link>
        </Button>
      </div>

      <Card className="bg-card/70 backdrop-blur-sm">
        <CardHeader>
            <CardTitle>What's Next?</CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground">You can manage your tests from the 'Tests' menu or create a new one.</p>
        </CardContent>
      </Card>
    </div>
  );
}
