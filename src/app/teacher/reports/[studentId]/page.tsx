
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { User } from "@/lib/types";
import { useEffect, useState } from "react";

const USERS_STORAGE_KEY = "exam-hub-users";

export default function StudentReportPage({ params }: { params: { studentId: string } }) {
    const [student, setStudent] = useState<User | null>(null);

    useEffect(() => {
        const allUsersJson = localStorage.getItem(USERS_STORAGE_KEY);
        const allUsers: User[] = allUsersJson ? JSON.parse(allUsersJson) : [];
        const foundStudent = allUsers.find(u => u.id === params.studentId);
        setStudent(foundStudent || null);
    }, [params.studentId]);

  return (
    <div className="container mx-auto">
        <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Student Report</h1>
            {student && <p className="text-muted-foreground">Detailed view for {student.name}</p>}
        </div>
      
        <Card>
            <CardHeader>
                <CardTitle>{student?.name}</CardTitle>
                <CardDescription>
                    Register Number: {student?.registerNumber || 'N/A'}
                    <br />
                    Email: {student?.email}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p>Detailed analytics and test history for this student will be displayed here.</p>
            </CardContent>
        </Card>
    </div>
  );
}
