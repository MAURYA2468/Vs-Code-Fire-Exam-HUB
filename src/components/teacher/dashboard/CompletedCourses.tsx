import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, Clock } from "lucide-react"

const courses = [
  { name: "Biology Basics", status: "Completed", progress: 100 },
  { name: "Advanced Algebra", status: "Completed", progress: 100 },
  { name: "History of Science", status: "In Progress", progress: 60 },
]

export default function CompletedCourses() {
  return (
    <Card className="bg-card/70 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Completed Courses</CardTitle>
        <CardDescription>An overview of recently finished test cycles.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {courses.map((course, index) => (
          <div key={index} className="flex items-center">
            {course.status === "Completed" ? (
                <CheckCircle className="h-5 w-5 text-green-500 mr-4" />
            ) : (
                <Clock className="h-5 w-5 text-yellow-500 mr-4" />
            )}
            <div className="flex-grow">
              <p className="font-medium">{course.name}</p>
              <Progress value={course.progress} className="h-2 mt-1" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
