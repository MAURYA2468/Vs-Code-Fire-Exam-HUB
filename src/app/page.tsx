import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, BookUser, School } from 'lucide-react';
import Logo from '@/components/Logo';

export default function Home() {
  return (
    <div className="flex flex-1 items-center justify-center p-4">
      <div className="mx-auto w-full max-w-4xl text-center">
        <div className="mb-12 flex justify-center">
          <Logo />
        </div>
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground md:text-6xl">
          Welcome to OfflineExamPro
        </h1>
        <p className="mb-10 text-lg text-muted-foreground md:text-xl">
          The seamless solution for creating, managing, and taking exams offline.
        </p>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <Card className="border-2 border-primary/10 bg-card/50 shadow-lg backdrop-blur-sm transition-all hover:border-primary/30 hover:shadow-primary/10">
            <CardHeader>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                <BookUser className="h-8 w-8" />
              </div>
              <CardTitle className="text-2xl font-semibold text-foreground">
                Teacher Portal
              </CardTitle>
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
          
          <Card className="border-2 border-primary/10 bg-card/50 shadow-lg backdrop-blur-sm transition-all hover:border-primary/30 hover:shadow-primary/10">
            <CardHeader>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                <School className="h-8 w-8" />
              </div>
              <CardTitle className="text-2xl font-semibold text-foreground">
                Student Portal
              </CardTitle>
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
    </div>
  );
}
