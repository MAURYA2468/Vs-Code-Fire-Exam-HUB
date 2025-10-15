"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { Test } from "@/lib/types";
import { ArrowRight, Clock, ListOrdered, School } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const TESTS_STORAGE_KEY = "offline-exam-pro-tests";

export default function StudentDashboard() {
  const { user } = useAuth();
  const [availableTests, setAvailableTests] = useState<Test[]>([]);

  useEffect(() => {
    // In a real app, you'd filter tests assigned to the student.
    // For this app, all tests are available to all students.
    const allTestsJson = localStorage.getItem(TESTS_STORAGE_KEY);
    const allTests: Test[] = allTestsJson ? JSON.parse(allTestsJson) : [];
    setAvailableTests(allTests);
  }, []);

  return (
    <div className="container mx-auto">
       <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Welcome, {user?.name}!</h1>
        <p className="text-muted-foreground">Here are the tests available for you to take. Good luck!</p>
      </div>

      {availableTests.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/30 bg-card/50 py-24 text-center">
            <School className="mb-4 h-16 w-16 text-muted-foreground" />
            <h2 className="text-2xl font-semibold">No Tests Available</h2>
            <p className="mt-2 text-muted-foreground">
                There are currently no tests assigned to you. Please check back later.
            </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {availableTests.map(test => (
                <Card key={test.id} className="flex flex-col bg-card/70 backdrop-blur-sm transition-transform hover:scale-105 hover:shadow-lg">
                <CardHeader>
                    <CardTitle className="line-clamp-2">{test.title}</CardTitle>
                    <CardDescription className="line-clamp-3">{test.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                    <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="mr-2 h-4 w-4" />
                        <span>{test.duration} minutes</span>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-muted-foreground">
                        <ListOrdered className="mr-2 h-4 w-4" />
                        <span>{test.questions.length} questions</span>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button asChild className="w-full" variant="secondary" >
                        <Link href={`/student/tests/${test.id}`}>
                            Start Test <ArrowRight className="ml-2 h-4 w-4" />
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
