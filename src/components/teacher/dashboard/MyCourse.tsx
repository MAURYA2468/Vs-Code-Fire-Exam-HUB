
"use client";

import { Card, CardContent } from "@/components/ui/card"
import { PlaceHolderImages } from "@/lib/placeholder-images"
import Image from "next/image"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import { Test, Submission, User } from "@/lib/types";
import { Book } from "lucide-react";

const TESTS_STORAGE_KEY = "exam-hub-tests";
const SUBMISSIONS_STORAGE_KEY = "exam-hub-submissions";
const USERS_STORAGE_KEY = "exam-hub-users";

export default function MyCourse() {
    const { user } = useAuth();
    const [latestTest, setLatestTest] = useState<Test | null>(null);
    const [progress, setProgress] = useState(0);
    const [enrolledStudents, setEnrolledStudents] = useState<User[]>([]);
    const [totalStudentCount, setTotalStudentCount] = useState(0);

    const courseImage = PlaceHolderImages.find(p => p.id === "course-thumbnail");
    
    useEffect(() => {
        if(user) {
            const allTestsJson = localStorage.getItem(TESTS_STORAGE_KEY);
            const allTests: Test[] = allTestsJson ? JSON.parse(allTestsJson) : [];
            const teacherTests = allTests.filter(t => t.teacherId === user.id)
                .sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

            if (teacherTests.length === 0) {
                setLatestTest(null);
                return;
            }

            const latest = teacherTests[0];
            setLatestTest(latest);

            const allSubmissionsJson = localStorage.getItem(SUBMISSIONS_STORAGE_KEY);
            const allSubmissions: Submission[] = allSubmissionsJson ? JSON.parse(allSubmissionsJson) : [];
            const submissionsForTest = allSubmissions.filter(s => s.testId === latest.id);
            const enrolledStudentIds = new Set(submissionsForTest.map(s => s.studentId));

            const allUsersJson = localStorage.getItem(USERS_STORAGE_KEY);
            const allUsers: User[] = allUsersJson ? JSON.parse(allUsersJson) : [];
            const students = allUsers.filter(u => u.role === 'student');
            setTotalStudentCount(students.length);
            
            const enrolled = students.filter(s => enrolledStudentIds.has(s.id));
            setEnrolledStudents(enrolled);

            if (students.length > 0) {
                setProgress((enrolled.length / students.length) * 100);
            } else {
                setProgress(0);
            }
        }
    }, [user]);

    if (!latestTest) {
        return (
             <Card className="bg-card/70 backdrop-blur-sm overflow-hidden">
                <CardContent className="p-6 text-center flex flex-col justify-center items-center h-full">
                     <Book className="h-12 w-12 text-muted-foreground mb-4" />
                     <h3 className="font-bold text-lg">No Tests Created Yet</h3>
                     <p className="text-sm text-muted-foreground mt-1">Create your first test to see it here.</p>
                </CardContent>
            </Card>
        )
    }

    const displayedAvatars = enrolledStudents.slice(0, 3);
    const remainingCount = enrolledStudents.length > 3 ? enrolledStudents.length - 3 : 0;

    return (
        <Card className="bg-card/70 backdrop-blur-sm overflow-hidden">
            <div className="relative h-40 w-full">
                {courseImage && (
                    <Image
                        src={courseImage.imageUrl}
                        alt={latestTest.title}
                        fill
                        className="object-cover"
                        data-ai-hint={courseImage.imageHint}
                    />
                )}
            </div>
            <CardContent className="p-6">
                <h3 className="font-bold text-lg truncate">{latestTest.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{latestTest.questions.length} Questions | {latestTest.duration} minutes</p>
                <div className="mt-4">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-semibold">Progress</span>
                        <span className="text-xs font-semibold">{progress.toFixed(0)}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                </div>
                 <div className="mt-4 flex items-center justify-between">
                    <div className="flex -space-x-2">
                        {displayedAvatars.map(student => (
                            <Avatar key={student.id} className="border-2 border-background">
                                <AvatarImage src={`/images/student-avatar-${student.id}.jpg`} alt={student.name} />
                                <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                        ))}
                         {remainingCount > 0 && (
                            <Avatar className="border-2 border-background">
                                <AvatarFallback>+{remainingCount}</AvatarFallback>
                            </Avatar>
                         )}
                    </div>
                     <span className="text-sm font-medium text-muted-foreground">{enrolledStudents.length} of {totalStudentCount} students started</span>
                 </div>
            </CardContent>
        </Card>
    )
}
