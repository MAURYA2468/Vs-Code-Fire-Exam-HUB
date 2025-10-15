import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, BookUser, School } from 'lucide-react';
import Logo from '@/components/Logo';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function Home() {
  const heroImage = PlaceHolderImages.find(p => p.id === 'home-hero');
  
  return (
    <div className="flex flex-1 items-center justify-center p-4">
      <div className="container mx-auto grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
        <div className="text-center lg:text-left">
          <div className="mb-8 flex justify-center lg:justify-start">
            <Logo />
          </div>
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground md:text-6xl">
            Welcome to Exam HUB
          </h1>
          <p className="mb-10 text-lg text-muted-foreground md:text-xl">
            Exam HUB is your all-in-one platform for digital examinations. Teachers can effortlessly create, distribute, and grade tests, while students can take them in a secure and intuitive environment. With robust offline capabilities, Exam HUB ensures a smooth testing experience for everyone, anytime, anywhere.
          </p>

          <div className="mx-auto grid max-w-md grid-cols-1 gap-8 lg:mx-0 lg:max-w-none">
            <Card className="border-2 border-primary/10 bg-card/50 shadow-lg backdrop-blur-sm transition-all hover:border-primary/30 hover:shadow-primary/10 hover:scale-105">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <BookUser className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-2xl font-semibold text-foreground">
                    Teacher Portal
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="mb-6 text-muted-foreground">
                  Create and manage tests, track student performance, and generate reports.
                </p>
                <Button asChild size="lg" className="w-full">
                  <Link href="/login/teacher">
                    Enter Teacher Portal <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
            
            <Card className="border-2 border-primary/10 bg-card/50 shadow-lg backdrop-blur-sm transition-all hover:border-primary/30 hover:shadow-primary/10 hover:scale-105">
              <CardHeader>
                 <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <School className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-2xl font-semibold text-foreground">
                      Student Portal
                    </CardTitle>
                 </div>
              </CardHeader>
              <CardContent>
                <p className="mb-6 text-muted-foreground">
                  Access and complete your assigned tests within the designated time.
                </p>
                <Button asChild size="lg" className="w-full">
                  <Link href="/login/student">
                    Enter Student Portal <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
        {heroImage && (
          <div className="relative hidden h-[600px] w-full lg:block">
            <Image
              src={heroImage.imageUrl}
              alt={heroImage.description}
              fill
              className="rounded-2xl object-cover shadow-2xl"
              data-ai-hint={heroImage.imageHint}
            />
          </div>
        )}
      </div>
    </div>
  );
}
