import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const rankings = [
  { rank: 1, name: "Liam Johnson", score: 98.2, level: "Advanced", avatarId: "liam-johnson" },
  { rank: 2, name: "Olivia Smith", score: 95.5, level: "Advanced", avatarId: "olivia-smith" },
  { rank: 3, name: "Noah Williams", score: 92.1, level: "Intermediate", avatarId: "noah-williams" },
  { rank: 4, name: "Emma Brown", score: 89.7, level: "Intermediate", avatarId: "emma-brown" },
  { rank: 5, name: "Ava Jones", score: 85.3, level: "Beginner", avatarId: "ava-jones" },
]

export default function CommunityRankings() {
  return (
    <Card className="bg-card/70 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Community Rankings</CardTitle>
        <CardDescription>See how your students are performing against each other.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">Rank</TableHead>
              <TableHead>Student</TableHead>
              <TableHead>Level</TableHead>
              <TableHead className="text-right">Avg. Score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rankings.map((student) => (
              <TableRow key={student.rank}>
                <TableCell className="font-medium">{student.rank}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={`https://picsum.photos/seed/${student.avatarId}/40/40`} />
                      <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span>{student.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={student.level === "Advanced" ? "default" : student.level === "Intermediate" ? "secondary" : "outline"}>
                    {student.level}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-semibold">{student.score.toFixed(1)}%</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
