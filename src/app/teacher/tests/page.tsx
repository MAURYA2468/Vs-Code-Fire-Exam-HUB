
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { Test } from "@/lib/types";
import { PlusCircle, Clock, ListOrdered, ArrowRight, Edit } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { format, parseISO } from 'date-fns';

const TESTS_STORAGE_KEY = "exam-hub-tests";

export default function TeacherTestsPage() {
  const { user } = useAuth();
  const [tests, setTests] = useState<Test[]>([]);

  useEffect(() => {
    if (user) {
      const allTestsJson = localStorage.getItem(TESTS_STORAGE_KEY);
      const allTests: Test[] = allTestsJson ? JSON.parse(allTestsJson) : [];
      const teacherTests = allTests.filter(t => t.teacherId === user.id).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setTests(teacherTests);
    }
  }, [user]);

  return (
    <div className="container mx-auto">
      <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your Tests</h1>
          <p className="text-muted-foreground">Here are the tests you've created. Ready to build the next one?</p>
        </div>
        <Button asChild size="lg">
          <Link href="/teacher/tests/create">
            <PlusCircle className="mr-2 h-5 w-5" />
            Create New Test
          </Link>
        </Button>
      </div>

      {tests.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/30 bg-card/50 py-24 text-center">
          <h2 className="text-2xl font-semibold">No Tests Yet!</h2>
          <p className="mt-2 text-muted-foreground">
            Click the "Create New Test" button to get started.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {tests.map(test => (
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
              <CardFooter className="flex flex-col items-stretch">
                <p className="mb-4 self-start text-xs text-muted-foreground">
                  Created on: {format(parseISO(test.createdAt), "MMMM d, yyyy")}
                </p>
                <div className="flex w-full gap-2">
                  <Button asChild className="flex-1" variant="outline">
                    <Link href={`/teacher/tests/${test.id}/edit`}>
                      <Edit className="mr-2 h-4 w-4" /> Edit
                    </Link>
                  </Button>
                  <Button asChild className="flex-1">
                    <Link href={`/teacher/tests/${test.id}/results`}>
                      View Results <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
