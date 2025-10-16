import { Card, CardContent } from "@/components/ui/card"
import { PlaceHolderImages } from "@/lib/placeholder-images"
import Image from "next/image"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function MyCourse() {
    const courseImage = PlaceHolderImages.find(p => p.id === "course-thumbnail");
    const avatars = [
        PlaceHolderImages.find(p => p.id === "liam-johnson"),
        PlaceHolderImages.find(p => p.id === "olivia-smith"),
        PlaceHolderImages.find(p => p.id === "noah-williams"),
    ]

    return (
        <Card className="bg-card/70 backdrop-blur-sm overflow-hidden">
            <div className="relative h-40 w-full">
                {courseImage && (
                    <Image
                        src={courseImage.imageUrl}
                        alt={courseImage.description}
                        fill
                        className="object-cover"
                        data-ai-hint={courseImage.imageHint}
                    />
                )}
            </div>
            <CardContent className="p-6">
                <h3 className="font-bold text-lg">Modern Physics Final</h3>
                <p className="text-sm text-muted-foreground mt-1">25 Questions | 1 hour</p>
                <div className="mt-4">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-semibold">Progress</span>
                        <span className="text-xs font-semibold">75%</span>
                    </div>
                    <Progress value={75} className="h-2" />
                </div>
                 <div className="mt-4 flex items-center justify-between">
                    <div className="flex -space-x-2">
                        {avatars.map(avatar => avatar && (
                            <Avatar key={avatar.id} className="border-2 border-background">
                                <AvatarImage src={avatar.imageUrl} alt={avatar.description} />
                                <AvatarFallback>{avatar.description.charAt(0)}</AvatarFallback>
                            </Avatar>
                        ))}
                         <Avatar className="border-2 border-background">
                            <AvatarFallback>+12</AvatarFallback>
                        </Avatar>
                    </div>
                     <span className="text-sm font-medium text-muted-foreground">15 students enrolled</span>
                 </div>
            </CardContent>
        </Card>
    )
}
